import db from "../utits/db.mjs";
import crypto from "crypto";

const addOneOpinion = (senderName, senderCourse, senderMessage) => {
  return db
    .query("INSERT INTO opinions VALUES ($1, $2, $3, $4);", [
      crypto.randomBytes(10).toString("hex"),
      senderName,
      senderCourse,
      senderMessage,
    ])
    .then((res) => res)
    .catch((err) => err);
};

export { addOneOpinion };
