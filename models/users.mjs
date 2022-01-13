// const db = require("../utits/db");
import db from "../utits/db.mjs";

const getSingleUser = (userId) => {
  return db
    .query("SELECT * FROM users WHERE user_id=$1", [userId])
    .then((res) => res)
    .catch((err) => err);
};

const updateSingleUser = (userId, name, email, whatsapp_no, specialization) => {
  return db
    .query(
      "UPDATE users SET name=$1, email=$2, whatsapp_no=$3, specialization=$4 WHERE user_id=$5;",
      [name, email, whatsapp_no, specialization, userId]
    )
    .then((res) => res)
    .catch((err) => err);
};

const deleteUser = (userId) => {
  return db
    .query("DELETE FROM users WHERE user_id=$1", [userId])
    .then((res) => res)
    .catch((err) => err);
};

const getNumberOfUsers = () => {
  return db
    .query("SELECT count(*) FROM users;")
    .then((result) => result)
    .catch((err) => err);
};

const getAllUsers = () => {
  return db
    .query("SELECT * FROM users;")
    .then((result) => result)
    .catch((err) => err);
};

const addUserInfoWithoutCart = (
  id,
  name,
  email,
  whatsappNum,
  specialization
) => {
  // INSERT INTO users(user_id, name, email, whatsapp_no, specialization, created_on) VALUES ('9cdb8bbfd501f508e56', 'test', '12345', 'seif@seif.com','01142134559', '12-01-2022');
  return db
    .query(
      "INSERT INTO users(user_id, name, email, whatsapp_no, specialization, created_on) VALUES ($1, $2, $3, $4, $5, current_timestamp);",
      [id, name, email, whatsappNum, specialization]
    )
    .then((result) => result)
    .catch((err) => err);
};

const addUserPaymentDetails = (id, details) => {
  return db
    .query("UPDATE users SET payment_details=$1 WHERE user_id=$2", [
      details,
      id,
    ])
    .then((result) => result)
    .catch((err) => err);
};

export {
  updateSingleUser,
  deleteUser,
  getSingleUser,
  getNumberOfUsers,
  getAllUsers,
  addUserInfoWithoutCart,
  addUserPaymentDetails,
};
