import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

router.get("/conversations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const convs = await db.select().from(conversations)
      .where(eq(conversations.userId, req.userId!))
      .orderBy(desc(conversations.updatedAt));
    res.json(convs.map(c => ({
      id: c.id,
      userId: c.userId,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })));
  } catch (error) {
    req.log.error({ error }, "Failed to list AI conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title } = req.body;
    const [conv] = await db.insert(conversations).values({
      userId: req.userId!,
      title: title || "New Conversation",
    }).returning();
    res.status(201).json({
      id: conv.id,
      userId: conv.userId,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    });
  } catch (error) {
    req.log.error({ error }, "Failed to create AI conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const msgs = await db.select().from(messages)
      .where(eq(messages.conversationId, parseInt(req.params.id)))
      .orderBy(messages.createdAt);
    res.json(msgs.map(m => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (error) {
    req.log.error({ error }, "Failed to get AI messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    const convId = parseInt(req.params.id);

    // Save user message
    await db.insert(messages).values({
      conversationId: convId,
      role: "user",
      content,
    });

    // Fetch history
    const history = await db.select().from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(messages.createdAt);

    const chatMessages = history.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Set up SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content: "You are TechVerse AI, an intelligent assistant for a developer ecosystem platform. You help developers with technical questions, project planning, code reviews, career advice, and platform navigation. Be helpful, concise, and technically accurate.",
        },
        ...chatMessages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    // Save assistant message
    await db.insert(messages).values({
      conversationId: convId,
      role: "assistant",
      content: fullResponse,
    });

    // Update conversation timestamp
    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, convId));

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    req.log.error({ error }, "Failed to send AI message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default router;
