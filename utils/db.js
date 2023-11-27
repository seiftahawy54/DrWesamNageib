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

let dbLink = '';

if (process.env.NODE_ENV === 'test') {
    dbLink = process.env.DATABASE_URL_TEST;
} else {
    dbLink = process.env.DATABASE_URL;
}

const sequelize = new Sequelize(
    dbLink,
    {
        dialect: "postgres",
        protocol: "postgres",
        logging: process.env.NODE_ENV !== 'test',
        dialectOptions: sslOptions
    }
);

export {sequelize};

