import {Courses, Rounds, Users} from "../../models/index.js";
import {errorRaiser} from "../../utils/error_raiser.js";
import moment from "moment";
import {validationResult} from "express-validator";
import {Op, Sequelize} from "sequelize";
import {calcPagination, extractErrorMessages} from "../../utils/general_helper.js";
import userPerRound from "../../models/userPerRound.js";

export const getRounds = async (req, res, next) => {
    try {
        let pageNumber = req.query.page;

        if (!pageNumber) {
            pageNumber = 1;
        }

        const MAX_NUMBER = 10;
        let rounds = await Rounds.findAll({
            limit: MAX_NUMBER,
            offset: (parseInt(pageNumber) - 1) * MAX_NUMBER,
            order: [
                ["round_date", "ASC"],
                ["updatedAt", "DESC"],
                ["createdAt", "DESC"],
            ],
            attributes: ["id", "round_date", "round_id", "finished", "course_id", "round_link"],
            where: {
                isDeleted: false,
            },
            include: [
                {
                    model: Courses,
                    on: {
                        course_id: {[Op.eq]: Sequelize.col("rounds.course_id")},
                    },
                    attributes: ["name"],
                    where: {
                        isDeleted: false,
                    },
                },
            ],
        });

        for (let roundIndex = 0; roundIndex < rounds.length; roundIndex += 1) {
            const {count} = (await userPerRound.findAndCountAll({
                where: {roundId: rounds[roundIndex].round_id},
            }));
            rounds[roundIndex].dataValues.noOfUsers = count;
        }

        const pagination = await calcPagination(Rounds, pageNumber)

        return res.status(200).json({
            rounds,
            pagination
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const gerRunningRounds = async (req, res, next) => {
    try {
        const rounds = await Rounds.findAll({
            where: {
                finished: false
            },
            attributes: ["round_id", "round_date"]
        });

        return res.status(200).json(rounds);
    } catch (e) {
        await errorRaiser(e, next);
    }
}

export const getStartNewRound = async (req, res, next) => {
    try {
        const allCourses = await Courses.findAll();

        res.render("dashboard/rounds/round_form", {
            title: "Rounds",
            path: "/dashboard/rounds",
            courses: allCourses,
            editMode: false,
            validationErrors: [],
            round: {},
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postAddNewRound = async (req, res, next) => {
    try {
        const {courseId, round_date: roundDate, content: roundLink, usersIds} = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(errors.array()));
        }

        const addingResult = await Rounds.create({
            course_id: courseId,
            round_date: moment(roundDate).toISOString(),
            round_link: roundLink,
        });

        for (let userId of usersIds) {
            await userPerRound.create({
                userId,
                roundId: addingResult.round_id
            })
        }

        if (typeof addingResult === "object") {
            return res.status(201).json({message: "Round Added Successfully"});
        }
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getUpdateRound = async (req, res, next) => {
    try {
        const roundId = req.params.roundId;
        const round = await Rounds.findOne({
            where: {
                round_id: roundId
            }
        }, {
            attributes: ["round_date", "round_link", "finished", 'round_id'],
        });

        return res.send(round)

        const users = await userPerRound.findAll({
            where: {roundId},
            include: [
                {
                    model: Users,
                    on: {
                        user_id: {
                            [Op.eq]: Sequelize.col("userPerRound.userId"),
                        },
                    },
                }
            ]
        });

        const filteredUsers = users.map(({users}) => users);

        res.status(200).json({round, users: filteredUsers});
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const putUpdateRound = async (req, res, next) => {
    try {
        const roundId = req.params.roundId;
        // const {roundDate, roundLink, finishRound} = req.body;
        const {courseId, round_date: roundDate, content: roundLink, usersIds, isFinished, isArchived} = req.body;
        const errors = validationResult(req);

        return res.send(roundDate)

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(errors.array()));
        }

        const findingRound = await Rounds.findOne({
            where: {
                round_id: roundId
            }
        });

        if (isFinished) {
            const updateResult = await findingRound.update(
                {
                    finished: true,
                },
                {where: {round_id: roundId}}
            );

            return res.status(200).send('Round is finished!');
        }

        // Update round's users
        const userPerRoundResult = await userPerRound.destroy({where: {roundId}});

        for (let userId of usersIds) {
            await userPerRound.create({
                userId,
                roundId
            })
        }

        const updatingRoundsResult = await Rounds.update(
            {
                round_date: moment(roundDate).toISOString(),
                round_link: roundLink,
                finished: false,
                course_id: courseId
            },
            {where: {round_id: roundId}}
        );

        return res.status(201).send({
            updatingRoundsResult,
            userPerRoundResult
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postDeleteRound = async (req, res, next) => {
    const {roundId} = req.params;

    try {
        const round = await Rounds.update({
            isDeleted: true
        }, {where: {id: roundId}});
        if (!round) {
            return res.status(404).json({message: "Round not found"});
        }

        if (round[0] >= 1) {
            return res.status(200).json({message: "Round deleted successfully"});
        }

    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const removeUsersFromRounds = async (req, res, next) => {
    try {
        const {roundId} = req.params;
        const {usersIds} = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(errors.array()));
        }

        for (let userId of usersIds) {
            await userPerRound.destroy({where: {userId, roundId}});
        }

        return res.status(200).json({message: "Users removed successfully"});
    } catch (e) {
        await errorRaiser(e, next);
    }
}

export const addUsersToRounds = async (req, res, next) => {
    try {
        const {roundId} = req.params;
        const {usersIds} = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(errors.array()));
        }

        for (let userId of usersIds) {
            const searchingForUser = await userPerRound.findOne({
                where: {userId, roundId},
            });
            if (!searchingForUser) {
                await userPerRound.create({userId, roundId});
            }
        }

        return res.status(200).json({message: "Users added successfully"});
    } catch (e) {
        await errorRaiser(e, next);
    }
}

const roundsCoursesQueries = async () => {
    const freeUsers = (await Users.findAll({
        include: [
            {
                model: userPerRound,
                required: false,
                on: {
                    userId: {
                        [Op.eq]: Sequelize.col("user.user_id"),
                    },
                },
            }
        ],
        order: [
            ['name', "ASC"]
        ]
    })).filter(user => !user.userPerRound)

    const usersInRounds = (await userPerRound.findAll({
        include: [
            {
                model: Users,
                on: {
                    user_id: {
                        [Op.eq]: Sequelize.col("userPerRound.userId"),
                    },
                },
            },
            {
                model: Rounds,
                on: {
                    round_id: {
                        [Op.eq]: Sequelize.col("userPerRound.roundId"),
                    },
                },
                where: {
                    finished: false,
                }
            }
        ],
        order: [
            [Users, "name", "ASC"]
        ]
    })).map(({users}) => (users)).flat();

    const usersFinishedRounds = (await userPerRound.findAll({
        include: [
            {
                model: Users,
                on: {
                    user_id: {
                        [Op.eq]: Sequelize.col("userPerRound.userId"),
                    },
                },
            },
            {
                model: Rounds,
                on: {
                    round_id: {
                        [Op.eq]: Sequelize.col("userPerRound.roundId"),
                    },
                },
                where: {
                    finished: true,
                }
            }
        ],
        order: [
            [Users, "name", "ASC"]
        ]
    })).map(({users}) => (users)).flat();

    return {
        freeUsers,
        usersInRounds,
        usersFinishedRounds
    }
}

export const getUsersForRounds = async (req, res, next) => {
    try {

        const {freeUsers, usersInRounds, usersFinishedRounds} = await roundsCoursesQueries()


        return res.status(200).json({
            freeUsers,
            usersInRounds,
            usersFinishedRounds,
        });

    } catch (e) {
        await errorRaiser(e, next)
    }
}

export const getRoundsCourses = async (req, res, next) => {
    try {
        const courses = await Courses.findAll({
            attributes: ["name", "course_id"],
            where: {
                isDeleted: false,
            }
        })


        return res.status(200).json(courses);

    } catch (e) {
        await errorRaiser(e, next)
    }
}


export const getRoundData = async (req, res, next) => {
    try {
        const {roundId} = req.params;
        const round = await Rounds.findOne({
            where: {
                round_id: roundId
            },
        })

        const {freeUsers, usersInRounds, usersFinishedRounds} = await roundsCoursesQueries()
        const usersInThisRound = (await Users.findAll({
            order: [
                ['name', "ASC"]
            ],
            include: [
                {
                    model: userPerRound,
                    where: {
                        roundId
                    },
                    on: {
                        userId: {
                            [Op.eq]: Sequelize.col("user.user_id"),
                        },
                    },
                }
            ],
        }))

        return res.status(200).json({
            round,
            freeUsers,
            usersInRounds,
            usersFinishedRounds,
            usersInThisRound
        })
    } catch (e) {
        await errorRaiser(e, next)
    }
}
