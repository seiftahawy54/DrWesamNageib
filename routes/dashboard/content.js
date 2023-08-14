import {body} from "express-validator";
import {Router} from "express";
import {addNewContent, allContent} from "../../controllers/dashboard/content/content.js";
import multer from "multer";
import {fileUploader, upload} from "../../middlewares/multer.js";

export default Router()
    .get("/", allContent)
    .post('/uploadFile', fileUploader.single('contentFile'), addNewContent);
