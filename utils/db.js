import { Sequelize } from "sequelize";

import dotenv from "dotenv";

dotenv.config();

let sequelize = {};

if (process.env.NODE_ENV === "production") {
  sequelize = new Sequelize(
    process.env.DATABASE_URL,
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
    {
      dialect: "postgres",
      protocol: "postgres",
      define: {
        // timestamps: false,
      },
      dialectOptions: {
      },
    }
  );
}

export { sequelize };
