import {Router} from "express";
import {
    getUpdateUser,
    getUsers,
    postDeleteUser,
    postUpdateUser,
    getSearchForUser,
    getUsersSearchFilters,
    getUserSpecialRoundAccess
} from "../../controllers/dashboard/users/users.js";

const router = Router();

router
    .get("/", getUsers)
    .get('/filters', getUsersSearchFilters)
    .post("/edit-user/:userId", postUpdateUser)
    .delete("/:userId", postDeleteUser)
    .get("/search", getSearchForUser)
    .get('/specialAccessRounds', getUserSpecialRoundAccess)
    .get("/:userId", getUpdateUser)

export default router;
