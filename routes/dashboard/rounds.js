import {Router} from "express";
import {
    getRounds,
    getStartNewRound,
    getUpdateRound,
    postAddNewRound,
    postDeleteRound,
    removeUsersFromRounds,
    addUsersToRounds,
    putUpdateRound
} from "../../controllers/dashboard/d_rounds.js";
import {body} from "express-validator";

const router = Router();

router
    .get("/", getRounds)
    .get("/:roundId", getUpdateRound)
    .put("/:roundId", [
        body("roundLink").notEmpty().optional(),
        body("roundDate").notEmpty().optional(),
        body("finishRound").notEmpty().optional(),
    ], putUpdateRound)
    .get("/add-new-round", getStartNewRound)
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
    .put('/addUsers/:roundId', [body('usersIds').isArray().notEmpty()], addUsersToRounds)
    .delete("/removeUsers/:roundId", [
        body("usersIds").isArray().notEmpty(),
    ], removeUsersFromRounds)
    .delete("/", postDeleteRound);

export default router;
