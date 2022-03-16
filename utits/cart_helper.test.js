import { calcTotalPrice, cartIsEmpty } from "./cart_helpers.mjs";

test("Is empty", () => {
  expect(cartIsEmpty([{}])).toBe(true);
});

test("calculating total of array", () => {
  expect(calcTotalPrice([15])).toBe(15);
});
