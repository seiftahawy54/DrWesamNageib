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
import userPerRound from "../../models/userPerRound.js";

const getCheckCertificate = async (req, res, next) => {
    let { certificateHash: certificateSerialNumber } = req.query;

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

    if (!certificate.courseId) {
        return res.status(404).json({
            message: "Certificate not found",
        })
    }

    const roundAndCourse = await userPerRound.findOne(
        {
            where: {
                userId: certificate.userId,
                [Op.or]: [
                    {specialAccess: true},
                    {specialAccess: false}
                ]
            },
            include: [
                {
                    model: Rounds,
                    as: "rounds",
                    on: {
                        round_id: {
                            [Op.eq]: Sequelize.col("userPerRound.roundId"),
                        },
                    },
                    include: [
                        {
                            model: Courses,
                            on: {
                                course_id: {
                                    [Op.eq]: Sequelize.col("rounds.course_id"),
                                },
                            },
                        }
                    ]
                },
            ]
        }
    );

    const round = roundAndCourse.rounds[0];
    const course = roundAndCourse.rounds[0].course;

    const checkCertificateQrCode = await qr.toDataURL(`${process.env.FRONTEND_URL}/check/certificate/${certificateSerialNumber}`);

    const user = await Users.findOne({where: {user_id: certificate.userId}});

    try {
        getSingleFile(course.course_img)
            .then(async (response) => {
                const certificateDoc = createCertificate(
                    user.name,
                    user.user_id,
                    course.name,
                    course.total_hours,
                    round.round_date,
                    course.course_img,
                    course.course_category,
                    checkCertificateQrCode,
                    certificateSerialNumber
                );

                certificateDoc.certificateObject.pipe(
                    fs.createWriteStream(encodeURIComponent(path.resolve('public', 'certificates', `${certificateDoc.certificatePath}`)))
                );

                res.setHeader("Content-Type", "application/pdf");
                res.setHeader(
                    "Content-Disposition",
                    `inline; filename="${certificateDoc.certificateName}"`
                );

                certificateDoc.certificateObject.pipe(res);
                certificateDoc.certificateObject.end();
            })
            .catch(async (err) => {
                console.log(err)
                return res.status(500).json({
                    message: "Something went wrong",
                })
            });
    } catch (e) {
        logger.error(e);
        await errorRaiser(e, next)
    }
}

export default {
    getCheckCertificate
}
