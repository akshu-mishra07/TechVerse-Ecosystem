import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { serviceId, userId } = req.query;
    let reviews;
    if (serviceId) {
      reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.serviceId, parseInt(serviceId as string))).orderBy(desc(reviewsTable.createdAt));
    } else if (userId) {
      reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.reviewerId, userId as string)).orderBy(desc(reviewsTable.createdAt));
    } else {
      reviews = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    }
    const enriched = await Promise.all(reviews.map(async (r) => {
      const reviewer = await db.select().from(usersTable).where(eq(usersTable.clerkId, r.reviewerId)).limit(1);
      return {
        ...r,
        reviewerName: reviewer[0]?.name ?? "Unknown",
        reviewerAvatar: reviewer[0]?.avatar ?? null,
      };
    }));
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to list reviews");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { serviceId, bookingId, rating, comment } = req.body;
    const [review] = await db.insert(reviewsTable).values({
      serviceId,
      bookingId,
      reviewerId: req.userId!,
      rating,
      comment,
    }).returning();
    const reviewer = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId!)).limit(1);
    res.status(201).json({
      ...review,
      reviewerName: reviewer[0]?.name ?? "Unknown",
      reviewerAvatar: reviewer[0]?.avatar ?? null,
    });
  } catch (error) {
    req.log.error({ error }, "Failed to create review");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
