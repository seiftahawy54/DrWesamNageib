import {Router} from "express";
import {
    getRounds,
    postAddNewRound,
    postDeleteRound,
    removeUsersFromRounds,
    addUsersToRounds,
    putUpdateRound,
    gerRunningRounds,
    getUsersForRounds,
    getRoundsCourses,
    getRoundData
} from "../../controllers/dashboard/rounds.js";
import {body} from "express-validator";

const router = Router();

const roundsValidation = [
    body('roundTitle').isString().notEmpty(),
    body("courseId").isString().notEmpty(),
    body("roundDate").isString().notEmpty(),
    body("content").isString().notEmpty(),
    body('usersIds').isArray().notEmpty(),
];

router
    .delete("/:roundId", postDeleteRound)
    .put("/:roundId", roundsValidation, putUpdateRound)
    .post(
        "/",
        roundsValidation,
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
