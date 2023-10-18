import mongoose from 'mongoose';

const UsersSchema = new mongoose.Schema({
    user_id: String,
    name: String,
    email: {
        type: String,
        allowNull: false,
        unique: true,
    },
    phoneNumber: {
        type: String,
        allowNull: false,
    },
    specialization: {
        type: String,
        allowNull: false,
    },
    payment_details: [
        {
            type: String,
        }
    ],
    password: {
        type: mongoose.Types.TEXT,
        allowNull: true,
    },
    cart: {
        type: [{
            roundId: String,
            courseId: String,
        }],
        allowNull: true,
    },
    type: {
        type: mongoose.Types.INTEGER,
        allowNull: true,
    },
    user_img: {
        type: String,
    },
    finished_course: {
        type: String,
    },
    certificate_id: {
        type: String,
    },
    applied_coupon: {
        type: String,
    },
    performed_exams: [
        {
            type: String,
        }
    ],
    reset_token: String,
    token_date: Date,
    current_round: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        defaultValue: false,
    }
}, {timestamps: true});

const Users = mongoose.model('user', UsersSchema);

export default Users;

