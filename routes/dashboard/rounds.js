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
    "/add-new-round",
    [
      body("round_course").notEmpty(),
      body("round_date").notEmpty(),
      body("round_link").notEmpty(),
    ],
    postAddNewRound
  )
  .get("/edit-round/:roundId", getUpdateRound)
  .post(
    "/edit-round/:roundId",
    [body("round_date").notEmpty()],
    postUpdateRound
  )
  .post("/delete-rounds", postDeleteRound);

export default router;
