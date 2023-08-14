import { expect, it, vi, describe } from "vitest";
import { getSingleFile, uploadFile } from "./aws.js";
import path from "path";

// describe("getSingleFile(filename)", () => {
//   it("should download image correctly", async () => {
//     const downloadingTestingImage = "1ff7823c8a85262b118b-certificate.pdf";
//
//     let errorMessage = "";
//     let result = null;
//
//     try {
//       await getSingleFile(downloadingTestingImage);
//     } catch (e) {
//       errorMessage = e.message;
//     }
//
//     console.log(`error message ==> `, errorMessage);
//
//     expect(errorMessage).toHaveLength(0);
//   });
// });

describe("uploadFile(filepath, filename, mimetype, res, next)", async () => {
  it("should upload images correctly", async () => {
    // Arrange
    const filepath = path.resolve("uploads", "1ff7823c8a85262b118b-certificate.pdf");
    const fileName = "1ff7823c8a85262b118b-certificate.pdf";
    const res = {};
    const next = (err) => {
      console.log(`error from next mocked function => `, err);
    };
    let errorMessage = "";
    let result;

    try {
      result = await uploadFile(filepath, fileName, "application/pdf", res, next);
      console.log(`finishing result ==> ${result}`);
    } catch (e) {
      console.log(e);
      errorMessage = e.message;
    }

    // expect(result).toBeTruthy();
    expect(errorMessage).toHaveLength(0);
  });
});
