import UserPerCertificates from "../../models/UserPerCertificates.js";

const getCheckCertificate = async (req, res, next) => {
    const {certificateSerialNumber} = req.body;

    const certificate = await UserPerCertificates.findOne({
        where: {
            certificateHash: certificateSerialNumber,
        },
    })

    if (!certificate) {
        return res.status(404).json({
            message: "Certificate not found",
        })
    }

    return res.status(200).json({
        message: "We will send you the certificate later :D"
    })
}

export default {
    getCheckCertificate
}
