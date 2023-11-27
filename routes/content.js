import {Router} from 'express'
import Contents from "../controllers/content/contents.js";

const contentRoutes = Router();

contentRoutes
    .get('/all', Contents.getAllContentForUser)
    .get("/:contentId", Contents.getContentLink)

export default contentRoutes;
