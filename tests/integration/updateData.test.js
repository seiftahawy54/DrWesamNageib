import request from 'supertest'
import app from "../../app.js";
import userCycle from "../cycles/userCycle.js";
import {describe, test, it, beforeAll, expect} from "vitest";

describe('/dashboard/users', () => {
    let token = '';
    let userData = '';

    beforeAll(async () => {
        const user = await userCycle();
        token = user.token;
        userData = user.user;
    })

    it('update data', async () => {
        const res = await request(app)
            .put(`/api/dashboard/users/${userData.user_id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Seif Hesham",
                email: "seif@tahawy.com",
                whatsappNumber: "01000000000",
                type: 1,
                specialization: "Tester",
            })

        expect(res.text).toEqual('User updated successfully')
    });

    it('return error if passwords are not match', async () => {
        const res = await request(app)
            .put(`/api/dashboard/users/updatePassword/${userData.user_id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                password: '123456789',
                confirmPassword: '1234567',
            })

        const errorLength = Object.keys(res.body).length
        expect(errorLength).toBe(1);
    });

    it('return message if password is correctly', async () => {
        const res = await request(app)
            .put(`/api/dashboard/users/updatePassword/${userData.user_id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                password: '123456789',
                confirmPassword: '123456789',
            })

        expect(res.text).toBe('Password updated successfully');
    });
})
