import {errorRaiser} from "../../utils/error_raiser.js";
import {Courses, Discounts, Users} from "../../models/index.js";
import {validationResult} from "express-validator";
import config from "config";
import {calcPagination, extractErrorMessages} from "../../utils/general_helper.js";
import {Op, Sequelize} from "sequelize";
import discountPerUsage from "../../models/discountPerUsage.js";

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
            include:
                {
                    model: discountPerUsage,
                    // Select the count
                    on: {
                        discountId: {
                            [Op.eq]: Sequelize.col("discount.id"),
                        }
                    }
                }
        });

        const pagination = await calcPagination(Discounts, pageNumber)

        allDiscounts.forEach(discount => {
            discount.dataValues.numberOfUsages = discount.dataValues.discountPerUsages.length
        })

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
        next(e);
    }
};

const deleteDiscount = async (req, res, next) => {
    try {
        const {discountId} = req.params;

        const discount = await Discounts.findOne({
            where: {
                id: discountId
            }
        })

        if (!discount) {
            return res.status(404).json({message: "Discount not found"})
        }

        const updateResult = await Discounts.update({
            isDeleted: true
        })

        if (updateResult > 0) {
            return res.status(200).json({message: "Discount deleted successfully"})
        }

        return res.status(500).json({message: "Server error"})
    } catch (e) {
        next(e)
    }
}

const getSingleDiscountData = async (req, res, next) => {
    try {
        const {discountId} = req.params;
        const discount = await Discounts.findOne({
            where: {
                id: parseInt(discountId),
            }
        })

        if (!discount) {
            return res.status(404).json({message: "Discount not found"})
        }

        let usages = await discountPerUsage.findAll({
            where: {
                discountId
            },
            include: {
                model: Users,
                on: {
                    user_id: {
                        [Op.eq]: Sequelize.col("discountPerUsage.userId"),
                    },
                }
            }
        }) ?? [];

        if (usages.length > 0) {
            usages = usages.map(({users}) => users).flat();
        }

        return res.status(200).json({
            discount,
            usages
        })
    } catch (e) {
        next(e)
    }
}

const putUpdateDiscount = async (req, res, next) => {
    try {
        const {discountId} = req.params;
        const {
            discountPercentage: percentage,
            discountCode,
            status
        } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json(extractErrorMessages(errors.array()))
        }

        const discount = await Discounts.findOne({
            where: {
                id: parseInt(discountId)
            }
        })

        if (!discount) {
            return res.status(404).json({message: "Discount not found"})
        }

        const updateResult = await Discounts.update({
            percentage,
            discountCode,
            status
        }, {
            where: {
                id: parseInt(discountId)
            }
        })

        if (updateResult > 0) {
            return res.status(200).json({message: "Discount updated successfully"})
        }

        return res.status(500).json({message: "Server error"})
    } catch (e) {
        next(e)
    }
}

export default {
    getDiscountsPage,
    postAddNewDiscount,
    getCoursesToDiscounts,
    deleteDiscount,
    getSingleDiscountData,
    putUpdateDiscount
}
