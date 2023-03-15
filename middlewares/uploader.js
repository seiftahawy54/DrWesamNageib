import Multer from "multer";

const fileStorage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "");
  },
  filename: (req, file, cb) => {
    const newFileName =
      crypto.randomBytes(10).toString("hex") + "-" + file.originalname;
    console.log(`new file image ====> `, newFileName);
    cb(null, newFileName);
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

export { fileFilter, fileStorage };
