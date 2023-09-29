import {Router} from 'express';
import CertificatesControllers from '../controllers/certificates/index.js'

const router = Router();

router.post('/check', CertificatesControllers.getCheckCertificate)

export default router;
