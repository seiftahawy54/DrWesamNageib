import {Router} from "express";
import PaymentsControllers from '../controllers/payments/index.js'

const paymentsRoutes = Router();


paymentsRoutes
    .get('/', PaymentsControllers.getAllDataRequiredForPayment)
    .post('/check', PaymentsControllers.postSuccessPayment)

export default paymentsRoutes;
