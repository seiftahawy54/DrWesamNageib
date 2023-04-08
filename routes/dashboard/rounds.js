import { Router } from "express";
import {
  getRounds,
  getStartNewRound,
  getUpdateRound,
  postAddNewRound,
  postDeleteRound,
  postUpdateRound,
} from "../../controllers/dashboard/d_rounds.js";
import { body } from "express-validator";

const router = Router();

router
  .get("/", getRounds)
  .get("/add-new-round", getStartNewRound)
  .post(
    "/",
    [
      body("round_course").notEmpty(),
      body("round_date").notEmpty(),
      body("round_link").notEmpty(),
    ],
    postAddNewRound
  )
  .get("/edit-round/:roundId", getUpdateRound)
  .put("/:roundId", [body("round_date").notEmpty()], postUpdateRound)
  .delete("/", postDeleteRound);

export default router;
