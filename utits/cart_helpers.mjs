import { Users } from "../models/users.mjs";
import { errorRaiser } from "./error_raiser.mjs";

export const createEmptyCart = () => {};

export const updateCart = async (courseId, req, newCart, next) => {
  try {
    req.user.cart = JSON.stringify(newCart);
    const updatingResult = await Users.update(
      { cart: req.user.cart },
      { where: { user_id: req.user.user_id } }
    );
    console.log(req.user.cart);

    return updatingResult[0] === 1;
  } catch (e) {
    errorRaiser(e, next);
  }
};
