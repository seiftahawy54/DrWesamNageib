import { Users } from "../../../models/index.js";
import { Rounds } from "../../../models/index.js";
import { errorRaiser } from "../../../utils/error_raiser.js";
import { sequelize } from "../../../utils/db.js";
import moment from "moment";
import { Op } from "sequelize";
import { userPerformedExams } from "../../../utils/general_helper.js";

const getUsers = async (req, res, next) => {
  // const allUsers = await Users.findAll();
  try {
    let pageNumber = req.query.page;
    let search = req.query.search;

    if (!search) {
      search = "";
    }

    if (!pageNumber) {
      pageNumber = 1;
    }

    const MAX_NUMBER = 10;
    const numberOfResults = await Users.findAndCountAll();
    let fetchingResults;

    if (typeof search === "string" && search.length > 0) {
      fetchingResults = await Users.findAll();
      const regex = new RegExp(`${search.toLowerCase()}`);
      fetchingResults = fetchingResults.filter(
        (user) => user.name.toLowerCase().search(regex) >= 0
      );
    } else {
      fetchingResults = await Users.findAll({
        limit: MAX_NUMBER,
        offset: (parseInt(pageNumber) - 1) * MAX_NUMBER,
        order: [["created_on", "DESC"]],
      });
    }

    fetchingResults = await Promise.all(
      await fetchingResults.map(async (user) => {
        if (user.current_round) {
          const roundResult = await sequelize.query(
            "SELECT round_date from rounds where round_id=?",
            {
              replacements: [user.current_round],
              type: "SELECT",
            }
          );

          if (roundResult.length > 0) {
            user.current_round = moment(roundResult[0].round_date).format("ll");
          } else {
            user.current_round = "deleted round".toUpperCase();
          }
        } else {
          user.current_round = `<i>Not Enrolled</i>`;
        }

        user.email = `<a href="mailto:${user.email}" target="_blank" class="reset-link">${user.email}</a>`;

        return user;
      })
    );

    const allPrimaryKeys = [];

    let data = await Promise.all(
      fetchingResults.map(
        async ({ user_id, name, email, current_round, whatsapp_no }, index) => {
          allPrimaryKeys.push(user_id);

          return {
            index: index + 1 + (pageNumber - 1) * MAX_NUMBER,
            email,
            name,
            current_round,
            whatsapp_no,
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
        updateInputName: "userId",
      });
    });

    return res.render("dashboard/modified_users", {
      title: "Users",
      path: "/dashboard/users",
      tableName: "Users",
      addingNewLink: "users",
      singleTableName: "users",
      tableHead: [
        {
          title: "#",
          name: "record-number",
        },
        {
          title: "User Email",
          name: "user-email",
        },
        {
          title: "User Name",
          name: "user-name",
        },
        {
          title: "Current Round",
          name: "current-round",
        },
        {
          title: "Whatsapp Number",
          name: "whatsapp-number",
        },
        {
          title: "Update User",
          name: "update-user",
        },
        {
          title: "Delete User",
          name: "delete-user",
        },
      ],
      tableRows: finalData,
      customStuff: {
        pagination: {
          numberOfLinks: Math.ceil(numberOfResults.count / MAX_NUMBER),
          activePage: pageNumber,
        },
        searching: true,
      },
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

const postDeleteUser = async (req, res, next) => {
  const userId = req.body.userId;
  try {
    const deletingResult = await (await Users.findByPk(userId)).destroy();
    if (deletingResult[0] >= 1) {
      req.flash("success", "User deleted successfully!");
      res.redirect("/dashboard/users");
    } else {
      res.status(500).redirect("/dashboard/users");
    }
  } catch (e) {
    console.error(e, next);
  }
};

const getUpdateUser = async (req, res, next) => {
  const userId = req.params.userId;

  const findingResult = await Users.findByPk(userId);

  const currentRound = (
    await sequelize.query(
      `SELECT round_date FROM rounds WHERE ? LIKE ANY (rounds.users_ids)`,
      {
        type: "SELECT",
        replacements: [findingResult.user_id],
      }
    )
  )[0]?.round_date;

  const performedExams = await userPerformedExams(userId);

  findingResult.current_round = moment(currentRound).format("DD-MM-YYYY");

  return res.render("dashboard/users_forms", {
    title: "Update User",
    path: "/dashboard/users",
    user: findingResult,
    performedExams,
    moment,
  });
};

const postUpdateUser = async (req, res, next) => {
  const userId = req.params.userId;
  const email = req.body.email;
  const name = req.body.name;
  const whatsapp_no = req.body.whatsapp_no;
  let finishedCurrentRound = req.body.finishing_round;
  const specialization = req.body.specialization;

  const updatingUser = await Users.findByPk(userId);

  let updatingSingleUser, updatingRoundsUsers;

  if (finishedCurrentRound === "on") {
    updatingSingleUser = await Users.update(
      {
        name,
        email,
        whatsapp_no,
        specialization,
        current_round: null,
        finished_course: updatingUser.current_round,
      },
      { where: { user_id: userId } }
    );

    const currentUserRound = await Rounds.findByPk(updatingUser.current_round);

    updatingRoundsUsers = await Rounds.update(
      {
        users_ids: currentUserRound.users_ids.filter((id) => id !== userId),
      },
      { where: { round_id: currentUserRound.round_id } }
    );
  } else {
    updatingSingleUser = await Users.update(
      {
        name,
        email,
        whatsapp_no,
        specialization,
      },
      { where: { user_id: userId } }
    );
  }

  if (updatingSingleUser[0] >= 1) {
    res.redirect("/dashboard/users");
  } else {
    const findingResult = await Users.findByPk(userId);
    res.render("dashboard/users_forms", {
      title: "Update User",
      path: "/dashboard/users",
      user: findingResult,
    });
  }
};

export { getUsers, postDeleteUser, getUpdateUser, postUpdateUser };
