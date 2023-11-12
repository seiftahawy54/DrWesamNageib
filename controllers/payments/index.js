import axios from "axios";
import {errorRaiser} from "../../utils/error_raiser.js";
import {Courses, Rounds, Users} from "../../models/index.js";
import {calcTotalPrice, extractArrOfPrices, findCartCourses} from "../../utils/cart_helpers.js";
import {Op, Sequelize} from "sequelize";
import stripe from "stripe";
import userPerRound from "../../models/userPerRound.js";
import config from "config";
import paypal from "@paypal/checkout-server-sdk";

const paypalBaseLink = config.get(`paypal${process.env.NODE_ENV === 'production' ? 'Live' : 'Sandbox'}Link`);

let stripeSession = new stripe(process.env.STRIPE_API_KEY);

const getAllDataRequiredForPaymentV1 = async (req, res, next) => {
    try {
        const cart = (await Users.findOne({
            where: {
                id: req.user.id
            }
        })).cart

        const coursesArr = await findCartCourses(cart);

        if (coursesArr.length === 0) {
            return res.status(200).json({
                message: "Cart is empty"
            })
        }

        if (!coursesArr) {
            return res.status(404).json({
                message: "Cart is empty"
            })
        }

        let coursesRoundsDates = await Promise.all(
            coursesArr.map(async ({course_id}) => {
                return (
                    await Rounds.findAll({
                        include: [
                            {
                                model: Courses,
                                on: {
                                    course_id: {
                                        [Op.eq]: Sequelize.col("rounds.course_id"),
                                    }
                                },
                                where: {
                                    course_id
                                }
                            }
                        ]
                    })
                )
            })
        )

        // coursesRoundsDates = coursesRoundsDates.map((courseRound) => courseRound);

        const arrOfPrices = extractArrOfPrices(coursesArr);
        const totalPrice = calcTotalPrice(arrOfPrices);


        const tokenRequest = await axios
            .post('https://accept.paymob.com/api/auth/tokens', {
                api_key: process.env.PAYMOB_API_KEY,
            })

        /*
        const orderData = {
            auth_token: accessToken,
            delivery_needed: "false",
            amount_cents,
            currency: "EGP",
            items: order_cart,
          };
        */

        const {data: orderRequestData} = await axios
            .post('https://accept.paymob.com/api/ecommerce/orders', {
                auth_token: tokenRequest.data.token,
                "delivery_needed": "false",
                "amount_cents": "100",
                "currency": "EGP",
                "items": [
                    {
                        "name": "Dr Wesam Nageib Courses",
                        "amount_cents": totalPrice * 100 * 35.9,
                        "description": "Quality courses",
                        "quantity": "1"
                    },
                    // {
                    //     "name": "ERT6565",
                    //     "amount_cents": "200000",
                    //     "description": "Power Bank",
                    //     "quantity": "1"
                    // }
                ],
            })

        /*
        auth_token: accessToken,
        amount_cents,
        expiration: 3600,
        order_id: orderId,
        billing_data,
        currency: "EGP",
        integration_id: 2329228, // Replace with your integration id
        */

        const {data: acceptanceRequest} = await axios
            .post(`https://accept.paymob.com/api/acceptance/payment_keys`,
                {
                    auth_token: tokenRequest.data.token,
                    amount_cents: "100",
                    expiration: 3600,
                    order_id: orderRequestData.id,
                    currency: "EGP",
                    integration_id: 3692902,
                    billing_data: {
                        "apartment": "803",
                        "email": "claudette09@exa.com",
                        "floor": "42",
                        "first_name": "Clifford",
                        "street": "Ethan Land",
                        "building": "8028",
                        "phone_number": "+86(8)9135210487",
                        "shipping_method": "PKG",
                        "postal_code": "01898",
                        "city": "Jaskolskiburgh",
                        "country": "CR",
                        "last_name": "Nicolas",
                        "state": "Utah"
                    },
                })

        const paymentLink = `https://accept.paymob.com/api/acceptance/iframes/746129?payment_token=${acceptanceRequest.token}`

        // return res.send({
        //     cart,
        //     coursesRoundsDates,
        //     totalPrice,
        //     paymentLink
        // })

        return res.send(paymentLink)

    } catch (e) {
        await errorRaiser(e, next);
    }
}

const getAllDataRequiredForPayment = async (req, res, next) => {
    try {
        const cart = (await Users.findOne({
            where: {
                id: req.user.id
            }
        })).cart

        const coursesArr = await findCartCourses(cart);

        if (coursesArr.length === 0) {
            return res.status(200).json({
                message: "Cart is empty"
            })
        }

        if (!coursesArr) {
            return res.status(404).json({
                message: "Cart is empty"
            })
        }

        let coursesRoundsDates = await Promise.all(
            coursesArr.map(async ({course_id}) => {
                return (
                    await Rounds.findAll({
                        include: [
                            {
                                model: Courses,
                                on: {
                                    course_id: {
                                        [Op.eq]: Sequelize.col("rounds.course_id"),
                                    }
                                },
                                where: {
                                    course_id
                                }
                            }
                        ]
                    })
                )
            })
        )

        // coursesRoundsDates = coursesRoundsDates.map((courseRound) => courseRound);

        const arrOfPrices = extractArrOfPrices(coursesArr);
        const totalPrice = calcTotalPrice(arrOfPrices);


        const session = await stripeSession.checkout.sessions.create({
            line_items: [
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Quality courses"
                        },
                        unit_amount: totalPrice * 100,
                    },
                    quantity: 1,
                },
            ],
            payment_method_types: ["card"],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        return res.send(session.url);

    } catch (e) {
        await errorRaiser(e, next);
    }
}

const postSuccessPayment = async (req, res, next) => {
    try {
        const {sessionId} = req.body;

        const session = await stripeSession.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return res.status(200).json({
                message: "Payment is not successful"
            })
        }

        const user = await Users.findOne({
            where: {
                id: req.user.id
            }
        });

        const rounds = user.cart.map((item) => item.roundId)

        for (let round of rounds) {
            await userPerRound.create({
                roundId: round,
                userId: user.id
            })
        }

        await user.update({
            cart: []
        })

        return res.status(200).json({
            message: "Payment is successful"
        })

    } catch (e) {
        await errorRaiser(e, next);
    }
}

const accessToken = async () => axios.post(
    `${paypalBaseLink}/v1/oauth2/token`,
    new URLSearchParams({
        'grant_type': 'client_credentials'
    }),
    {
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_CLIENT_SECERT
        }
    }
);

const postCreatePaypalPayment = async (req, res, next) => {
    try {
        const {token} = await accessToken();

        let orderDataJson = {
            'intent': 'sale',
            'purchase_units': [
                {
                    'amount': {
                        'currency_code': 'USD',
                        'value': '100',
                    }
                }
            ]
        }

        const placeOrder = axios.post(
            `${paypalBaseLink}/v2/checkout/orders`,
            orderDataJson,
            {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        return res.send(placeOrder)

    } catch (e) {
        await errorRaiser(e, next);
    }
}

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
    const coursesArr = await findCartCourses(req.user.cart);
    let filteredCourses = null,
        couponData;

    if (typeof req.user.applied_coupon === "string") {
        const findingCouponData = await Discounts.findByPk(req.user.applied_coupon);
        if (findingCouponData) couponData = findingCouponData;
        filteredCourses = coursesArr.map((course) => {
            let price = course.price;

            if (couponData) {
                price = price * (1 - findingCouponData.discount_percentage / 100);
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
        req.session.userOrder = order;
        res.json({id: order.result.id});
    } catch (e) {
        res.status(500).json({error: e});
        // errorRaiser(e, next);
    }
};

export const postSuccess = async (req, res, next) => {
    try {
        const rounds = req.user.cart.map(({roundId}) => roundId);
        const courses = req.user.cart.map(({courseId}) => courseId);

        Payment.create({
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
            });
    } catch (e) {
        await errorRaiser(e, next);
    }
};



export default {
    getAllDataRequiredForPayment,
    postSuccessPayment,
    postCreatePaypalPayment
}
