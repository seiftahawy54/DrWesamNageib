import {Router} from 'express'
import { getAboutPageDataApi } from '../controllers/shop.js';

const aboutRouter = Router();

aboutRouter
  .get("/", getAboutPageDataApi)


export default aboutRouter;