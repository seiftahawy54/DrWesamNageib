import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.HEROKU_PGSQL_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then((result) => {
    // console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });

export default pool;
