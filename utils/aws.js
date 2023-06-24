import dotenv from "dotenv";

dotenv.config();

import fs from "fs/promises";
import fs2 from "fs";
import AWS from "aws-sdk";
import { errorRaiser } from "./error_raiser.js";
import multerS3 from "multer-s3";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";
import axios from "axios";
import logger from "./logger.js";

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
        Key: filename, // file will be saved as testBucket/contacts.csv
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: false,
        Body: JSON.stringify(uploadingBuffer, null, 2),
      };

      const uploadingResult = s3.upload(params, function (s3Err, data) {
        if (s3Err) {
          logger.error(`uploading error => `, s3Err);
          errorRaiser(s3Err, next).then((res) => {
            logger.error(`aws error ==> `, s3Err);
          });
        } else {
          logger.info(`uploading ... ====>  ${filename}`);
          return true;
        }
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

export const getSingleFile = async (filename) => {
  const downloadedImagesFolder = path.resolve("downloaded_images");
  const fullImgPath = path.resolve(downloadedImagesFolder, filename)

  return new Promise(async (resolve, reject) => {
    if (!fs2.existsSync(downloadedImagesFolder)) {
      const imgsPath = path.resolve("downloaded_images");
      fs2.mkdirSync(imgsPath);
      return getSingleFile(filename);
    } else if (fs2.existsSync(fullImgPath)) {
      resolve(true);
      console.log(`${fullImgPath} exists`)
      return true
    } else {
      const downloadingUrl = `https://seiftahawy.s3.amazonaws.com/${filename}`;
      const filePath = path.resolve("downloaded_images", filename);
      const isAlreadyDownloaded = fs2.existsSync(filePath);
      if (isAlreadyDownloaded) {
        resolve(true);
        return true;
      }

      try {
        const response = await axios({
          method: "GET",
          url: downloadingUrl,
          responseType: "blob",
        });
        const buffer = Buffer.from(response.data.data).toString("base64");

        const writingStream = await fs2.createWriteStream(filePath);

        writingStream.write(buffer, "base64");

        writingStream.on("finish", () => {
          resolve(true);
          return true;
        });

        writingStream.on("error", (err) => {
          logger.error(err);
          reject(false);
          return false;
        });

        writingStream.end();
      } catch (e) {
        logger.error(e.message);
      }
    }
  });
};
