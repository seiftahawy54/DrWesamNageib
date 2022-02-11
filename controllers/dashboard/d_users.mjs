import { Users } from "../../models/users.mjs";
import { Opinions } from "../../models/opinions.mjs";
import { errorRaiser } from "../../utits/error_raiser.mjs";

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
    });

    res.render("dashboard/users", {
      title: "Users page",
      path: "/dashboard/users",
      users: fetchingResults,
      numberOfLinks: Math.ceil(numberOfResults.count / 5),
    });
  } catch (e) {
    errorRaiser(e, next);
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
  const specialization = req.body.specialization;

  const updatingSingleUser = await Users.update(
    {
      name,
      email,
      whatsapp_no,
      specialization,
    },
    { where: { user_id: userId } }
  );

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
