import {
  deleteUser,
  getAllUsers,
  getSingleUser,
  updateSingleUser,
} from "../../models/users.mjs";

const getUsers = async (req, res, next) => {
  const allUsers = await getAllUsers();
  res.render("dashboard/users", {
    title: "Users page",
    path: "/dashboard/users",
    users: allUsers.rows,
  });
};

const postDeleteUser = async (req, res, next) => {
  const userId = req.body.userId;
  const deletingResult = await deleteUser(userId);
  if (deletingResult.command === "DELETE") {
    res.redirect("/dashboard/users");
  } else {
    res.status(400).redirect("/dashboard/users");
  }
};

const getUpdateUser = async (req, res, next) => {
  const userId = req.params.userId;

  const findingResult = await getSingleUser(userId);

  res.render("dashboard/users_forms", {
    title: "Update User",
    path: "/dashboard/users",
    user: findingResult.rows[0],
  });
};

const postUpdateUser = async (req, res, next) => {
  const userId = req.params.userId;
  const email = req.body.email;
  const name = req.body.name;
  const whatsapp_no = req.body.whatsapp_no;
  const specialization = req.body.specialization;

  const updatingSingleUser = await updateSingleUser(
    userId,
    name,
    email,
    whatsapp_no,
    specialization
  );

  if (updatingSingleUser.command === "UPDATE") {
    res.redirect("/dashboard/users");
  } else {
    const findingResult = await getSingleUser(userId);
    res.render("dashboard/users_forms", {
      title: "Update User",
      path: "/dashboard/users",
      user: findingResult.rows[0],
    });
  }
};

export { getUsers, postDeleteUser, getUpdateUser, postUpdateUser };
