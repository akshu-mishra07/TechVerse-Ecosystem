import { Router } from "express";
import { db, bookingsTable, servicesTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

async function enrichBooking(booking: typeof bookingsTable.$inferSelect) {
  const service = await db.select().from(servicesTable).where(eq(servicesTable.id, booking.serviceId)).limit(1);
  const client = await db.select().from(usersTable).where(eq(usersTable.clerkId, booking.clientId)).limit(1);
  const provider = await db.select().from(usersTable).where(eq(usersTable.clerkId, booking.providerId)).limit(1);
  return {
    ...booking,
    price: parseFloat(booking.price as unknown as string),
    serviceTitle: service[0]?.title ?? "Unknown Service",
    clientName: client[0]?.name ?? "Unknown",
    clientAvatar: client[0]?.avatar ?? null,
    providerName: provider[0]?.name ?? "Unknown",
    providerAvatar: provider[0]?.avatar ?? null,
    scheduledAt: booking.scheduledAt?.toISOString() ?? null,
    completedAt: booking.completedAt?.toISOString() ?? null,
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { role, status } = req.query as Record<string, string>;
    let bookings;
    if (role === "provider") {
      bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.providerId, req.userId!)).orderBy(desc(bookingsTable.createdAt));
    } else if (role === "client") {
      bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.clientId, req.userId!)).orderBy(desc(bookingsTable.createdAt));
    } else {
      bookings = await db.select().from(bookingsTable)
        .where(or(eq(bookingsTable.clientId, req.userId!), eq(bookingsTable.providerId, req.userId!)))
        .orderBy(desc(bookingsTable.createdAt));
    }
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }
    const enriched = await Promise.all(bookings.map(enrichBooking));
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to list bookings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { serviceId, requirements, scheduledAt } = req.body;
    const service = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId)).limit(1);
    if (service.length === 0) return res.status(404).json({ error: "Service not found" });
    const [booking] = await db.insert(bookingsTable).values({
      serviceId,
      clientId: req.userId!,
      providerId: service[0].userId,
      status: "pending",
      price: service[0].price,
      requirements,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    }).returning();
    // Create notification for provider
    await db.insert(notificationsTable).values({
      userId: service[0].userId,
      type: "booking_new",
      title: "New Booking Request",
      message: `You have a new booking request for "${service[0].title}"`,
      link: `/bookings`,
    });
    const enriched = await enrichBooking(booking);
    res.status(201).json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to create booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:bookingId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const booking = await db.select().from(bookingsTable).where(eq(bookingsTable.id, parseInt(req.params.bookingId))).limit(1);
    if (booking.length === 0) return res.status(404).json({ error: "Booking not found" });
    const enriched = await enrichBooking(booking[0]);
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to get booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:bookingId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const updates: Record<string, unknown> = { status };
    if (status === "completed") updates.completedAt = new Date();
    const [updated] = await db.update(bookingsTable)
      .set(updates)
      .where(eq(bookingsTable.id, parseInt(req.params.bookingId)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Booking not found" });
    // Create notification for client
    await db.insert(notificationsTable).values({
      userId: updated.clientId,
      type: "booking_update",
      title: "Booking Status Updated",
      message: `Your booking status has been updated to: ${status}`,
      link: `/bookings`,
    });
    const enriched = await enrichBooking(updated);
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to update booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
