import { getNumberOfCourses } from "../../models/courses.mjs";
import { getNumberOfUsers } from "../../models/users.mjs";
import { deleteMessage, getAllMessages } from "../../models/messages.mjs";
import {
  deleteSingleOpinion,
  fetchAllOpinions,
} from "../../models/opinions.mjs";

const getOverview = async (req, res, next) => {
  const numberOfUsers = await getNumberOfUsers();
  const numberOfCourses = await getNumberOfCourses();

  res.render("dashboard/overview", {
    title: "Over View Page",
    path: "/dashboard/overview",
    statsNumbers: {
      users: await numberOfUsers.rows[0].count,
      courses: await numberOfCourses.rows[0].count,
    },
  });
};

const getMessages = async (req, res, next) => {
  const allMessages = await getAllMessages();
  res.render("dashboard/messages", {
    title: "Messages page",
    path: "/dashboard/messages",
    messages: allMessages.rows,
  });
};

const postDeleteMessage = async (req, res, next) => {
  const messageId = req.body.messageId;
  const deletingResult = await deleteMessage(messageId);
  res.redirect("/dashboard/messages");
};

const getOpinionsPage = async (req, res, next) => {
  try {
    const fetchingResults = await fetchAllOpinions();
    res.render("dashboard/opinions", {
      title: "Opinions",
      path: "/dashboard/opinions",
      opinions: fetchingResults.rows,
    });
  } catch (e) {
    res.redirect("/dashboard/overview");
  }
};

const postDeleteOpinion = async (req, res, next) => {
  try {
    const fetchingResults = await deleteSingleOpinion(req.body.opinionId);
    if (fetchingResults.rowCount === 1) {
      res.redirect("/dashboard/opinions");
    } else {
      res.redirect("/dashboard/opinions");
    }
  } catch (e) {
    console.log(e);
    res.redirect("/dashboard/opinions");
  }
};

export {
  getOverview,
  getMessages,
  postDeleteMessage,
  getOpinionsPage,
  postDeleteOpinion,
};
