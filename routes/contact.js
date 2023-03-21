import {Router} from 'express'

const contactsRoutes = Router();

contactsRoutes
  .get("/", getContactPage)
  .post(
    "/",
    [
      body("contact_name").isString().notEmpty(),
      body("contact_email").isEmail().notEmpty(),
      body("contact_content").isString().isLength({
        min: 10,
      }),
    ],
    postContactPage
  )


const router = Router().use('/contact', contactsRoutes);

export default router;