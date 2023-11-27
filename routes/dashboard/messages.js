import { Router } from "express";
import { getMessages, postDeleteAllMessages, postDeleteMessage } from "../../controllers/dashboard/dashboard.js";

const messagesRoutes = Router();

messagesRoutes
  .get("/", getMessages)
  .post("/delete-messages", postDeleteMessage)
  .post("/delete-all-messages", postDeleteAllMessages)

export default messagesRoutes;