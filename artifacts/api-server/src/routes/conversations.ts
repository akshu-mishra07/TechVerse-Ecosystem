import { Router } from "express";
import { db, chatConversationsTable, chatMessagesTable, usersTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const convs = await db.select().from(chatConversationsTable)
      .where(or(eq(chatConversationsTable.user1Id, req.userId!), eq(chatConversationsTable.user2Id, req.userId!)))
      .orderBy(desc(chatConversationsTable.lastMessageAt));
    const enriched = await Promise.all(convs.map(async (c) => {
      const participantId = c.user1Id === req.userId ? c.user2Id : c.user1Id;
      const participant = await db.select().from(usersTable).where(eq(usersTable.clerkId, participantId)).limit(1);
      const unread = await db.select().from(chatMessagesTable)
        .where(eq(chatMessagesTable.conversationId, c.id));
      return {
        id: c.id,
        participantId,
        participantName: participant[0]?.name ?? "Unknown",
        participantAvatar: participant[0]?.avatar ?? null,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
        unreadCount: 0,
        createdAt: c.createdAt.toISOString(),
      };
    }));
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to list conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { participantId } = req.body;
    // Check if conversation already exists
    const existing = await db.select().from(chatConversationsTable)
      .where(or(
        eq(chatConversationsTable.user1Id, req.userId!),
        eq(chatConversationsTable.user2Id, req.userId!)
      ));
    const found = existing.find(c =>
      (c.user1Id === req.userId && c.user2Id === participantId) ||
      (c.user2Id === req.userId && c.user1Id === participantId)
    );
    if (found) {
      const participant = await db.select().from(usersTable).where(eq(usersTable.clerkId, participantId)).limit(1);
      return res.status(201).json({
        id: found.id,
        participantId,
        participantName: participant[0]?.name ?? "Unknown",
        participantAvatar: participant[0]?.avatar ?? null,
        lastMessage: found.lastMessage,
        lastMessageAt: found.lastMessageAt?.toISOString() ?? null,
        unreadCount: 0,
        createdAt: found.createdAt.toISOString(),
      });
    }
    const [conv] = await db.insert(chatConversationsTable).values({
      user1Id: req.userId!,
      user2Id: participantId,
    }).returning();
    const participant = await db.select().from(usersTable).where(eq(usersTable.clerkId, participantId)).limit(1);
    res.status(201).json({
      id: conv.id,
      participantId,
      participantName: participant[0]?.name ?? "Unknown",
      participantAvatar: participant[0]?.avatar ?? null,
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: 0,
      createdAt: conv.createdAt.toISOString(),
    });
  } catch (error) {
    req.log.error({ error }, "Failed to create conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:conversationId/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const messages = await db.select().from(chatMessagesTable)
      .where(eq(chatMessagesTable.conversationId, parseInt(req.params.conversationId)))
      .orderBy(chatMessagesTable.createdAt);
    const enriched = await Promise.all(messages.map(async (m) => {
      const sender = await db.select().from(usersTable).where(eq(usersTable.clerkId, m.senderId)).limit(1);
      return {
        ...m,
        senderName: sender[0]?.name ?? "Unknown",
        senderAvatar: sender[0]?.avatar ?? null,
      };
    }));
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to list messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:conversationId/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    const [message] = await db.insert(chatMessagesTable).values({
      conversationId: parseInt(req.params.conversationId),
      senderId: req.userId!,
      content,
    }).returning();
    // Update last message
    await db.update(chatConversationsTable)
      .set({ lastMessage: content, lastMessageAt: new Date() })
      .where(eq(chatConversationsTable.id, parseInt(req.params.conversationId)));
    const sender = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId!)).limit(1);
    res.status(201).json({
      ...message,
      senderName: sender[0]?.name ?? "Unknown",
      senderAvatar: sender[0]?.avatar ?? null,
    });
  } catch (error) {
    req.log.error({ error }, "Failed to send message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
