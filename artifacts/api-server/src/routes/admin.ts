import { Router } from "express";
import { db, usersTable, projectsTable, servicesTable, bookingsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable);
    const projects = await db.select().from(projectsTable);
    const services = await db.select().from(servicesTable);
    const bookings = await db.select().from(bookingsTable);

    const bookingsByStatus = bookings.reduce((acc: Record<string, number>, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = bookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + parseFloat(b.price as unknown as string), 0);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newUsersThisMonth = users.filter(u => u.createdAt > oneMonthAgo).length;

    res.json({
      totalUsers: users.length,
      totalProjects: projects.length,
      totalServices: services.length,
      totalBookings: bookings.length,
      totalRevenue,
      activeUsers: users.length,
      newUsersThisMonth,
      bookingsByStatus,
    });
  } catch (error) {
    req.log.error({ error }, "Failed to get admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { limit = "20", offset = "0" } = req.query as Record<string, string>;
    const users = await db.select().from(usersTable)
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy(desc(usersTable.createdAt));
    res.json(users);
  } catch (error) {
    req.log.error({ error }, "Failed to list admin users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/recent-activity", requireAuth, async (req: AuthRequest, res) => {
  try {
    const recentUsers = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(5);
    const recentProjects = await db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt)).limit(5);
    const recentBookings = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt)).limit(5);

    const activities = [
      ...recentUsers.map((u, i) => ({
        id: i + 1,
        type: "user_joined",
        description: `${u.name} joined TechVerse`,
        userId: u.clerkId,
        userName: u.name,
        createdAt: u.createdAt.toISOString(),
      })),
      ...recentProjects.map((p, i) => ({
        id: 100 + i,
        type: "project_created",
        description: `New project "${p.title}" was published`,
        userId: p.userId,
        userName: "Developer",
        createdAt: p.createdAt.toISOString(),
      })),
      ...recentBookings.map((b, i) => ({
        id: 200 + i,
        type: "booking_created",
        description: `New booking request created`,
        userId: b.clientId,
        userName: "Client",
        createdAt: b.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    res.json(activities);
  } catch (error) {
    req.log.error({ error }, "Failed to get recent activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
