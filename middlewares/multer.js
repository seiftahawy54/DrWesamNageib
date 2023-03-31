import Multer from "multer";
import crypto from "crypto";

const fileStorage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "");
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

export const upload = () => {
  return Multer({
    limits: { fileSize: 5 * 1024 * 1024 },
    storage: fileStorage,
    fileFilter,
  });
};

export { fileFilter, fileStorage };
