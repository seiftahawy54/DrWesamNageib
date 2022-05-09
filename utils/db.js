import { Sequelize } from "sequelize";

import dotenv from "dotenv";

dotenv.config();

let sequelize = {};

if (process.env.NODE_ENV === "production") {
  sequelize = new Sequelize(
    process.env.DATABASE_URL,
    // "postgres://dywqkffdboiesh:937a123cb68d20b821a562d1696904fb22070c92294582fd57cc80029b0698d0@ec2-34-236-87-247.compute-1.amazonaws.com:5432/dd25vo8oaccked",
    {
      dialect: "postgres",
      protocol: "postgres",
      define: {
        // timestamps: false,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  );
} else {
  sequelize = new Sequelize(
    process.env.DATABASE_URL,
    // "postgres://dywqkffdboiesh:937a123cb68d20b821a562d1696904fb22070c92294582fd57cc80029b0698d0@ec2-34-236-87-247.compute-1.amazonaws.com:5432/dd25vo8oaccked",
    {
      dialect: "postgres",
      protocol: "postgres",
      define: {
        // timestamps: false,
      },
      dialectOptions: {},
    }
  );
}

export { sequelize };
