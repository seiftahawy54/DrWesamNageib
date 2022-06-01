import { ExamsReplies } from "../../../models/index.js";
import { errorRaiser } from "../../../utils/error_raiser.js";
import { validationResult } from "express-validator";
import { getSingleFile, uploadFile } from "../../../utils/aws.js";
import { sequelize } from "../../../utils/db.js";
import moment from "moment";

export const getAllReplies = async (req, res, next) => {
  try {
    const allExamsReplies = await sequelize.query(
      `
        SELECT distinct e.title, e.exam_id, reply.reply_id FROM exams_replies reply
          INNER JOIN exams e on reply.exam_id = e.exam_id
          INNER JOIN users u on reply.user_id = u.user_id;
    `,
      {
        type: "SELECT",
      }
    );

    const allPrimaryKeys = [];

    let data = await Promise.all(
      allExamsReplies.map(async ({ reply_id, title, exam_id }, index) => {
        allPrimaryKeys.push(reply_id);

        // createdAt = moment(createdAt).format("DD/MM/YYYY-hh:mm:ss");
        let previewLink = `<a href="/dashboard/exams-replies/${exam_id}">${title}</a>`;

        return {
          title,

          previewLink,
        };
      })
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
        updateInputName: "replyId",
      });
    });

    return res.render("dashboard/general_tables", {
      title: "Exams",
      path: "/dashboard/exams-replies",
      tableName: "Exam-Replies",
      addingNewLink: "exams_replies",
      singleTableName: "exam_replies",
      tableHead: [
        {
          title: "#",
          name: "reply-number",
        },
        {
          title: "Exams with replies",
          name: "exam-title",
        },
        {
          title: "Delete Exam",
          name: "delete-exam",
        },
      ],
      tableRows: finalData,
      customStuff: {
        notHaveUpdate: true,
        notHaveNewInsert: true,
      },
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getRepliesForExam = async (req, res, next) => {
  try {
    const examId = req.params.examId;
    const allExamsReplies = await sequelize.query(
      `
        SELECT * FROM exams_replies reply
        INNER Join exams e on reply.exam_id = e.exam_id
        INNER JOIN users u on reply.user_id = u.user_id
          where reply.exam_id=?
          order by reply."createdAt" desc;
    `,
      {
        type: "SELECT",
        replacements: [examId],
      }
    );

    const allPrimaryKeys = [];

    let data = await Promise.all(
      allExamsReplies.map(
        async ({ reply_id, name, grade, createdAt }, index) => {
          allPrimaryKeys.push(reply_id);

          createdAt = moment(createdAt).format("DD/MM/YYYY-hh:mm:ss");
          let previewLink = `<a href="/exams/preview/${reply_id}">${name} reply</a>`;

          return {
            name,
            grade,
            createdAt,
            previewLink,
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
        updateInputName: "replyId",
      });
    });

    return res.render("dashboard/general_tables", {
      title: "Exams",
      path: "/dashboard/exams-replies",
      tableName: "Exam-Replies",
      addingNewLink: "exams_replies",
      singleTableName: "exam_replies",
      tableHead: [
        {
          title: "#",
          name: "reply-number",
        },
        {
          title: "Name",
          name: "user-name",
        },
        {
          title: "Grade",
          name: "grade",
        },
        {
          title: "Submission Date",
          name: "submission-date",
        },
        {
          title: "Preview Link",
          name: "preview-link",
        },
        {
          title: "Delete Exam",
          name: "delete-exam",
        },
      ],
      tableRows: finalData,
      customStuff: {
        notHaveUpdate: true,
        notHaveNewInsert: true,
      },
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteReply = async (req, res, next) => {
  try {
    const replyId = req.body.replyId;
    const findingReply = await ExamsReplies.findByPk(replyId);
    const deletingResult = await findingReply.destroy();

    if (deletingResult) {
      req.flash("success", "Reply Deleted Successfully");
      return res.redirect("/dashboard/exams-replies");
    }
    req.flash("error", "Something happened");
    return res.redirect("/dashboard/exams-replies");
  } catch (e) {
    await errorRaiser(e, next);
  }
};
