import {Users} from "../../models/index.js";
import bcrypt from "bcrypt";
import request from "supertest";
import app from "../../app.js";

const userCycle = async () => {
    const userData = {
        name: "Seif Hesham Salem",
        email: "seif@tahawy.com",
        whatsapp_no: "01000000000",
        user_img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        specialization: "Tester",
        type: 9,
        password: bcrypt.hashSync("123456789", 12),
    }

    return Users.create(userData)
        .then(async (newUser) => {
            const result = await request(app).post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: "123456789",
                    googleToken: "123456789"
                });

            return {
                token: result.body.token,
                user: newUser.dataValues
            }
        })
}
export default userCycle;
