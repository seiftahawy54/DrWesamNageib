import { Sequelize } from "sequelize";
import { sequelize } from "../utils/db.js";
import { hashCreator } from "../utils/general_helper.js";
import { UUIDV4 } from "sequelize";

const Messages = sequelize.define("message", {
  messageid: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  sendername: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  senderemail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  message: Sequelize.STRING,
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
    allowNull: true,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
    allowNull: true,
  },
});

export default Messages;

/*
import db from "../utils/db.js";

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
