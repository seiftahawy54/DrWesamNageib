import {Router} from "express";
import {
    getRounds,
    getUpdateRound,
    postAddNewRound,
    postDeleteRound,
    removeUsersFromRounds,
    addUsersToRounds,
    putUpdateRound, gerRunningRounds
} from "../../controllers/dashboard/d_rounds.js";
import {body} from "express-validator";

const router = Router();

router
    .get("/", getRounds)
    .delete("/:roundId", postDeleteRound)
    .put("/:roundId", [
        body("roundLink").notEmpty().optional(),
        body("roundDate").notEmpty().optional(),
        body("finishRound").notEmpty().optional(),
    ], putUpdateRound)
    .post(
        "/",
        [
            body("round_course").notEmpty(),
            body("round_date").notEmpty(),
            body("round_link").notEmpty(),
            body('usersIds').isArray().notEmpty(),
        ],
        postAddNewRound
    )
    .get('/running', gerRunningRounds)
    .put('/addUsers/:roundId', [body('usersIds').isArray().notEmpty()], addUsersToRounds)
    .delete("/removeUsers/:roundId", [
        body("usersIds").isArray().notEmpty(),
    ], removeUsersFromRounds)

export default router;
