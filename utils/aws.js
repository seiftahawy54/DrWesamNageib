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

export const getSingleFile = async (filename) => {
    try {
        const downloadedImagesFolder = path.resolve("downloaded_images");
        const fullImgPath = path.resolve(downloadedImagesFolder, filename);

        // Check if the file already exists
        if (fs2.existsSync(fullImgPath)) {
            const existingLink = new URL(`${process.env.STATIC_URL}/${filename}`).href;
            console.log(`${existingLink} already exists.`);
            return existingLink;
        }

        const downloadingUrl = `${process.env.AWS_URL}/${filename}`;
        const filePath = path.resolve(downloadedImagesFolder, filename);

        console.log(`AWS searching URL: ${downloadingUrl}`);
        const response = await axios({
            method: "GET",
            url: downloadingUrl,
            responseType: "arraybuffer", // Changed responseType to arraybuffer
        });
        const buffer = Buffer.from(response.data);

        await fs2.promises.mkdir(downloadedImagesFolder, { recursive: true }); // Ensure directory exists

        await fs2.promises.writeFile(filePath, buffer, "base64");

        const createdLink = new URL(`${process.env.STATIC_URL}/${filename}`).href;
        console.log(`${createdLink} image downloaded successfully`);
        return createdLink;
    } catch (e) {
        logger.error(`Error downloading image ${filename}: ${e.message}`);
        return `${process.env.AWS_URL}/${filename}`; // Return the AWS URL in case of an error
    }
}
