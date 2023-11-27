import {beforeAll, describe, expect, it} from "vitest";
import userCycle from "../../cycles/userCycle.js";
import request from "supertest";
import app from "../../../app.js";
import {Discounts} from "../../../models/index.js";
import DiscountCycle from "../../cycles/discountCycle.js";
import {Op} from "sequelize";

describe('/dashboard/discounts', () => {
    let token = '';
    let userData = '';
    let discount = '';

    beforeAll(async () => {
        const user = await userCycle();
        discount = await DiscountCycle();
        token = user.token;
        userData = user.user;
    })

    describe('/GET discounts', () => {
        it('update data', async () => {
            const res = await request(app)
                .get(`/api/dashboard/discounts/`)
                .set('Authorization', `Bearer ${token}`)

            expect(res.body.discounts.length).toBeGreaterThanOrEqual(0);
            expect(Object.keys(res.body.pagination).length).toBeGreaterThan(0);
        });
    })

    describe('/POST addNewDiscount', () => {
        it('return error if coupon is found', async () => {
            const res = await request(app)
                .post(`/api/dashboard/discounts/`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    discountPercentage: 10,
                    discountCode: discount.discountCode,
                    status: true
                })

            expect(res.status).toBe(400);
        })

        it('should add coupon successfully', async () => {
            const res = await request(app)
                .post(`/api/dashboard/discounts/`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    discountPercentage: 10,
                    discountCode: 'testing coupon',
                    status: true
                })

            expect(res.status).toBe(201);
        })
    })

    describe("/DELETE removeDiscount", () => {
        it('should remove coupon successfully', async () => {
            const res = await request(app)
                .delete(`/api/dashboard/discounts/${discount.id}`)
                .set('Authorization', `Bearer ${token}`)

            const discountSearch = await Discounts.findOne({
                where: {
                    discountCode: {
                        [Op.iLike]: `%${discount.discountCode}%`
                    },
                    isDeleted: true
                },
            })

            expect(discountSearch.length).toEqual(0);
        });

        it('return error if coupon does not exist', async () => {
            const res = await request(app)
                .delete(`/api/dashboard/discounts/${discount.id}`)
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toEqual(404);
        });
    })
})
