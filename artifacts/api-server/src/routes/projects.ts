import { Router } from "express";
import { db, projectsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

async function enrichProject(project: typeof projectsTable.$inferSelect) {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, project.userId)).limit(1);
  return {
    ...project,
    techStack: Array.isArray(project.techStack) ? project.techStack : [],
    userName: user[0]?.name ?? "Unknown",
    userAvatar: user[0]?.avatar ?? null,
  };
}

router.get("/featured", async (req, res) => {
  try {
    const projects = await db.select().from(projectsTable).where(eq(projectsTable.featured, true)).limit(6).orderBy(desc(projectsTable.createdAt));
    const enriched = await Promise.all(projects.map(enrichProject));
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to get featured projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userId, category, featured, limit = "20", offset = "0" } = req.query as Record<string, string>;
    let query = db.select().from(projectsTable);
    const conditions = [];
    if (userId) conditions.push(eq(projectsTable.userId, userId));
    if (category) conditions.push(eq(projectsTable.category, category));
    if (featured === "true") conditions.push(eq(projectsTable.featured, true));
    const projects = await db.select().from(projectsTable)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy(desc(projectsTable.createdAt));
    const enriched = await Promise.all(projects.map(enrichProject));
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to list projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, longDescription, techStack, category, imageUrl, demoUrl, githubUrl, featured } = req.body;
    const [project] = await db.insert(projectsTable).values({
      userId: req.userId!,
      title,
      description,
      longDescription,
      techStack: techStack || [],
      category,
      imageUrl,
      demoUrl,
      githubUrl,
      featured: featured || false,
    }).returning();
    const enriched = await enrichProject(project);
    res.status(201).json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to create project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await db.select().from(projectsTable).where(eq(projectsTable.id, parseInt(req.params.projectId))).limit(1);
    if (project.length === 0) return res.status(404).json({ error: "Project not found" });
    const enriched = await enrichProject(project[0]);
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to get project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:projectId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, longDescription, techStack, category, imageUrl, demoUrl, githubUrl, featured } = req.body;
    const [updated] = await db.update(projectsTable)
      .set({ title, description, longDescription, techStack, category, imageUrl, demoUrl, githubUrl, featured })
      .where(eq(projectsTable.id, parseInt(req.params.projectId)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Project not found" });
    const enriched = await enrichProject(updated);
    res.json(enriched);
  } catch (error) {
    req.log.error({ error }, "Failed to update project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:projectId", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(projectsTable).where(eq(projectsTable.id, parseInt(req.params.projectId)));
    res.status(204).send();
  } catch (error) {
    req.log.error({ error }, "Failed to delete project");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
