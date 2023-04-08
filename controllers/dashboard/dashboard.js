import { errorRaiser } from "../../utils/error_raiser.js";
import { validationResult } from "express-validator";
import moment from "moment";

import { Rounds } from "../../models/index.js";
import { Payment } from "../../models/index.js";
import { Courses } from "../../models/index.js";
import { Users } from "../../models/index.js";
import { Messages } from "../../models/index.js";
import { Opinions } from "../../models/index.js";
import { About } from "../../models/index.js";
import { extractErrorMessages } from "../../utils/general_helper.js";

export const getOverview = async (req, res, next) => {
  let numberOfUsers = await Users.findAll({
    attributes: ["createdAt", "name"],
  });
  let numberOfCourses = await Courses.findAll({
    attributes: ["createdAt", "name"],
  });
  let numberOfRounds = await Rounds.findAll();
  let numberOfMessages = await Messages.findAll();
  let numberOfPayments = await Payment.findAll();
  let numberOfCertificates = await About.findAll();

  const generateStatistics = (model, uniqueProperty) => {
    let statisticsObject = new Map();
    model.forEach((data) => {
      const date = moment(data.createdAt).format("DD-MM");
      statisticsObject.set(date, [
        ...(statisticsObject.get(date) || []),
        data[uniqueProperty],
      ]);
    });
    return Object.fromEntries(statisticsObject);
  };

  numberOfUsers = generateStatistics(numberOfUsers, "name");
  numberOfCourses = generateStatistics(numberOfCourses, "name");
  numberOfPayments = generateStatistics(numberOfPayments, "user_id");

  return res.status(200).json({
    statsNumbers: {
      users: numberOfUsers,
      courses: numberOfCourses,
      payments: numberOfPayments,
    },
  });
};

export const getMessages = async (req, res, next) => {
  try {
    const allMessages = await Messages.findAll();
    return res.status(200).json({
      messages: allMessages,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteAllMessages = async (req, res, next) => {
  try {
    const deletingAllMessages = await Messages.destroy({
      truncate: true,
    });

    logger.info(`Deleting all messages result ===> ${deletingAllMessages}`);

    return res.status(200).json({
      message: "All messages deleted successfully",
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteMessage = async (req, res, next) => {
  try {
    const messageId = req.body.messageId;
    const deletingResult = await (await Messages.findByPk(messageId)).destroy();
    return res.status(200).json({ message: "Message Deleted Successfully" });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getOpinionsPage = async (req, res, next) => {
  try {
    let pageNumber = req.query.page;
    if (!pageNumber) {
      pageNumber = 1;
    }
    const MAX_NUMBER = 5;
    const numberOfResults = await Opinions.findAndCountAll();
    const fetchingResults = await Opinions.findAll({
      limit: MAX_NUMBER,
      offset: (parseInt(pageNumber) - 1) * MAX_NUMBER,
    });

    res.status(200).json({
      opinions: fetchingResults,
      numberOfLinks: Math.ceil(numberOfResults.count / MAX_NUMBER),
      activePage: pageNumber,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteOpinion = async (req, res, next) => {
  try {
    const fetchingResults = (
      await Opinions.findByPk(req.body.opinionId)
    ).destroy();
    if (fetchingResults.rowCount === 1) {
      return res.status(200).json({ message: "Opinion deleted successfully" });
    }
    return res.status(500).json({ message: "Server error " });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getUpdateOpinion = async (req, res, next) => {
  try {
    const opinionId = req.params.opinionId;
    const findingOpinion = await Opinions.findByPk(opinionId);

    return res.status(200).json({
      opinion: findingOpinion,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postUpdateOpinion = async (req, res, next) => {
  try {
    const opinionId = req.body.opinionId;
    const email = req.body.sender_email;
    const name = req.body.sender_name;
    const course = req.body.sender_course;
    const opinion = req.body.opinion;
    const errors = validationResult(req);
    const date = req.body.date;

    const findingOpinion = await Opinions.findByPk(opinionId);

    if (!errors.isEmpty()) {
      return res.status(400).json(extractErrorMessages(errors.array()));
    }

    const updatingResult = await Opinions.update(
      {
        sender_name: name,
        sender_email: email,
        sender_course: course,
        sender_message: opinion,
        created_on: moment(date).toISOString(),
      },
      { where: { opinion_id: opinionId } }
    );

    logger.info(`updating opinion: ${updatingResult}`);

    if (updatingResult[0] === 1) {
      return res.status(200).json({ message: "Opinion updated successfully" });
    }
    return res.status(500).json({ message: "Server error" });
  } catch (e) {
    await errorRaiser(e, next);
  }
};
