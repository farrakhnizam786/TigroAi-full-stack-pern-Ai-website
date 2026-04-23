import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  getPublishedCreations,
  getUserCreations,
  getUserPlan,
  togglelikeCreations,
  togglePublishCreation,
} from "../controllers/usercontroller.js";

const userRouter = express.Router();

userRouter.get("/get-user-creations", auth, getUserCreations);
userRouter.get("/get-user-plan", auth, getUserPlan);           // ✅ plan from server
userRouter.get("/get-published-creations", auth, getPublishedCreations);
userRouter.post("/toggle-like-creations", auth, togglelikeCreations);
userRouter.post("/toggle-publish-creation", auth, togglePublishCreation);

export default userRouter;
