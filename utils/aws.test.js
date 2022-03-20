import { getSingleFile } from "./aws.mjs";

test("Getting single file from AWS server", () => {
  expect(getSingleFile("9ac4abc3ecbb91b3ed43-grokking.jpeg")).toBeTruthy();
});
