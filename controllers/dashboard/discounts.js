import { errorRaiser } from "../../utils/error_raiser.js";
import Discounts from "../../models/discounts.js";
import { Courses } from "../../models/courses.js";
import { validationResult } from "express-validator";

export const getDiscountsPage = async (req, res, next) => {
  try {
    const findingDiscounts = await Discounts.findAll();
    const allPrimaryKeys = [];

    let data = findingDiscounts.map(
      ({
        discount_id,
        discount_course,
        discount_percentage,
        discount_usage,
        coupon_name,
        status,
      }) => {
        allPrimaryKeys.push(discount_id);
        return {
          discount_course,
          discount_percentage,
          discount_usage,
          coupon_name,
          status: status ? "WORKING" : "CLOSED",
        };
      }
    );

    const discountCourses = await Promise.all(
      await data.map(async ({ discount_course }, index) => {
        const findingCourseResult = await Courses.findByPk(discount_course, {
          attributes: ["name"],
        });

        if (findingCourseResult) {
          data[index].discount_course = findingCourseResult.name;
          return findingCourseResult.name;
        }

        return null;
      })
    );

    data = Object.entries(data).map(([key, value], index) => {
      return {
        item: value,
        entry: key,
      };
    });

    let finalData = [];

    data.forEach((value, key) => {
      finalData.push({
        data: data[key],
        primaryKey: allPrimaryKeys[key],
        updateInputName: "discountId",
      });
    });

    res.render("dashboard/discounts/discounts", {
      title: "Discounts",
      path: "/dashboard/discounts",
      tableName: "Discounts",
      addingNewLink: "discounts",
      tableHead: [
        {
          title: "Discount Course",
          name: "discount-course",
        },
        {
          title: "Discount Percentage",
          name: "discount-percentage",
        },
        {
          title: "Number of usages",
          name: "number-of-usages",
        },
        {
          title: "Coupon Name",
          name: "coupon-name",
        },
        {
          title: "Status",
          name: "discount-status",
        },
        {
          title: "Update Coupon",
          name: "update-coupon",
        },
        {
          title: "Delete Coupon",
          name: "delete-coupon",
        },
      ],
      tableRows: finalData,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const addNewDiscount = async (req, res, next) => {
  try {
    const findingAllCourses = await Courses.findAll({
      attributes: ["course_id", "name"],
    });

    return res.render("dashboard/discounts/discounts_form", {
      title: "Add new discount",
      path: "/dashboard/discounts",
      editMode: false,
      discountCourses: findingAllCourses,
      discount: {},
      validationErrors: [],
    });
  } catch (e) {
    return await errorRaiser(e, next);
  }
};

export const postAddNewDiscount = async (req, res, next) => {
  try {
    const findingAllCourses = await Courses.findAll({
      attributes: ["course_id", "name"],
    });
    const discountCourse = req.body.discount_course;
    const discountPercentage = req.body.discount_percentage;
    const couponName = req.body.coupon_name;
    let status = req.body.status;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("dashboard/discounts/discounts_form", {
        title: "Add new discount",
        path: "/dashboard/discounts",
        editMode: false,
        discountCourses: findingAllCourses,
        discount: {
          discount_course: discountCourse,
          discount_percentage: discountPercentage,
          coupon_name: couponName,
        },
        validationErrors: errors.array(),
      });
    }

    if (status === "on") {
      status = true;
    }

    const addingNewCouponResult = await Discounts.create({
      discount_course: discountCourse,
      discount_percentage: discountPercentage,
      coupon_name: couponName,
      status,
    });

    console.log(addingNewCouponResult);

    req.flash("success", "Coupon added successfully");
    return res.redirect("/dashboard/discounts");
  } catch (e) {
    return await errorRaiser(e, next);
  }
};

export const getUpdateDiscount = async (req, res, next) => {
  try {
    const discountId = req.params.discountId;
    const findingDiscount = await Discounts.findByPk(discountId);

    const discountCourses = await Courses.findByPk(
      findingDiscount.discount_course,
      {
        attributes: ["course_id", "name"],
      }
    );

    console.log(discountCourses);

    res.render("dashboard/discounts/discounts_form", {
      title: "Update discount",
      path: "/dashboard/discounts",
      editMode: true,
      discountCourses: discountCourses,
      discount: findingDiscount,
      validationErrors: [],
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postUpdateDiscount = async (req, res, next) => {
  try {
    const discountId = req.body.discountId;
    // const discountCourse = req.body.discount_course;
    const discountPercentage = req.body.discount_percentage;
    const couponName = req.body.coupon_name;
    const errors = validationResult(req);
    let status = req.body.status;

    const discountCourse = await Courses.findByPk(discountId, {
      attribute: ["course_id", "name"],
    });

    if (!errors.isEmpty()) {
      return res.render("dashboard/discounts/discounts_form", {
        title: "Add new discount",
        path: "/dashboard/discounts",
        editMode: false,
        discountCourses: discountCourse,
        discount: {
          discount_course: discountCourse,
          discount_percentage: discountPercentage,
          coupon_name: couponName,
          status,
        },
        validationErrors: errors.array(),
      });
    }

    if (status === "on") {
      status = true;
    }

    const updatingResult = await Discounts.update(
      {
        status,
        discount_percentage: discountPercentage,
        coupon_name: couponName,
      },
      { where: { discount_id: discountId } }
    );

    if (updatingResult[0] >= 1) {
      req.flash("success", "Discount data updated successfully");
      res.redirect("/");
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteDiscount = async (req, res, next) => {
  try {
    const discountId = req.body.discountId;
    console.log(`Discount ID ==========> `, discountId);

    // const deletingResult = await (
    //   await Discounts.findByPk(discountId)
    // ).destroy();

    const deletingResult = await Discounts.findByPk(discountId);

    console.log(deletingResult);

    req.flash("success", "Discount deleted successfully");
    return res.redirect("/dashboard/discounts");
  } catch (e) {
    req.flash("error", "Discount deleting failed");
    await errorRaiser(e, next);
  }
};
