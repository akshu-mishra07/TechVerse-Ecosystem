import { Router } from "express";
import { db, servicesTable, usersTable, reviewsTable } from "@workspace/db";
import { eq, desc, avg, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

async function enrichService(service: typeof servicesTable.$inferSelect) {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, service.userId)).limit(1);
  const reviews = await db.select({ rating: reviewsTable.rating }).from(reviewsTable).where(eq(reviewsTable.serviceId, service.id));
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return {
    ...service,
    price: parseFloat(service.price as unknown as string),
    tags: Array.isArray(service.tags) ? service.tags : [],
    userName: user[0]?.name ?? "Unknown",
    userAvatar: user[0]?.avatar ?? null,
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
  };
}

router.get("/categories", async (req, res) => {
  try {
    const services = await db.select({ category: servicesTable.category }).from(servicesTable).where(eq(servicesTable.isActive, true));
    const categoryCounts = services.reduce((acc: Record<string, number>, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});
    const icons: Record<string, string> = {
      "Web Development": "code",
      "Mobile Development": "smartphone",
      "UI/UX Design": "palette",
      "Backend Development": "server",
      "DevOps": "cloud",
      "Data Science": "bar-chart",
      "AI/ML": "cpu",
      "Blockchain": "link",
      "Consulting": "users",
      "Other": "briefcase",
    };
    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      icon: icons[name] || "briefcase",
    }));
    res.json(categories);
  } catch (error) {
    req.log.error({ error }, "Failed to get service categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userId, category, limit = "20", offset = "0" } = req.query as Record<string, string>;
    let services;
    if (userId) {
      services = await db.select().from(servicesTable).where(eq(servicesTable.userId, userId)).limit(parseInt(limit)).offset(parseInt(offset)).orderBy(desc(servicesTable.createdAt));
    } else if (category) {
      services = await db.select().from(servicesTable).where(eq(servicesTable.category, category)).limit(parseInt(limit)).offset(parseInt(offset)).orderBy(desc(servicesTable.createdAt));
    } else {
      services = await db.select().from(servicesTable).where(eq(servicesTable.isActive, true)).limit(parseInt(limit)).offset(parseInt(offset)).orderBy(desc(servicesTable.createdAt));
    }
    const enriched = await Promise.all(services.map(enrichService));
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to list services");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, price, priceUnit, deliveryDays, imageUrl, tags } = req.body;
    const [service] = await db.insert(servicesTable).values({
      userId: req.userId!,
      title,
      description,
      category,
      price: price.toString(),
      priceUnit: priceUnit || "fixed",
      deliveryDays: deliveryDays || 7,
      imageUrl,
      tags: tags || [],
      isActive: true,
    }).returning();
    const enriched = await enrichService(service);
    res.status(201).json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to create service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:serviceId", async (req, res) => {
  try {
    const service = await db.select().from(servicesTable).where(eq(servicesTable.id, parseInt(req.params.serviceId))).limit(1);
    if (service.length === 0) return res.status(404).json({ error: "Service not found" });
    const enriched = await enrichService(service[0]);
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to get service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:serviceId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, price, priceUnit, deliveryDays, imageUrl, tags } = req.body;
    const [updated] = await db.update(servicesTable)
      .set({ title, description, category, price: price?.toString(), priceUnit, deliveryDays, imageUrl, tags })
      .where(eq(servicesTable.id, parseInt(req.params.serviceId)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Service not found" });
    const enriched = await enrichService(updated);
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to update service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:serviceId", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(servicesTable).where(eq(servicesTable.id, parseInt(req.params.serviceId)));
    res.status(204).send();
  } catch (error) {
    req.log.error({ error }, "Failed to delete service");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
