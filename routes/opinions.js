import {Router} from 'express'

const opinionsRoutes = Router();

opinionsRoutes
  .get("/", getAllOpinions)
  .get("/form", getOpinionsForm)
  .post(
    "/opinion",
    [
      body("name")
        .isString()
        .notEmpty()
        .trim()
        .custom((value) => {
          if (value === "Henryimmob") {
            return false;
          }
        }),
      body("email").isEmail().notEmpty(),
      body("sender_course").isString().notEmpty(),
      // body("date").isDate().notEmpty(),
      body("opinion").isString().notEmpty(),
    ],
    postOpinions
  )


const router = Router().use('/opinions', opinionsRoutes)

export default router;