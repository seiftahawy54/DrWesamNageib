import {Router} from "express";
import {
    getRounds,
    getUpdateRound,
    postAddNewRound,
    postDeleteRound,
    removeUsersFromRounds,
    addUsersToRounds,
    putUpdateRound,
    gerRunningRounds,
    getUsersForRounds,
    getRoundsCourses,
    getRoundData
} from "../../controllers/dashboard/d_rounds.js";
import {body} from "express-validator";

const router = Router();

router
    .delete("/:roundId", postDeleteRound)
    .put("/:roundId", [
        body("courseId").isString().notEmpty(),
        body("roundDate").isString().notEmpty(),
        body("content").isString().notEmpty(),
        body('usersIds').isArray().notEmpty(),
    ], putUpdateRound)
    .post(
        "/",
        [
            body("courseId").isString().notEmpty(),
            body("roundDate").isString().notEmpty(),
            body("content").isString().notEmpty(),
            body('usersIds').isArray().notEmpty(),
        ],
        postAddNewRound
    )
    .get('/running', gerRunningRounds)
    .put('/addUsers/:roundId', [body('usersIds').isArray().notEmpty()], addUsersToRounds)
    .delete("/removeUsers/:roundId", [
        body("usersIds").isArray().notEmpty(),
    ], removeUsersFromRounds)
    .get("/usersForRounds", getUsersForRounds)
    .get('/coursesForRounds', getRoundsCourses)
    .get("/", getRounds)
    .get("/:roundId", getRoundData)
;

export default router;
