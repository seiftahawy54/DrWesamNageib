import { Users } from "../../models/users.js";
import { Rounds } from "../../models/rounds.js";
import { Opinions } from "../../models/opinions.js";
import { errorRaiser } from "../../utits/error_raiser.js";

const getUsers = async (req, res, next) => {
  // const allUsers = await Users.findAll();
  try {
    let pageNumber = req.query.page;
    if (!pageNumber) {
      pageNumber = 1;
    }
    const MAX_NUMBER = 5;
    const numberOfResults = await Users.findAndCountAll();
    const fetchingResults = await Users.findAll({
      limit: MAX_NUMBER,
      offset: (parseInt(pageNumber) - 1) * MAX_NUMBER,
      order: [["created_on", "DESC"]],
    });

    res.render("dashboard/users", {
      title: "Users page",
      path: "/dashboard/users",
      users: fetchingResults,
      numberOfLinks: Math.ceil(numberOfResults.count / 5),
      activePage: pageNumber,
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

  res.render("dashboard/users_forms", {
    title: "Update User",
    path: "/dashboard/users",
    user: findingResult,
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

    console.log(`updating round users: `, updatingRoundsUsers);
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
