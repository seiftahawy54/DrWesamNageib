import {Router} from "express";
import PaymentsControllers from '../controllers/payments/index.js'

const paymentsRoutes = Router();


paymentsRoutes
    .get('/stripe/', PaymentsControllers.getAllDataRequiredForPayment)
    .post('/stripe/check', PaymentsControllers.postSuccessPayment)
    .post('/paypal/init', PaymentsControllers.postCreatePaypalPayment)

export default paymentsRoutes;
