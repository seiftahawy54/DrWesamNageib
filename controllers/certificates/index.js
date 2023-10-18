import UserPerCertificates from "../../models/UserPerCertificates.js";
import {Courses, Rounds, Users} from "../../models/index.js";
import {Op, Sequelize} from "sequelize";
import qr from "qrcode";
import logger from "../../utils/logger.js";
import crypto from "crypto";
import {getSingleFile} from "../../utils/aws.js";
import {createCertificate} from "../../utils/general_helper.js";
import fs from "fs";
import path from "path";
import {errorRaiser} from "../../utils/error_raiser.js";

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

    const roundAndCourse = await Rounds.findOne(
        {
            where: {course_id: certificate.courseId},
            include: [
                {
                    model: Courses,
                    as: "course",
                    on: {
                        course_id: {
                            [Op.eq]: Sequelize.col("rounds.course_id"),
                        },
                    }
                }
            ]
        }
    )

    const checkCertificateQrCode = await qr.toDataURL(`${process.env.FRONTEND_URL}/check/certificate/${certificate.courseId}`);
    let certificateSerial = '';

    const user = await Users.findOne({where: {user_id: certificate.userId}});

    getSingleFile(roundAndCourse.course.course_img)
        .then(async (response) => {
            const certificateDoc = createCertificate(
                user.name,
                user.user_id,
                roundAndCourse.course.name,
                roundAndCourse.course.total_hours,
                roundAndCourse.round_date,
                roundAndCourse.course.course_img,
                roundAndCourse.course.course_category,
                checkCertificateQrCode,
                certificateSerial
            );

            certificateDoc.certificateObject.pipe(
                fs.createWriteStream(path.resolve('public', 'certificates', certificateDoc.certificatePath))
            );

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
            res.setHeader(
                "Content-Disposition",
                `inline; filename="${certificateDoc.certificateName}"`
            );

            certificateDoc.certificateObject.pipe(res);
            certificateDoc.certificateObject.end();

            // return res.send({certificate: `certificates/${certificateDoc.certificateName}`});

        })
        .catch(async (err) => {
            logger.error(err);
            await errorRaiser(err, next)
        });
}

export default {
    getCheckCertificate
}
