import {Users} from "../../../models/index.js";
import {Rounds} from "../../../models/index.js";
import {errorRaiser} from "../../../utils/error_raiser.js";
import {sequelize} from "../../../utils/db.js";
import moment from "moment";
import {Op} from "sequelize";
import {calcPagination, rolesMap, rolesMapper, userPerformedExams} from "../../../utils/general_helper.js";
import {
    NUMBER_TYPE,
    STRING_TYPE,
    validateRequestInput,
} from "../../../validators/typesValidators.js";
import userPerRound from "../../../models/userPerRound.js";
import config from "config";

const getSearchForUser = async (req, res, next) => {
    try {
        let {name, email, phone, specialization, rounds, role, page} = req.query;
        let error, message;
        if (name) ({error, message} = validateRequestInput(name, 'name', STRING_TYPE));
        if (email) ({error, message} = validateRequestInput(email, 'email', STRING_TYPE));
        if (phone) ({error, message} = validateRequestInput(phone, 'phone', STRING_TYPE));
        if (specialization) ({error, message} = validateRequestInput(specialization, 'specialization', STRING_TYPE));
        if (page) ({error, message} = validateRequestInput(page, 'page', STRING_TYPE))

        if (!page) {
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
            filterObject.phone = {
                [Op.iLike]: `${phone.toLowerCase()}`
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

    const user = await Users.findOne({
        user_id: userId
    });

    if (!user) {
        return res.status(404).send("User not found")
    }

    const currentRound = (
        await sequelize.query(
            `SELECT round_date FROM rounds WHERE ? LIKE ANY (rounds.users_ids)`,
            {
                type: "SELECT",
                replacements: [user.user_id],
            }
        )
    )[0]?.round_date;

    const performedExams = await userPerformedExams(userId);

    user.current_round = moment(currentRound).format("DD-MM-YYYY");

    return res.status(200).send(user);
};

const postUpdateUser = async (req, res, next) => {
    const userId = req.params.userId;
    const email = req.body.email;
    const name = req.body.name;
    const whatsapp_no = req.body.whatsapp_no;
    let finishedCurrentRound = req.body.finishing_round;
    const specialization = req.body.specialization;

    const updatingUser = await Users.findByPk(userId);

    let updatingSingleUser, updatingRoundsUsers;

    if (finishedCurrentRound === "on") {
        updatingSingleUser = await Users.update(
            {
                name,
                email,
                whatsapp_no,
                specialization,
                current_round: null,
                finished_course: updatingUser.current_round,
            },
            {where: {user_id: userId}}
        );

        const currentUserRound = await Rounds.findByPk(updatingUser.current_round);

        updatingRoundsUsers = await Rounds.update(
            {
                users_ids: currentUserRound.users_ids.filter((id) => id !== userId),
            },
            {where: {round_id: currentUserRound.round_id}}
        );
    } else {
        updatingSingleUser = await Users.update(
            {
                name,
                email,
                whatsapp_no,
                specialization,
            },
            {where: {user_id: userId}}
        );
    }

    if (updatingSingleUser[0] >= 1) {
        res.redirect("/dashboard/users");
    } else {
        const findingResult = await Users.findByPk(userId);
        res.render("dashboard/users_forms", {
            title: "Update User",
            path: "/dashboard/users",
            user: findingResult,
        });
    }
};

export {
    getUsers,
    postDeleteUser,
    getUpdateUser,
    postUpdateUser,
    getSearchForUser,
    getUsersSearchFilters
};
