import { Rounds, Courses, Users } from "../../models/index.js";
import { errorRaiser } from "../../utils/error_raiser.js";
import moment from "moment";
import { validationResult } from "express-validator";
import { getCoursesFormCart } from "../../utils/cart_helpers.js";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { sequelize } from "../../utils/db.js";
import Discounts from "../../models/discounts.js";
import { extractErrorMessages } from "../../utils/general_helper.js";

export const getRounds = async (req, res, next) => {
  try {
    let rounds = await Rounds.findAll({
      order: [
        ["round_date", "ASC"],
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
      include: [
        {
          model: Courses,
          on: {
            course_id: { [Op.eq]: Sequelize.col("rounds.course_id") },
          },
          attributes: ["name"],
          where: {
            isDeleted: false,
          },
        },
      ],
    });

    for (const round of rounds) {
      round.users_ids = await Promise.all(
        round.users_ids.map(async (userId) => {
          const user = await Users.findByPk(userId);
          return user ? user : "DELETED USER";
        })
      );
    }

    return res.status(200).json({
      rounds,
      primaryKey: "round_id",
    });
  } catch (e) {
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
    // moment(date).toISOString()
    const roundCourse = req.body.round_course;
    const roundDate = req.body.round_date;
    const roundLink = req.body.round_link;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(extractErrorMessages(errors.array()));
    }

    const addingResult = await Rounds.create({
      course_id: roundCourse,
      round_date: moment(roundDate).toISOString(),
      round_link: roundLink,
      users_ids: [],
    });

    if (typeof addingResult === "object") {
      return res.status(201).json({ message: "Round Added Successfully" });
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
    let allUsers = await sequelize.query(
      `SELECT * FROM users WHERE finished_course is null and current_round is null`,
      {
        type: "SELECT",
      }
    );

    allUsers = allUsers.map((user) => {
      const name = `${user.name.split(" ")[0]} ${user.name.split(" ")[1]}`;
      return {
        ...user,
        name,
      };
    });

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

    let nullUserIndex = 0;

    findingRoundUsersArr.forEach((user, index) => {
      if (!user) {
        nullUserIndex = index;
        console.log(`The un found user!`, user);
      }
    });

    findingRoundUsersArr = findingRoundUsersArr.filter((i) => i);
    /*.map((user) => {
      const name = `${user.name.split(" ")[0]} ${user.name.split(" ")[1]}`;
      console.log(name, user.email);
      return {
        ...user,
        name,
      };
    });*/

    res.render("dashboard/rounds/round_form", {
      title: `Update ${roundCourse.title} round`,
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
