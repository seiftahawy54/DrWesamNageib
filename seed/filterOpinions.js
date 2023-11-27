import {Opinions, Users} from "../models/index.js";
import {Op, Sequelize} from "sequelize";

const allOpinions = await Opinions.findAll({});
const founndUsers = [];
for (let op of allOpinions) {
    let user = await Users.findOne({
        where: {
            [Op.or]: {
                email: op.sender_email,
                name: op.sender_name,
            }
        },
    });

    if (user) {
        founndUsers.push(user)
    }
}

console.log(founndUsers.length)
