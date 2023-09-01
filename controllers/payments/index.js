import axios from "axios";
import {errorRaiser} from "../../utils/error_raiser.js";
import {Courses, Rounds, Users} from "../../models/index.js";
import {calcTotalPrice, extractArrOfPrices, findCartCourses} from "../../utils/cart_helpers.js";
import {Op, Sequelize} from "sequelize";

/*

{
    "auth_token": "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TnpJNE5UazVMQ0p3YUdGemFDSTZJbU0yTm1RNVpURmtOakpqTVRNNE9EZ3dNREJpTkdVNU1HVmtZV1ZtTkRRMVpETXhOakU0TTJWaE5qUXhZVGRsTVRVMk5UUmpOams1TmprM09HUXpNRFFpTENKbGVIQWlPakUyT1RNME9UQXhOamQ5LlpjeFR2OGw5RVA1bVNsaFRpdVFtakZSVENZQm1mamtPTU50UWhqd29XeE5vQkk0Ukh6QnprUFd1ejg0QjJOUXdzVng4MEVHUkx3OGJEOGZBdTAyeG9R",
    "delivery_needed": "false",
    "amount_cents": "100",
    "currency": "EGP",
    "merchant_order_id": 5,
    "items": [
        {
            "name": "ASC1515",
            "amount_cents": "500000",
            "description": "Smart Watch",
            "quantity": "1"
        },
        {
            "name": "ERT6565",
            "amount_cents": "200000",
            "description": "Power Bank",
            "quantity": "1"
        }
    ],
    "shipping_data": {
        "apartment": "803",
        "email": "claudette09@exa.com",
        "floor": "42",
        "first_name": "Clifford",
        "street": "Ethan Land",
        "building": "8028",
        "phone_number": "+86(8)9135210487",
        "postal_code": "01898",
        "extra_description": "8 Ram , 128 Giga",
        "city": "Jaskolskiburgh",
        "country": "CR",
        "last_name": "Nicolas",
        "state": "Utah"
    },
    "shipping_details": {
        "notes": " test",
        "number_of_packages": 1,
        "weight": 1,
        "weight_unit": "Kilogram",
        "length": 1,
        "width": 1,
        "height": 1,
        "contents": "product of some sorts"
    }
}
*/

const getAllDataRequiredForPayment = async (req, res, next) => {
    try {
        const cart = (await Users.findOne({
            where: {
                id: req.user.id
            }
        })).cart

        const coursesArr = await findCartCourses(cart);

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
                "currency": "USD",
                "items": [
                    {
                        "name": "Dr Wesam Nageib Courses",
                        "amount_cents": `${totalPrice * 100}`,
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


        return res.send({
            // auth_token: tokenRequest.data.token,
            // order_id: orderRequestData.id,
            cart,
            tokenGenerated: acceptanceRequest.token,
            paymentLink
        })

    } catch (e) {
        await errorRaiser(e, next);
    }
}


export default {
    getAllDataRequiredForPayment
}
