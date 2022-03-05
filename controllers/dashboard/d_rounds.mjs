import { Rounds } from "../../models/rounds.mjs";
import { Courses } from "../../models/courses.mjs";
import { errorRaiser } from "../../utits/error_raiser.mjs";
import moment from "moment";
import { validationResult } from "express-validator";
import { getCoursesFormCart } from "../../utits/cart_helpers.mjs";
import { Users } from "../../models/users.mjs";
import { Sequelize } from "sequelize";

export const getRounds = async (req, res, next) => {
  try {
    console.log(`req flash`, req.flash());

    const findingRounds = await Rounds.findAll();

    const roundsCourses = await Promise.all(
      findingRounds.map(async (round) => {
        return await Courses.findByPk(round.course_id);
      })
    );

    const usersForEachRound = await Promise.all(
      findingRounds.map(({ users_ids }) => {
        return Promise.all(
          users_ids.map(async (user_id) => {
            return await (
              await Users.findByPk(user_id)
            ).name;
          })
        );
      })
    );

    console.log(usersForEachRound);

    res.render("dashboard/rounds/rounds", {
      title: "Rounds",
      path: "/dashboard/rounds",
      rounds: findingRounds,
      courses: roundsCourses,
      users: usersForEachRound,
      numberOfLinks: 0,
      moment: moment,
    });
  } catch (e) {
    console.log(e);
    req.flash("error", e.message);
    res.render("dashboard/rounds/rounds", {
      title: "Rounds",
      path: "/dashboard/rounds",
      rounds: [],
      numberOfLinks: 0,
    });
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
    const allUsers = await Users.findAll();
    const allCourses = await Courses.findAll();
    let findingRoundUsersArr = [];

    if (findingRound.users_ids.length !== 0) {
      findingRoundUsersArr = await Promise.all(
        findingRound.users_ids.map(async (userId) => {
          return await Users.findByPk(userId);
        })
      );
    }

    res.render("dashboard/rounds/round_form", {
      title: "Update Single Round",
      path: "/dashboard/rounds",
      courses: allCourses,
      editMode: true,
      validationErrors: [],
      roundUsers: findingRoundUsersArr,
      usersArr: allUsers,
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
    const errors = validationResult(req);

    console.log(`Round Link: `, roundLink);

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
      res.status(402).render("dashboard/rounds/round_form", {
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
    } else {
      const findingRound = await Rounds.findByPk(roundId);
      const findingRoundCourse = await Courses.findByPk(findingRound.course_id);
      const allUsers = await Users.findAll();
      const allCourses = await Courses.findAll();
      let findingRoundUsersArr = [];

      const updatedUsersArr = Object.keys(req.body).filter((bodyItem) =>
        /user-\d/.test(bodyItem)
      );
      const updateUsersValues = updatedUsersArr.map(
        (userId) => req.body[userId]
      );

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
          await Users.update(
            {
              current_round: null,
            },
            { where: { user_id: user.user_id } }
          );
        }
      }

      const updatingRoundsResult = await Rounds.update(
        {
          round_date: moment(roundDate).toISOString(),
          round_link: roundLink,
          users_ids: updateUsersValues,
        },
        { where: { round_id: roundId } }
      );

      if (updatingRoundsResult[0] === 1) {
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
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteRound = async (req, res, next) => {
  const roundId = req.body.roundId;

  try {
    const deletingResult = await (await Rounds.findByPk(roundId)).destroy();

    console.log(`deleting round result: `, deletingResult);

    if (deletingResult) {
      req.flash("success", "Round deleted successfully");
      res.redirect("rounds");
    } else {
      req.flash("error", "There's An error");
      res.redirect("rounds");
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};
