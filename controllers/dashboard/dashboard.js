import { errorRaiser } from "../../utils/error_raiser.js";
import { validationResult } from "express-validator";
import moment from "moment";
import { uploadFile } from "../../utils/aws.js";
import { getCertificatesImage } from "../../utils/general_helper.js";

import { Exams, Rounds } from "../../models/index.js";
import { Payment } from "../../models/index.js";
import { Courses } from "../../models/index.js";
import { Users } from "../../models/index.js";
import { Messages } from "../../models/index.js";
import { Opinions } from "../../models/index.js";
import { Certificates } from "../../models/index.js";
import { sequelize } from "../../utils/db.js";

export const getOverview = async (req, res, next) => {
  let numberOfUsers = await Users.findAll({
    attributes: ["createdAt", "name"],
  });
  const numberOfCourses = await Courses.findAll();
  const numberOfRounds = await Rounds.findAll();
  const numberOfMessages = await Messages.findAll();
  const numberOfPayments = await Payment.findAll();
  const numberOfCertificates = await Certificates.findAll();

  numberOfUsers = numberOfUsers.map((user) => {
    user.name = 1;
    return user;
  });

  console.log(numberOfUsers);

  res.render("dashboard/overview", {
    title: "Overview Page",
    path: "/dashboard/overview",
    statsNumbers: {
      users: numberOfUsers,
      courses: numberOfCourses,
      rounds: numberOfRounds,
      messages: numberOfMessages,
      payments: numberOfPayments,
    },
    moment,
  });
};

export const getMessages = async (req, res, next) => {
  try {
    const allMessages = await Messages.findAll();

    const allPrimaryKeys = [];

    let data = await Promise.all(
      allMessages.map(
        async ({ messageid, sendername, senderemail, message }, index) => {
          allPrimaryKeys.push(messageid);
          return {
            sendername,
            senderemail,
            message,
          };
        }
      )
    );

    data = Object.entries(data).map(([key, value], index) => {
      return {
        item: value,
        entry: key,
      };
    });

    let finalData = [];

    data.forEach((value, key) => {
      finalData.push({
        data: {
          ...data[key],
        },
        primaryKey: allPrimaryKeys[key],
        updateInputName: "messageId",
      });
    });

    return res.render("dashboard/messages", {
      title: "Messages",
      path: "/dashboard/messages",
      tableName: "Messages",
      addingNewLink: "messages",
      singleTableName: "message",
      tableHead: [
        {
          title: "#",
          name: "message-number",
        },
        {
          title: "Sender Name",
          name: "sender-name",
        },
        {
          title: " Sender Email",
          name: "sender-email",
        },
        {
          title: "Sender Message",
          name: "sender-message",
        },
      ],
      tableRows: finalData,
      customStuff: {
        // pagination:
        notHaveUpdate: true,
        deletingAllMessages: true,
      },
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

    console.log("Deleting all messages result ===> ", deletingAllMessages);

    req.flash("success", "All messages are deleted successfully");
    return res.redirect("/dashboard/messages");
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteMessage = async (req, res, next) => {
  try {
    const messageId = req.body.messageId;
    const deletingResult = await (await Messages.findByPk(messageId)).destroy();
    req.flash("success", "Message Deleted Successfully");
    res.redirect("/dashboard/messages");
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

    res.render("dashboard/opinions", {
      title: "Opinions",
      path: "/dashboard/opinions",
      opinions: fetchingResults,
      numberOfLinks: Math.ceil(numberOfResults.count / 5),
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
      res.redirect("opinions");
    } else {
      res.redirect("opinions");
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getUpdateOpinion = async (req, res, next) => {
  try {
    const opinionId = req.params.opinionId;
    const findingOpinion = await Opinions.findByPk(opinionId);

    res.render("dashboard/opinions_form", {
      title: "Update Opinion",
      path: "/dashboard/update_opinion",
      opinion: findingOpinion,
      errorMessage: "",
      validationErrors: [],
      moment: moment,
      editMode: true,
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
      res.render("dashboard/opinions_form", {
        title: "Update Opinion",
        path: "/dashboard/update_opinion",
        opinion: {
          opinion_id: opinionId,
          sender_name: name,
          sender_email: email,
          sender_course: course,
          sender_message: opinion,
          created_on: findingOpinion,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
        editMode: true,
        moment: moment,
      });
    } else {
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

      console.log(`updating opinion: `, updatingResult);

      if (updatingResult[0] === 1) {
        return res.status(201).redirect("/dashboard/opinions");
      } else {
        return res.status(500).render("dashboard/opinions_form", {
          title: "Update Opinion",
          path: "/dashboard/update_opinion",
          opinion: {
            opinion_id: opinionId,
            sender_name: name,
            sender_email: email,
            sender_course: course,
            sender_message: opinion,
            created_on: findingOpinion.created_on,
          },
          errorMessage: "There's an error from database",
          validationErrors: [],
          editMode: true,
          moment: moment,
        });
      }
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getAboutPage = async (req, res, next) => {
  try {
    const certificates = await Certificates.findAll();

    await getCertificatesImage(certificates);

    res.render("dashboard/about", {
      title: "Certificate",
      path: "/dashboard/about",
      editMode: false,
      certificates: certificates,
      errorMessage: "",
      validationErrors: [],
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getNewAbout = (req, res, next) => {
  res.render("dashboard/about_forms", {
    title: "Certificate",
    path: "/dashboard/about",
    editMode: false,
    certificates: [],
    errorMessage: "",
    validationErrors: [],
  });
};

export const postAddNewAbout = async (req, res, next) => {
  try {
    const certificateImage = req.files[0];

    if (certificateImage?.path) {
      const addingResult = await Certificates.create({
        certificate_img: certificateImage.path,
      });

      const uploadingResult = await uploadFile(
        certificateImage.path,
        certificateImage.filename,
        certificateImage.mimetype,
        res,
        next
      );

      console.log(uploadingResult);

      if (addingResult) {
        console.log(`adding_result`, await addingResult);
        res.redirect("/dashboard/about");
      }
    } else {
      return res.render("dashboard/about_forms", {
        title: "Certificate",
        path: "/dashboard/about",
        editMode: false,
        certificates: [],
        errorMessage: "Please enter a correct certificate image",
        validationErrors: [
          {
            param: "certificate_img",
          },
        ],
      });
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteCertificate = async (req, res, next) => {
  try {
    const certificateId = req.body.certificateId;
    const deletingResult = await (
      await Certificates.findByPk(certificateId)
    ).destroy();
    console.log(deletingResult);
    res.redirect("about");
  } catch (e) {
    await errorRaiser(e, next);
  }
};
