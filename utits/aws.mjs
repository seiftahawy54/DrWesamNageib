import dotenv from "dotenv";

dotenv.config();

import fs from "fs/promises";
import { createReadStream } from "fs";
import AWS from "aws-sdk";
import path from "path";
import { errorRaiser } from "./error_raiser.mjs";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export const uploadFile = (filepath, filename, mimetype, res, next) => {
  return fs
    .readFile(filepath)
    .then((uploadingBuffer) => {
      const params = {
        Bucket: process.env.BUCKET_NAME, // pass your bucket name
        Key: `${filename}`, // file will be saved as testBucket/contacts.csv
        contentType: mimetype,
        contentDisposition: false,
        Body: JSON.stringify(uploadingBuffer, null, 2),
      };
      s3.upload(params, function (s3Err, data) {
        if (s3Err) {
          console.log(s3Err);
          errorRaiser(s3Err, next);
        } else {
          return true;
        }
      });
    })
    .catch((e) => {
      errorRaiser(e, next);
    });
};
