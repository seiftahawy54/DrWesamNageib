import { expect, it, vi, describe } from "vitest";
import { getSingleFile } from "./aws.js";

describe("getSingleFile(filename)", () => {
  it("should download image correctly", async () => {
    const downloadingTestingImage = "c5666052eafd131ca402-q11.png";

    let errorMessage = "";
    let result = null;

    try {
      await getSingleFile(downloadingTestingImage);
    } catch (e) {
      errorMessage = e.message;
    }

    console.log(`error message ==> `, errorMessage);

    expect(errorMessage).toHaveLength(0);
  });
});
