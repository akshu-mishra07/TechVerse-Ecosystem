import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import projectsRouter from "./projects";
import servicesRouter from "./services";
import bookingsRouter from "./bookings";
import conversationsRouter from "./conversations";
import notificationsRouter from "./notifications";
import reviewsRouter from "./reviews";
import adminRouter from "./admin";
import openaiChatRouter from "./openai-chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/projects", projectsRouter);
router.use("/services", servicesRouter);
router.use("/bookings", bookingsRouter);
router.use("/conversations", conversationsRouter);
router.use("/notifications", notificationsRouter);
router.use("/reviews", reviewsRouter);
router.use("/admin", adminRouter);
router.use("/openai", openaiChatRouter);

export default router;
