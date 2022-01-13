import db from "../utits/db.mjs";
import crypto from "crypto";

const getAllMessages = () => {
  return db
    .query("SELECT * FROM messages;")
    .then((result) => result)
    .catch((err) => err);
};

const addMessage = (senderName, senderEmail, senderMessage) => {
  const idHash = crypto.randomBytes(10);
  const id = idHash.toString("hex");
  return db
    .query("INSERT INTO messages VALUES ($1, $2, $3, $4);", [
      id,
      senderName,
      senderEmail,
      senderMessage,
    ])
    .then((res) => res)
    .catch((err) => err);
};

export { getAllMessages, addMessage };
