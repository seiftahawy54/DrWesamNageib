import dotenv from "dotenv";
import fs from "fs/promises";
import fs2 from "fs";
import AWS from "aws-sdk";
import multerS3 from "multer-s3";
import path from "path";
import axios from "axios";
import logger from "./logger.js";
import {exec} from "child_process";
import {promisify} from "util";

const execAsync = promisify(exec);

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export const uploadFileV2 = async (filePath, fileName) => {
    const blob = fs2.readFileSync(filePath)
    const uploadedImage = await s3.upload({
        Bucket: process.env.BUCKET_NAME, // pass your bucket name
        Key: fileName,
        Body: blob,
        ContentDisposition: "attachment",
        ACL: "public-read",                 // defining the permissions to get the public link
        // ContentType: mimetype,                 // Necessary to define the image content-type to view the photo in the browser with the link
        // ContentEncoding: "base64"
    }).promise()
    return {
        uploadedImage
    };
}


export const uploadFile = (filepath, filename, mimetype, res, next) => {
    return fs
        .readFile(filepath)
        .then(async (uploadingBuffer) => {
            const params = {
                Bucket: process.env.BUCKET_NAME, // pass your bucket name
                Key: filename, // file will be saved as testBucket/contacts.csv
                contentType: multerS3.AUTO_CONTENT_TYPE,
                contentDisposition: false,
                ACL: "public-read",                 // defining the permissions to get the public link
                Body: uploadingBuffer,
            };

            const uploadingResult = await s3.upload(params).promise()
            console.log(uploadingResult)
            /*function (s3Err, data) {
                if (s3Err) {
                    logger.error(`uploading error => `, s3Err);
                    errorRaiser(s3Err, next).then((res) => {
                        logger.error(`aws error ==> `, s3Err);
                    });
                } else {
                    logger.info(`uploading ... ====>  ${filename}`);
                    return true;
                }
            });*/
        })
        .catch((err) => {
            logger.error(err);
        });
};

export const getSingleFile = async (filename, customPath = '') => {
    const downloadedImagesFolder = customPath.length > 0 ? path.resolve(customPath) : path.resolve("downloaded_images");
    const fullImgPath = path.resolve(downloadedImagesFolder, filename)
    const isImagesPathExists = fs2.existsSync(downloadedImagesFolder);
    logger.info(`custom path ${isImagesPathExists} ${customPath}`);
    if (!isImagesPathExists) {
        return new URL(`${process.env.AWS_URL}/${filename}`).href;
    } else if (fs2.existsSync(fullImgPath)) {
        console.log(`${filename} exists locally at ${fullImgPath}`);
        return new URL(`${process.env.STATIC_URL}/${filename}`).href;
    } else {
        const downloadingUrl = `${process.env.AWS_URL}/${filename}`;
        const filePath = path.resolve(downloadedImagesFolder, filename);
        const isAlreadyDownloaded = fs2.existsSync(filePath);
        if (isAlreadyDownloaded) {
            return new URL(`${process.env.STATIC_URL}/${filename}`).href;
        }

        try {
            console.log(`aws searching url ${downloadingUrl}`)
            const response = await axios({
                method: "GET",
                url: downloadingUrl,
                responseType: "blob",
            });
            const buffer = Buffer.from(response.data.data).toString("base64");

            const writingStream = await fs2.createWriteStream(filePath);

            writingStream.write(buffer, "base64");

            writingStream.on("finish", () => {
                console.log(`${new URL(`${process.env.STATIC_URL}/${filename}`).href} image downloaded successfully`)
                return new URL(`${process.env.STATIC_URL}/${filename}`).href;
            });

            writingStream.on("error", (err) => {
                logger.error(err.message);
            });

            writingStream.end();
        } catch (e) {
            // logger.error(`image with problems ${filename}`);
            // logger.error(e.message);
            return new URL(`${process.env.AWS_URL}/${filename}`).href;
        }
    }
};
