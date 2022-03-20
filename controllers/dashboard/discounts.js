import { errorRaiser } from "../../utils/error_raiser.js";
import Discounts from "../../models/discounts.js";
import { Courses } from "../../models/courses.js";

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
      }) => {
        allPrimaryKeys.push(discount_id);
        return {
          discount_course,
          discount_percentage,
          discount_usage,
          coupon_name,
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
      path: "Discounts",
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
    const discountCourse = req.body.discount_course;
    const discountPercentage = req.body.discount_percentage;
    const couponName = req.body.coupon_name;

    const addingNewCouponResult = await Discounts.create({
      discount_course: discountCourse,
      discount_percentage: discountPercentage,
      coupon_name: couponName,
    });

    console.log(addingNewCouponResult);

    req.flash("success", "Coupon added successfully");
    return res.redirect("/dashboard/discounts");
  } catch (e) {
    return await errorRaiser(e, next);
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
