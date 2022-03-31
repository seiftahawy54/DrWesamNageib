import { Router } from "express";
import {
  getUpdateUser,
  getUsers,
  postDeleteUser,
  postUpdateUser,
} from "../../controllers/dashboard/users/d_users.js";

const router = Router();

router
  .get("/", getUsers)
  .post("/delete-users", postDeleteUser)
  .get("/edit-users/:userId", getUpdateUser)
  .post("/edit-user/:userId", postUpdateUser);

export default router;
