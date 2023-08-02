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

        let rounds = await Rounds.findAll({
            order: [
                ["round_date", "ASC"],
                ["updatedAt", "DESC"],
                ["createdAt", "DESC"],
            ],
            attributes: ["round_date", "round_id", "finished", "course_id", "round_link"],
            include: [
                {
                    model: userPerRound,
                    on: {
                        round_id: {
                            [Op.eq]: Sequelize.col("userPerRound.roundId"),
                        }
                    }
                },
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

        const pagination = calcPagination(Rounds, pageNumber)

        return res.status(200).json({
            rounds,
            pagination
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

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
        const {round_course: roundCourse, round_date: roundDate, round_link: roundLink, usersIds} = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(errors.array()));
        }

        const addingResult = await Rounds.create({
            course_id: roundCourse,
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
        const round = await Rounds.findByPk(roundId, {
            attributes: ["round_date", "round_link", "finished", 'round_id'],
        });
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
        const {roundDate, roundLink, finishRound} = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(errors.array()));
        }

        const findingRound = await Rounds.findByPk(roundId);

        if (finishRound) {
            const updateResult = await findingRound.update(
                {
                    finished: true,
                },
                {where: {round_id: roundId}}
            );

            return res.status(200).send('Round is finished!');
        }

        const updatingRoundsResult = await Rounds.update(
            {
                round_date: moment(roundDate).toISOString(),
                round_link: roundLink,
                finished: false,
            },
            {where: {round_id: roundId}}
        );

        return res.status(201).send("Round updated successfully");
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postDeleteRound = async (req, res, next) => {
    const roundId = req.body.roundId;

    try {
        const deletingResult = await (await Rounds.findByPk(roundId)).destroy();

        if (deletingResult.length === 0) {
            req.flash("success", "Round deleted successfully");
            res.redirect("/dashboard/rounds");
        } else {
            req.flash("error", "There's An error");
            res.redirect("/dashboard/rounds");
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
