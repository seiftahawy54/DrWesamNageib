import {Exams, ExamsReplies, Users} from "../../../models/index.js";
import {Rounds} from "../../../models/index.js";
import {errorRaiser} from "../../../utils/error_raiser.js";
import {sequelize} from "../../../utils/db.js";
import moment from "moment";
import {Op, Sequelize} from "sequelize";
import {
    calcPagination, constructError,
    extractErrorMessages,
    rolesMap,
    rolesMapper,
    userPerformedExams
} from "../../../utils/general_helper.js";
import {
    NUMBER_TYPE,
    STRING_TYPE,
    validateRequestInput,
} from "../../../validators/typesValidators.js";
import userPerRound from "../../../models/userPerRound.js";
import config from "config";
import {validationResult} from "express-validator";
import bcrypt from "bcrypt";

const getSearchForUser = async (req, res, next) => {
    try {
        let {name, email, phone, specialization, rounds, role, page} = req.query;
        let error, message;
        if (name) ({error, message} = validateRequestInput(name, 'name', STRING_TYPE));
        if (email) ({error, message} = validateRequestInput(email, 'email', STRING_TYPE));
        if (phone) ({error, message} = validateRequestInput(phone, 'phone', STRING_TYPE));
        if (specialization) ({error, message} = validateRequestInput(specialization, 'specialization', STRING_TYPE));
        if (page) ({error, message} = validateRequestInput(page, 'page', STRING_TYPE))

        if (!page || page < 1) {
            page = 1
        }

        if (error) {
            return res.status(400).json({message});
        }

        const filterObject = {};

        if (name) {
            filterObject.name = {
                [Op.iLike]: `%${name.toLowerCase()}%`
            };
        }

        if (email) {
            filterObject.email = {
                [Op.iLike]: `%${email.toLowerCase()}%`
            };
        }

        if (phone) {
            filterObject.whatsapp_no = {
                [Op.iLike]: `%${phone}%`
            };
        }

        if (specialization) {
            filterObject.specialization = {
                [Op.iLike]: `%${specialization.toLowerCase()}%`
            };
        }

        if (rounds) {
            rounds = moment(rounds).toISOString()
        } else {
            rounds = ''
        }

        if (role) {
            const mapResult = rolesMapper(true, role)
            if (mapResult >= 4) {
                filterObject.type = {
                    [Op.gte]: mapResult
                };
            } else {
                filterObject.role = {
                    [Op.eq]: mapResult
                };
            }
        }

        const includeRounds = rounds.length === 0 ? {} : {
            round_date: rounds
        }

        const users = await Users.findAll({
            where: {
                ...filterObject,
                isDeleted: false,
            },
            include: [
                {
                    model: userPerRound,
                    on: {
                        userId: {
                            [Op.eq]: sequelize.col("user.user_id"),
                        }
                    },
                    include: [
                        {
                            model: Rounds,
                            on: {
                                round_id: {
                                    [Op.eq]: sequelize.col("userPerRound.roundId"),
                                }
                            },
                            attributes: ['round_date'],
                            where: {
                                ...includeRounds
                            }
                        }
                    ]
                }
            ]
        })

        const pagination = await calcPagination(null, page, true, users)

        return res.status(200).json({
            pagination,
            users
        })
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const getUsersSearchFilters = async (req, res, next) => {
    /**
     * {
     *     // Categories
     *     // Values
     * }
     */

    const categories = [
        "Role",
        "Rounds"
    ];

    const values = [
        Object.values(rolesMap),
        (await Rounds.findAll({
            attributes: ["round_date"],
            where: {
                finished: false,
                archived: false,
                isDeleted: false,
            },
            order: [["round_date", "DESC"]],
        })).map(({round_date}) => moment(round_date).format('DD-MMM-YYYY')).flat(),
    ];

    return res.status(200).send({
        categories,
        values
    })
}

const getUsers = async (req, res, next) => {
    try {
        let pageNumber = req.query.page;

        if (!pageNumber) {
            pageNumber = 1;
        }

        let fetchingResults = await Users.findAll({
            limit: config.get('paginationMaxSize'),
            offset: (parseInt(pageNumber) - 1) * config.get('paginationMaxSize'),
            order: [["created_on", "DESC"], ["id", "DESC"]],
            where: {
                isDeleted: false
            },
            include: [
                {
                    model: userPerRound,
                    on: {
                        userId: {
                            [Op.eq]: sequelize.col("user.user_id"),
                        }
                    },
                    include: [
                        {
                            model: Rounds,
                            on: {
                                round_id: {
                                    [Op.eq]: sequelize.col("userPerRound.roundId"),
                                }
                            },
                            attributes: ['round_date']
                        }
                    ]
                }
            ]
        });

        const pagination = await calcPagination(Users, pageNumber)

        return res.status(200).json({
            users: fetchingResults,
            pagination,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const postDeleteUser = async (req, res, next) => {
    const {userId} = req.params;
    try {
        const user = await Users.update({
            isDeleted: true
        }, {
            where: {
                user_id: userId
            }
        })

        if (user[0] >= 1) {
            return res.status(200).json({message: "User deleted successfully"});
        }
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const getUpdateUser = async (req, res, next) => {
    const {userId} = req.params;

    // Searching for user
    const user = await Users.findOne({
        where: {
            user_id: userId
        }
    });

    if (!user) {
        return res.status(404).send("User not found")
    }

    // Searching if user joined any rounds
    const rounds = await userPerRound.findAll({
        where: {
            userId: userId,
            [Op.or]: [
                {
                    specialAccess: false,
                }, {
                    specialAccess: true
                }
            ]
        },
        include: [
            {
                model: Rounds,
                attributes: ['round_id', 'round_date', 'finished', 'course_id', 'title'],
                on: {
                    round_id: {
                        [Op.eq]: Sequelize.col("userPerRound.roundId"),
                    },
                }
            }
        ]
    })

    // Exams Replies
    const examsReplies = await ExamsReplies.findAll({
        where: {
            user_id: userId,
            isDeleted: false,
        },
        attributes: ['reply_id', 'grade', 'createdAt'],
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: Exams,
                as: "exam",
                on: {
                    exam_id: {
                        [Op.eq]: Sequelize.col("exams_replies.exam_id"),
                    },
                },
                attributes: ['exam_id', 'title', 'questions']
            }
        ]
    });

    // Calculating grades
    const totalQuestionsGrade = (questions) => {
        return questions.filter(question => {
            return question && ("questionHeader" in question);
        }).length
    }

    examsReplies.forEach(reply => {
        reply.dataValues.maxGrade = totalQuestionsGrade(reply.exam.questions);
    })

    if (user.type > 3) {
        user.type = 4;
    }

    return res.status(200).send({
        user,
        rounds,
        examsReplies
    });
};

const postUpdateUser = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const {name, type, email, specialization, whatsappNumber: whatsapp_no} = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).send(extractErrorMessages(errors.array()));
        }

        const user = await Users.update({
            name,
            type,
            email,
            specialization,
            whatsapp_no
        }, {
            where: {
                user_id: userId
            }
        })

        if (user[0] >= 1) {
            return res.status(200).send("User updated successfully");
        }
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const getUserSpecialRoundAccess = async (req, res, next) => {
    try {
        const {userId} = req.params;

        const usersCurrentRounds = await userPerRound.findAll({
            where: {
                userId,
            },
        })

        const rounds = await Rounds.findAll({
            where: {
                round_id: {
                    [Op.notIn]: usersCurrentRounds.map((round) => round.roundId),
                },
                finished: true
            },
            attributes: ['round_id', 'round_date', 'finished', 'title', 'createdAt'],
            order: [['createdAt', 'desc']]
        })

        return res.status(200).send(rounds)
    } catch (e) {
        await errorRaiser(e, next);
    }
}

const putUpdateUserPassword = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const {password, confirmPassword} = req.body;

        if (password !== confirmPassword) {
            return res.status(422).json(
                constructError(
                    "password",
                    "Passwords do not match",
                )
            )
        }

        const encryptionResult = bcrypt.hashSync(password, 12);

        const updateUserPasswordResult = await Users.update({
            password: encryptionResult
        }, {
            where: {
                user_id: userId
            }
        })

        if (updateUserPasswordResult[0] >= 1) {
            return res.status(200).send("Password updated successfully");
        } else {
            return res.status(500).send("Something went wrong")
        }
    } catch (e) {
        await errorRaiser(e, next);
    }
}

const putRemoveUserFromRounds = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const {rounds} = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.send(422).send(extractErrorMessages(errors.array()))
        }

        for (let i = 0; i < rounds.length; i++) {
            await userPerRound.destroy({where: {userId, roundId: rounds[i]}});
        }

        return res.status(200).send("User Removed from rounds successfully!")
    } catch (e) {
        await errorRaiser(e, next);
    }
}

const addUserToSpecialAccessRound = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const {rounds} = req.body;
        let specialAccess = req.query.specialAccess === 'true';

        const usersToRoundArr = rounds.map(round => ({
            userId,
            roundId: round,
            specialAccess,
        }))

        const result = await userPerRound.bulkCreate(usersToRoundArr);

        return res.status(200).send(result);
    } catch (e) {
        await errorRaiser(e, next);
    }
}

const gerRunningRounds = async (req, res, next) => {
    try {

        const {userId} = req.params;

        const usersCurrentRounds = await userPerRound.findAll({
            where: {
                userId,
            },
        })

        const rounds = await Rounds.findAll({
            where: {
                round_id: {
                    [Op.notIn]: usersCurrentRounds.map((round) => round.roundId),
                },
                finished: false
            },
            attributes: ['round_id', 'round_date', 'finished', 'title', 'createdAt'],
            order: [['createdAt', 'desc']]
        })


        return res.status(200).send(rounds);
    } catch (e) {
        await errorRaiser(e, next);
    }
}

const deleteExamsRepliesForUser = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const {replies} = req.body;

        for (let i = 0; i < replies.length; i++) {
            await ExamsReplies.update({
                isDeleted: true
            }, {
                where: {
                    reply_id: replies[i],
                    user_id: userId
                }
            });
        }

        return res.status(200).send("Exams Replies deleted successfully!");
    } catch (e) {
        await errorRaiser(e, next);
    }
}

export {
    getUsers,
    postDeleteUser,
    getUpdateUser,
    postUpdateUser,
    getSearchForUser,
    getUsersSearchFilters,
    getUserSpecialRoundAccess,
    putUpdateUserPassword,
    putRemoveUserFromRounds,
    addUserToSpecialAccessRound,
    gerRunningRounds,
    deleteExamsRepliesForUser
};
