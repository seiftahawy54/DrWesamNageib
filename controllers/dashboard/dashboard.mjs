import { Courses } from "../../models/courses.mjs";
import { Users } from "../../models/users.mjs";
import { Messages } from "../../models/messages.mjs";
import { Opinions } from "../../models/opinions.mjs";

const getOverview = async (req, res, next) => {
  const numberOfUsers = (await Users.findAll()).length;
  const numberOfCourses = (await Courses.findAll()).length;

  res.render("dashboard/overview", {
    title: "Over View Page",
    path: "/dashboard/overview",
    statsNumbers: {
      users: numberOfUsers,
      courses: numberOfCourses,
    },
  });
};

const getMessages = async (req, res, next) => {
  const allMessages = await Messages.findAll();
  res.send(allMessages);
  res.render("dashboard/messages", {
    title: "Messages page",
    path: "/dashboard/messages",
    messages: allMessages,
  });
};

const postDeleteMessage = async (req, res, next) => {
  const messageId = req.body.messageId;
  const deletingResult = (await Messages.findByPk(messageId)).destroy();
  console.log(deletingResult);
  res.redirect("/dashboard/messages");
};

const getOpinionsPage = async (req, res, next) => {
  try {
    const fetchingResults = await Opinions.findAll();
    res.render("dashboard/opinions", {
      title: "Opinions",
      path: "/dashboard/opinions",
      opinions: fetchingResults,
    });
  } catch (e) {
    res.redirect("/dashboard/overview");
  }
};

const postDeleteOpinion = async (req, res, next) => {
  try {
    const fetchingResults = (
      await Opinions.findByPk(req.body.opinionId)
    ).destroy();
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
