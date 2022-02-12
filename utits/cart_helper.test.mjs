import { calcTotalPrice } from "./cart_helpers.mjs";

test("calculating total of array", () => {
  expect(calcTotalPrice([15])).toBe(15);
});
