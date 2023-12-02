import {Courses, Rounds, Users} from "../../models/index.js";
import {validationResult} from "express-validator";
import {
    calcPagination,
    constructError,
    deleteFile,
    extractErrorMessages,
} from "../../utils/general_helper.js";
import {resolve} from "path";
import {errorRaiser} from "../../utils/error_raiser.js";
import {uploadFile, uploadFileV2} from "../../utils/aws.js";
import logger from "../../utils/logger.js";
import config from "config";

const getCourses = async (req, res, next) => {
    try {
        let pageNumber = req.query.page;

        if (!pageNumber) {
            pageNumber = 1;
        }

        const courses = await Courses.findAll({
            limit: config.get('paginationMaxSize'),
            offset: (parseInt(pageNumber) - 1) * config.get('paginationMaxSize'),
            order: [
                ["id", "ASC"],
                ["updatedAt", "DESC"],
                ["createdAt", "DESC"],
            ],
            where: {
                isDeleted: false,
            }
        });

        const pagination = await calcPagination(Rounds, pageNumber)

        return res.status(200).json({
            courses,
            pagination
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const getAddNewCourse = (req, res, next) => {
    res.render("dashboard/courses_forms", {
        title: "New Course",
        path: "/dashboard/courses",
        editMode: false,
        course: {},
        validationErrors: [],
    });
};

const postAddNewCourse = async (req, res, next) => {
    try {
        const {
            courseName,
            arCourseName,
            courseThumbnail,
            coursePrice,
            courseRank,
            courseDescription,
            isSpecial,
            courseCategory,
            courseTotalHours,
        } = req.body;

        const {
            briefImg,
            mainImg,
        } = req.files;

        const {uploadedImage: mainImgUploadedData} = await uploadFileV2(briefImg[0].path, briefImg[0].filename);
        const {uploadedImage: briefImgUploadedData} = await uploadFileV2(mainImg[0].path, briefImg[0].filename);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(errors.array()));
        }

        const addingResult = await Courses.create({
            name: courseName,
            price: coursePrice,
            course_img: mainImgUploadedData.Location,
            detailed_img: briefImgUploadedData.Location,
            description: courseDescription,
            ar_course_name: arCourseName,
            course_thumbnail: courseThumbnail,
            course_rank: courseRank,
            special_course: isSpecial,
            course_category: courseCategory,
            total_hours: courseTotalHours,
        });

        return res.status(200).send(addingResult);
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const postDeleteCourse = async (req, res, next) => {
    const {courseId} = req.params;
    const course = await Courses.findByPk(courseId);
    if (!course) {
        return res.status(400).json(constructError("courseId", "Wrong course id"));
    }

    const deleteResult = course.update(
        {isDeleted: true},
        {where: {course_id: courseId}}
    );

    logger.info(`delete result ${deleteResult}`);

    if (deleteResult) {
        return res.status(200).json({message: "Course deleted successfully"});
    }
    return res.status(400).json({message: "Server error"});
};

const getEditCourse = async (req, res, next) => {
    try {
        const {courseId} = req.params;

        const course = await Courses.findOne({
            where: {
                course_id: courseId
            }
        });

        if (!course) {
            return res.status(404).json(constructError("courseId", "Wrong course id"));
        }

        return res.status(200).send(course);

    } catch (e) {
        await errorRaiser(e, next);
    }
};

const postUpdateCourse = async (req, res, next) => {
    try {
        const {courseId} = req.params;

        const course = await Courses.findOne({
            where: {course_id: courseId},
        })

        if (!course) {
            return res.status(404).json(constructError("courseId", "Wrong course id"));
        }

        const {
            courseName,
            arCourseName,
            courseThumbnail,
            coursePrice,
            courseRank,
            courseDescription,
            isSpecial,
            courseCategory,
            courseTotalHours,
        } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(errors.array()));
        }

        let updatedCourse = {
            name: courseName,
            price: coursePrice,
            description: courseDescription,
            ar_course_name: arCourseName,
            course_thumbnail: courseThumbnail,
            course_rank: courseRank,
            special_course: isSpecial,
            course_category: courseCategory,
            total_hours: courseTotalHours,
        }

        if ("briefImg" in req.files) {
            const {uploadedImage} = (await uploadFileV2(req.files['briefImg'][0].path, req.files['briefImg'][0].filename))
            updatedCourse['detailed_img'] = uploadedImage.Location
        }

        if ("mainImg" in req.files) {
            const {uploadedImage} = (await uploadFileV2(req.files['mainImg'][0].path, req.files['mainImg'][0].filename));
            console.log(`This is upload result  ====> `, uploadedImage.Location)
            updatedCourse['course_img'] = uploadedImage.Location
        }

        const addingResult = await Courses.update(updatedCourse, {where: {course_id: courseId}});

        console.log(addingResult)

        return res.status(200).send(addingResult)
    } catch (e) {
        await errorRaiser(e, next);
    }
}

export {
    getCourses,
    getAddNewCourse,
    getEditCourse,
    postAddNewCourse,
    postUpdateCourse,
    postDeleteCourse,
};
