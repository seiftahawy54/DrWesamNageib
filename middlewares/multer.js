import Multer from "multer";
import crypto from "crypto";

const fileStorage = Multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, crypto.randomBytes(10).toString("hex") + "-" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


const filesFilter = (req, file, cb) => {
    console.log(req)
    cb(null, true);
}

const upload = () => {
    return Multer({
        limits: {fileSize: 5 * 1024 * 1024},
        storage: fileStorage,
        fileFilter,
    });
};

const fileUploader = Multer({
    storage: fileStorage,
    filesFilter
})

export {upload, fileFilter, fileStorage, fileUploader};
