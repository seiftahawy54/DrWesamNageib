import mongoose from 'mongoose';
import Sequelize, {UUIDV4} from "sequelize";
import {sequelize} from "../utils/db.js";

const CoursesSchema = new mongoose.Schema({
    course_id: String,
    name: {
        type: String,
        allowNull: false,
    },
    price: {
        type: Number,
        allowNull: false,
    },
    // Rename
    // created_at: {
    //     type: Sequelize.DATE,
    //     defaultValue: sequelize.literal("current_timestamp"),
    // },
    // Change
    courseImg: {
        type: String,
        allowNull: false,
    },
    // Change
    detailedImg: String,
    description: {
        type: String,
        allowNull: false,
    },
    // Change in old
    arCourseName: {
        type: String,
        allowNull: false,
    },
    courseThumbnail: {
        type: String,
        allowNull: false,
    },
    // Change
    courseRank: {
        type: Number,
        allowNull: false,
        unique: true,
    },
    // Change
    specialCourse: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
    },
    // Change
    totalHours: {
        type: Sequelize.STRING,
    },
    // Change
    courseCategory: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
        allowNull: true,
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
        allowNull: true,
    },
    isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
})
