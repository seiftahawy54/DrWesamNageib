import {Router} from "express";
import {
    getUpdateUser,
    getUsers,
    postDeleteUser,
    postUpdateUser,
    getSearchForUser
} from "../../controllers/dashboard/users/d_users.js";

const router = Router();

router
    .get("/", getUsers)
    .get("/search/", getSearchForUser)
    .post("/delete-users", postDeleteUser)
    .get("/edit-users/:userId", getUpdateUser)
    .post("/edit-user/:userId", postUpdateUser)

export default router;
