import {Router} from 'express';
import CertificatesControllers from '../controllers/certificates/index.js'

const router = Router();

router.get('/check', CertificatesControllers.getCheckCertificate)

export default router;
