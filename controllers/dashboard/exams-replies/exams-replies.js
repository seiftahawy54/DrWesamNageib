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
        SELECT e.title, reply.reply_id, u.name, reply.grade, reply."createdAt" FROM exams_replies reply
        INNER Join exams e on reply.exam_id = e.exam_id
        INNER JOIN users u on reply.user_id = u.user_id
          order by reply."createdAt" desc;
    `,
      {
        type: "SELECT",
      }
    );

    const allPrimaryKeys = [];

    let data = await Promise.all(
      allExamsReplies.map(
        async ({ reply_id, title, name, grade, createdAt }, index) => {
          allPrimaryKeys.push(reply_id);

          createdAt = moment(createdAt).format("DD/MM/YYYY-hh:mm:ss");
          let previewLink = `<a href="/exams/preview/${reply_id}">${name} reply</a>`;

          return {
            title,
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
      tableName: "Exams-Replies",
      addingNewLink: "exams_replies",
      singleTableName: "exam_replies",
      tableHead: [
        {
          title: "#",
          name: "reply-number",
        },
        {
          title: "Exam Title",
          name: "exam-title",
        },
        {
          title: "Student Name",
          name: "student-name",
        },
        {
          title: "Grade",
          name: "grade",
        },
        {
          title: "Submit Date",
          name: "submit-date",
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
