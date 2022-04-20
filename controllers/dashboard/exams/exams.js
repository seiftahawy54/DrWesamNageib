import { Exams, Users } from "../../../models/index.js";
import { errorRaiser } from "../../../utils/error_raiser.js";
import { validationResult } from "express-validator";

export const getAllExams = async (req, res, next) => {
  try {
    const allExams = await Exams.findAll();

    const allPrimaryKeys = [];

    let data = await Promise.all(
      allExams.map(
        async (
          { exam_id, status, users_ids, questions, replies, title },
          index
        ) => {
          allPrimaryKeys.push(exam_id);

          exam_id = `<span class="link-primary " onclick="copyExamLink(this)" style="cursor: pointer;">/exam/${exam_id}</span>`;
          status = status ? "WORKING" : "CLOSED";
          if (replies === 0 || !replies) {
            replies = "No replies.";
          } else {
            replies = await Promise.all(
              replies.map(async ({ user_id, grade }) => {
                const user_name = await Users.findByPk(user_id, {
                  attributes: ["name"],
                });
                console.log(user_name);
                return `<span>${user_name.name}: ${grade} </span>`;
                // return `<span class="chip">${user_id.slice(
                //   0,
                //   10
                // )}, ${grade}</span>`;
              })
            );
          }

          return {
            title,
            status,
            exam_id,
            replies,
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
        updateInputName: "examsId",
      });
    });

    return res.render("dashboard/exams/exams", {
      title: "Exams",
      path: "/dashboard/exams",
      tableName: "Exams",
      addingNewLink: "exams",
      singleTableName: "exam",
      tableHead: [
        {
          title: "#",
          name: "exam-number",
        },
        {
          title: "Exam Title",
          name: "exam-title",
        },
        {
          title: "Exam Status",
          name: "exam-status",
        },
        {
          title: "Exam Link",
          name: "exam-link",
        },
        {
          title: "No. Replies",
          name: "exams-answers",
        },
        {
          title: "Update Exam",
          name: "update-exam",
        },
        {
          title: "Delete Exam",
          name: "delete-exam",
        },
      ],
      tableRows: finalData,
      customStuff: {
        copyLink: true,
      },
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getAddNewExam = async (req, res, next) => {
  try {
    res.render("dashboard/exams/exams_forms", {
      title: "Exams",
      path: "/dashboard/exams",
      exam: {},
      editMode: false,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const startNewExam = async (req, res, next) => {
  try {
    const questions = req.body.questions;
    const examTitle = req.body.examTitle;
    const examStatus = req.body.examStatus;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors,
      });
    }

    const addingExam = await Exams.create({
      status: examStatus,
      questions,
      title: examTitle,
    });

    return res.status(201).json({
      questions,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteExam = async (req, res, next) => {
  try {
    const examId = req.body.examsId;

    const deletionResult = await (await Exams.findByPk(examId)).destroy();

    if (deletionResult.length === 0) {
      req.flash("success", "Exam Deleted successfully");
      res.redirect("/dashboard/exams");
    } else {
      req.flash("error", "Something happened!");
      res.redirect("/dashboard/exams");
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getUpdateExam = async (req, res, next) => {
  try {
    const examId = req.params.examId;
    const exam = await Exams.findByPk(examId);

    exam.questions = JSON.stringify(exam.questions);

    res.render("dashboard/exams/exams_forms", {
      title: "Exams",
      path: "/dashboard/exams",
      exam,
      editMode: true,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postUpdateExam = async (req, res, next) => {
  try {
    const examId = req.body.examId;
    const questions = req.body.questions;
    const examTitle = req.body.examTitle;
    const examStatus = req.body.examStatus;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors,
      });
    }

    const updatingExam = await Exams.update(
      {
        status: examStatus,
        questions,
        title: examTitle,
      },
      { where: { exam_id: examId } }
    );

    console.log(updatingExam);

    res.status(201).json({
      questions,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};
