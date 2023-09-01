import {Sequelize} from "sequelize";

import dotenv from "dotenv";

dotenv.config();


let sslOptions = {};

if (process.env.NODE_ENV === 'production') {
    sslOptions = {
        ssl: {
            // require: true,
            rejectUnauthorized: false,
        },
    }
}
const sequelize = new Sequelize(
    process.env.DATABASE_URL,
    {
        dialect: "postgres",
        protocol: "postgres",
        logging: process.env.NODE_ENV !== 'seed',
        dialectOptions: sslOptions
    }
);

export {sequelize};

