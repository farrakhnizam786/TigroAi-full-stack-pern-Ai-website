import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  getPublishedCreations,
  getUserCreations,
  togglelikeCreations,
} from "../controllers/usercontroller.js";

const userRouter = express.Router();

userRouter.get("/get-user-creations", auth, getUserCreations);
userRouter.get("/get-published-creations", getPublishedCreations); // public access
userRouter.post("/toggle-like-creations", auth, togglelikeCreations);

export default userRouter;
