import {Router} from "express";
import {
    getUpdateUser,
    getUsers,
    postDeleteUser,
    postUpdateUser,
    getSearchForUser,
    getUsersSearchFilters,
    getUserSpecialRoundAccess,
    putUpdateUserPassword,
    putRemoveUserFromRounds,
    addUserToSpecialAccessRound,
    gerRunningRounds,
    deleteExamsRepliesForUser
} from "../../controllers/dashboard/users/users.js";
import {body} from "express-validator";

const router = Router();

router
    .get("/", getUsers)
    .get('/filters', getUsersSearchFilters)
    .put("/:userId", [body("name").isString().notEmpty(), body("email").isEmail().notEmpty(), body("whatsappNumber").isString().notEmpty(), body("specialization").isString().notEmpty(), body("type").isNumeric().isLength({
        min: 1,
        max: 9
    }).notEmpty()], postUpdateUser)
    .put('/updatePassword/:userId', [body('password').isString().notEmpty(), body('confirmPassword').isString().notEmpty(),], putUpdateUserPassword)
    .put(`/removeFromRounds/:userId`, [body("rounds").isArray().notEmpty(),], putRemoveUserFromRounds)
    .put("/specialAccessRounds/:userId", [body("rounds").isArray().notEmpty(),], addUserToSpecialAccessRound)
    .delete("/:userId", postDeleteUser)
    .get("/search", getSearchForUser)
    .get('/specialAccessRounds/:userId', getUserSpecialRoundAccess)
    .get('/runningRounds/:userId', gerRunningRounds)
    .get("/:userId", getUpdateUser)
    .delete('/replies/:userId', deleteExamsRepliesForUser)

export default router;
