import { Users } from "../../models/users.mjs";

const getUsers = async (req, res, next) => {
  const allUsers = await Users.findAll();
  res.render("dashboard/users", {
    title: "Users page",
    path: "/dashboard/users",
    users: allUsers,
  });
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
