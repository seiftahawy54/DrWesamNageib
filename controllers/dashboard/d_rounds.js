import { Rounds } from "../../models/index.js";
import { Courses } from "../../models/index.js";
import { Users } from "../../models/index.js";
import { errorRaiser } from "../../utils/error_raiser.js";
import moment from "moment";
import { validationResult } from "express-validator";
import { getCoursesFormCart } from "../../utils/cart_helpers.js";
import { QueryTypes, Sequelize } from "sequelize";
import { sequelize } from "../../utils/db.js";
import Discounts from "../../models/discounts.js";

export const getRounds = async (req, res, next) => {
  try {
    const findingDiscounts = await Rounds.findAll({
      order: [
        ["round_date", "ASC"],
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    const allPrimaryKeys = [];

    let data = await Promise.all(
      await findingDiscounts.map(
        async ({ round_id, course_id, users_ids, round_date, finished }) => {
          allPrimaryKeys.push(round_id);

          let usersForEachRound = await Promise.all(
            users_ids.map(async (user_id) => {
              return await Users.findByPk(user_id);
            })
          );

          usersForEachRound = usersForEachRound.map((user) => {
            if ("name" in user) {
              return user.name;
            } else {
              return "DELETED USER";
            }
          });

          const name = (
            await Courses.findByPk(course_id, {
              attributes: ["name"],
            })
          )?.name;

          if (usersForEachRound.length === 0) {
            usersForEachRound = "No users for this round.";
          }

          if (
            Array.isArray(usersForEachRound) &&
            usersForEachRound.length > 10
          ) {
            usersForEachRound = usersForEachRound.slice(0, 10);
          }

          return {
            noOfUsers: users_ids.length,
            finished: !finished ? "Working" : "Closed",
            course_id: name,
            users_ids: usersForEachRound,
            round_date: moment(round_date).format("DD-MM-YYYY"),
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
        data: data[key],
        primaryKey: allPrimaryKeys[key],
        updateInputName: "roundId",
      });
    });

    return res.render("dashboard/rounds/rounds_modified", {
      title: "Rounds",
      path: "/dashboard/rounds",
      tableName: "Rounds",
      addingNewLink: "round",
      singleTableName: "round",
      tableHead: [
        {
          title: "#",
          name: "rounds-numbers",
        },
        {
          title: "No. Users",
          name: "number-of-subscribers",
        },
        {
          title: "Round Status",
          name: "rounds-status",
        },
        {
          title: "Round Course Name",
          name: "round-course-name",
        },
        {
          title: "Round Users",
          name: "round-users",
        },
        {
          title: "Round Date",
          name: "round-date",
        },
        {
          title: "Update Round",
          name: "update-round",
        },
        {
          title: "Delete Round",
          name: "delete-round",
        },
      ],
      tableRows: finalData,
      customStuff: {},
    });
  } catch (e) {
    console.log(e);
    await errorRaiser(e, next);
  }
};

export const getStartNewRound = async (req, res, next) => {
  try {
    const allCourses = await Courses.findAll();

    res.render("dashboard/rounds/round_form", {
      title: "Rounds",
      path: "/dashboard/rounds",
      courses: allCourses,
      editMode: false,
      validationErrors: [],
      round: {},
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postAddNewRound = async (req, res, next) => {
  try {
    const allCourses = await Courses.findAll();
    // moment(date).toISOString()
    const roundCourse = req.body.round_course;
    const roundDate = req.body.round_date;
    const roundLink = req.body.round_link;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      res.status(402).render("dashboard/rounds/round_form", {
        title: "Rounds",
        // path: "/dashboard/rounds",
        path: "/dashboard/rounds",
        courses: allCourses,
        editMode: false,
        validationErrors: errors.array(),
        round: {
          round_course: roundCourse,
          round_date: roundDate,
          round_link: roundLink,
        },
      });
    } else {
      const addingResult = await Rounds.create({
        course_id: roundCourse,
        round_date: moment(roundDate).toISOString(),
        round_link: roundLink,
        users_ids: [],
      });

      if (typeof addingResult === "object") {
        req.flash("success", "Round Added Successfully");
        return res.status(201).redirect("/dashboard/rounds");
      } else {
        req.flash("error", "Error in adding new round");
        return res.status(402).render("dashboard/rounds/round_form", {
          title: "Rounds",
          // path: "/dashboard/rounds",
          path: "/dashboard/rounds",
          courses: allCourses,
          editMode: false,
          validationErrors: errors.array(),
          round: {
            round_course: roundCourse,
            round_date: roundDate,
            round_link: roundLink,
          },
        });
      }
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getUpdateRound = async (req, res, next) => {
  try {
    const roundId = req.params.roundId;
    const findingRound = await Rounds.findByPk(roundId);
    const findingRoundCourse = await Courses.findByPk(findingRound.course_id);
    const allUsers = await sequelize.query(
      `SELECT * FROM users WHERE finished_course is null and current_round is null`,
      {
        type: "SELECT",
      }
    );

    const roundCourse = (
      await sequelize.query(`SELECT * FROM courses WHERE course_id=?`, {
        replacements: [findingRound.course_id],
        type: "SELECT",
      })
    )[0];
    let usersHavePreviousCourses = await sequelize.query(
      `SELECT * FROM users WHERE char_length(finished_course) > 0 and current_round is null`,
      {
        type: "SELECT",
      }
    );

    let findingRoundUsersArr = [];

    if (findingRound.users_ids.length !== 0) {
      findingRoundUsersArr = await Promise.all(
        findingRound.users_ids.map(async (userId) => {
          if (userId) {
            return await Users.findByPk(userId);
          } else {
            return null;
          }
        })
      );
    }

    console.log(usersHavePreviousCourses);
    // usersHavePreviousCourses = usersHavePreviousCourses.filter();

    res.render("dashboard/rounds/round_form", {
      title: "Update Single Round",
      path: "/dashboard/rounds",
      roundCourse: roundCourse,
      editMode: true,
      validationErrors: [],
      roundUsers: findingRoundUsersArr,
      unRoundedUsers: allUsers,
      usersWithPrevCourse: usersHavePreviousCourses,
      round: findingRound,
      moment,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postUpdateRound = async (req, res, next) => {
  try {
    const roundId = req.params.roundId;
    const roundDate = req.body.round_date;
    const roundLink = req.body.round_link;
    const finishRound = req.body.finish_round;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const findingRound = await Rounds.findByPk(roundId);
      const findingRoundCourse = await Courses.findByPk(findingRound.course_id);
      const allUsers = await Users.findAll();
      const allCourses = await Courses.findAll();
      let findingRoundUsersArr = [];

      if (findingRound.users_ids.length !== 0) {
        const findingRoundUsers = findingRound.users_ids.map(async (userId) => {
          return await Users.findByPk(userId);
        });

        for (const key of findingRoundUsers) {
          findingRoundUsersArr.push(await key);
        }
      }

      req.flash("error", errors.array()[0].msg);
      return res.status(402).render("dashboard/rounds/round_form", {
        title: "Update Single Round",
        path: "/dashboard/rounds",
        courses: allCourses,
        editMode: true,
        validationErrors: errors.array(),
        roundUsers: findingRoundUsersArr,
        usersArr: allUsers,
        round: findingRound,
        moment,
      });
    }

    const findingRound = await Rounds.findByPk(roundId);
    const findingRoundCourse = await Courses.findByPk(findingRound.course_id);
    const allUsers = await Users.findAll();
    const allCourses = await Courses.findAll();
    let findingRoundUsersArr = [];

    if (finishRound === "on") {
      for (const user of allUsers) {
        if (user.current_round === roundId) {
          const updateUserRound = await sequelize.query(
            "UPDATE users SET current_round=null, finished_course=? WHERE user_id=?",
            {
              replacements: [roundId, user.user_id],
              type: QueryTypes.UPDATE,
            }
          );
        }
      }

      const updateResult = await findingRound.update(
        {
          finished: true,
        },
        { where: { round_id: roundId } }
      );

      if (updateResult) {
        req.flash("success", "Round Closed Successfully");
        return res.redirect("/dashboard/rounds");
      }
    }

    const updatedUsersArr = Object.keys(req.body).filter((bodyItem) =>
      /user-\d/.test(bodyItem)
    );
    const updateUsersValues = updatedUsersArr.map((userId) => req.body[userId]);

    for (const userId of updateUsersValues) {
      await Users.update(
        {
          current_round: roundId,
        },
        { where: { user_id: userId } }
      );
    }

    for (const user of allUsers) {
      if (updateUsersValues.indexOf(user.user_id) === -1) {
        await sequelize.query(
          "UPDATE users SET current_round=null WHERE user_id=? and current_round LIKE ?",
          {
            replacements: [user.user_id, roundId],
            type: QueryTypes.UPDATE,
          }
        );
        /*await Users.update(
          {
            current_round: null,
          },
          { where: { user_id: user.user_id } }
        );*/
      }
    }

    const updatingRoundsResult = await Rounds.update(
      {
        round_date: moment(roundDate).toISOString(),
        round_link: roundLink,
        users_ids: updateUsersValues,
        finished: false,
      },
      { where: { round_id: roundId } }
    );

    if (updatingRoundsResult[0] === 1) {
      req.flash("success", "Round Updated successfully");
      return res.status(201).redirect("/dashboard/rounds");
    } else {
      const allCourses = await Courses.findAll();
      const allWebsiteUsers = await Users.findAll();
      const findingRound = await Rounds.findByPk(roundId);

      return res.render("dashboard/rounds/round_form", {
        title: "Update Single Round",
        path: "/dashboard/rounds",
        courses: allCourses,
        editMode: true,
        validationErrors: [],
        users: allWebsiteUsers,
        round: findingRound,
        moment,
      });
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteRound = async (req, res, next) => {
  const roundId = req.body.roundId;

  try {
    const deletingResult = await (await Rounds.findByPk(roundId)).destroy();

    if (deletingResult.length === 0) {
      req.flash("success", "Round deleted successfully");
      res.redirect("/dashboard/rounds");
    } else {
      req.flash("error", "There's An error");
      res.redirect("/dashboard/rounds");
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};
