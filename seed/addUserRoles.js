import {Users} from "../models/index.js";

const allUsers = await Users.findAll();

for (let user of allUsers) {
    user.type = 1;
    await user.save();
}
