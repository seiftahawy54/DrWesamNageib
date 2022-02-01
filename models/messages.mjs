import { Sequelize } from "sequelize";
import { sequelize } from "../utits/db.mjs";

const Messages = sequelize.define("message", {
  message_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  sender_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  sender_email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  message: Sequelize.STRING,
});

export { Messages };

/*
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

const deleteMessage = (messageId) => {
  return db
    .query("DELETE FROM messages WHERE messageid=$1", [messageId])
    .then((res) => res)
    .catch((err) => err);
};

export { getAllMessages, addMessage, deleteMessage };
*/
