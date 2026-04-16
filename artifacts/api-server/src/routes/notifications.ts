import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { unreadOnly } = req.query;
    let notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, req.userId!))
      .orderBy(desc(notificationsTable.createdAt));
    if (unreadOnly === "true") {
      notifications = notifications.filter(n => !n.isRead);
    }
    res.json(notifications);
  } catch (error) {
    req.log.error({ error }, "Failed to list notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/read-all", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, req.userId!));
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "Failed to mark all notifications read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:notificationId/read", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [updated] = await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, parseInt(req.params.notificationId)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.json(updated);
  } catch (error) {
    req.log.error({ error }, "Failed to mark notification read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
