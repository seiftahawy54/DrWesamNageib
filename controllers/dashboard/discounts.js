import {errorRaiser} from "../../utils/error_raiser.js";
import {Courses, Discounts} from "../../models/index.js";
import {validationResult} from "express-validator";
import config from "config";
import {calcPagination, extractErrorMessages} from "../../utils/general_helper.js";
import {Op} from "sequelize";

const getDiscountsPage = async (req, res, next) => {
    try {
        let pageNumber = req.query.page;

        if (!pageNumber) {
            pageNumber = 1;
        }

        let allDiscounts = await Discounts.findAll({
            limit: config.get('paginationMaxSize'),
            offset: (parseInt(pageNumber) - 1) * config.get('paginationMaxSize'),
            order: [["createdAt", "DESC"], ["id", "DESC"]],
            where: {
                isDeleted: false
            },
            include: [
                {
                    model: Courses,
                }
            ]
        });

        const pagination = await calcPagination(Discounts, pageNumber)

        return res.status(200).json({
            discounts: allDiscounts,
            pagination,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const getCoursesToDiscounts = async (req, res, next) => {
    try {
        const courses = await Courses.findAll({
            attributes: ["course_id", "name"],
            where: {
                isDeleted: false,
            }
        })

        return res.status(200).json(courses);
    } catch (e) {
        await errorRaiser(e, next);
    }
}

const postAddNewDiscount = async (req, res, next) => {
    try {
        const {
            discountPercentage: percentage,
            discountCode,
            status,
            discountCourse
        } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json(extractErrorMessages(errors.array()))
        }

        const discountSearch = await Discounts.findOne({
            where: {
                discountCode: {
                    [Op.iLike]: `%${discountCode}%`
                }
            }
        })

        if (discountSearch) {
            return res.status(400).json({
                message: "Discount code already exists."
            })
        }

        const addingNewCouponResult = await Discounts.create({
            courseId: discountCourse,
            percentage,
            discountCode,
            status,
        });

        return res.status(201).json({message: "Discount added successfully"});
    } catch (e) {
        return await errorRaiser(e, next);
    }
};

export default {
    getDiscountsPage,
    postAddNewDiscount,
    getCoursesToDiscounts
}
