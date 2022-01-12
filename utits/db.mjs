import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then((result) => {
    return result;
  })
  .catch((err) => {
    console.log(err);
  });

export default pool;
