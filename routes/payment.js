import {Router} from "express";
import PaymentsControllers from '../controllers/payments/index.js'

const paymentsRoutes = Router();


paymentsRoutes.get('/', PaymentsControllers.getAllDataRequiredForPayment)

export default paymentsRoutes;
