import { Exams } from "../../../models/index.js"
import { errorRaiser } from "../../../utils/error_raiser.js"
import { validationResult } from "express-validator"

export const getAllExams = async (req, res, next) => {
  try {
    const allExams = await Exams.findAll()

    const allPrimaryKeys = []

    let data = await Promise.all(
      allExams.map(
        async ({ exam_id, status, users_ids, questions, replies }, index) => {
          allPrimaryKeys.push(exam_id)

          return {
            exam_id,
            status,
            replies,
          }
        },
      ),
    )

    data = Object.entries(data).map(([key, value], index) => {
      return {
        item: value,
        entry: key,
      }
    })

    let finalData = []

    data.forEach((value, key) => {
      finalData.push({
        data: {
          ...data[key],
        },
        primaryKey: allPrimaryKeys[key],
        updateInputName: "examsId",
      })
    })

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
      customStuff: {},
    })
  } catch (e) {
    await errorRaiser(e, next)
  }
}

export const getAddNewExam = async (req, res, next) => {
  try {
    res.render("dashboard/exams/exams_forms", {
      title: "Exams",
      path: "/dashboard/exams",
      exam: {},
      editMode: false,
    })
  } catch (e) {
    await errorRaiser(e, next)
  }
}

export const startNewExam = async (req, res, next) => {
  try {
    const body = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        body,
        errors,
      })
    }

    return res.status(201).json({
      body,
      errors,
    })

  } catch (e) {
    await errorRaiser(e, next)
  }
}
