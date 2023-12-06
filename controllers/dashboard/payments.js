import {errorRaiser} from "../../utils/error_raiser.js";
import moment from "moment";
import {Courses, Payment, Rounds, Users} from "../../models/index.js";
import {Op, Sequelize} from "sequelize";
import config from "config";
import {calcPagination} from "../../utils/general_helper.js";

export const getPaymentsPage = async (req, res, next) => {
    try {
        let {page} = req.query;

        if (!page) {
            page = 1;
        }

        let allPayments = await Payment.findAll({
            limit: config.get('paginationMaxSize'),
            offset: (parseInt(page) - 1) * config.get('paginationMaxSize'),
            include: [
                {
                    model: Users,
                    on: {
                        user_id: {
                            [Op.eq]: Sequelize.col('payments.user_id')
                        }
                    },
                    attributes: ['name'],
                    where: {
                        isDeleted: false
                    }
                },
                {
                    model: Courses,
                    on: {
                        course_id: {
                            [Op.eq]: Sequelize.col('payments.course_id')
                        }
                    },
                    attributes: ['name'],
                    where: {
                        isDeleted: false
                    }
                },
                {
                    model: Rounds,
                    on: {
                        round_id: {
                            [Op.eq]: Sequelize.col('payments.round_id')
                        }
                    },
                    attributes: ['title'],
                    where: {
                        isDeleted: false
                    }
                }
            ],
        })

        const pagination = await calcPagination(Payment, page)

        return res.send({
            payments: allPayments,
            pagination
        });

    } catch (e) {
        await errorRaiser(e, next);
    }
};
