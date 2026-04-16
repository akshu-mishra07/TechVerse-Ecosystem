import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

async function ensureUser(clerkId: string, name: string, email: string, avatar?: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(usersTable).values({
    clerkId,
    name: name || "TechVerse User",
    email: email || "",
    avatar: avatar || null,
    skills: [],
    isAdmin: false,
  }).returning();
  return created;
}

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId!)).limit(1);
    if (user.length === 0) {
      const newUser = await ensureUser(req.userId!, "New User", "");
      return res.json(newUser);
    }
    res.json(user[0]);
  } catch (error) {
    req.log.error({ error }, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, bio, avatar, location, website, github, linkedin, skills } = req.body;
    const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId!)).limit(1);
    if (existing.length === 0) {
      const newUser = await ensureUser(req.userId!, name || "New User", "");
      return res.json(newUser);
    }
    const [updated] = await db.update(usersTable)
      .set({ name, bio, avatar, location, website, github, linkedin, skills })
      .where(eq(usersTable.clerkId, req.userId!))
      .returning();
    res.json(updated);
  } catch (error) {
    req.log.error({ error }, "Failed to update user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { projectsTable, servicesTable, bookingsTable, reviewsTable } = await import("@workspace/db");
    const { count } = await import("drizzle-orm");
    const [projectCount] = await db.select({ count: count() }).from(projectsTable).where(eq(projectsTable.userId, req.userId!));
    const [serviceCount] = await db.select({ count: count() }).from(servicesTable).where(eq(servicesTable.userId, req.userId!));
    const [bookingCount] = await db.select({ count: count() }).from(bookingsTable).where(eq(bookingsTable.clientId, req.userId!));
    const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.reviewerId, req.userId!));
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({
      totalProjects: Number(projectCount?.count ?? 0),
      totalServices: Number(serviceCount?.count ?? 0),
      totalBookings: Number(bookingCount?.count ?? 0),
      totalEarnings: 0,
      averageRating: avgRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    req.log.error({ error }, "Failed to get user stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.params.userId)).limit(1);
    if (user.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(user[0]);
  } catch (error) {
    req.log.error({ error }, "Failed to get user by id");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { ensureUser };
export default router;
