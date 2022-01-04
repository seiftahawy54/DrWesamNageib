const { Client, Pool } = require("pg");

const pool = new Pool({
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

module.exports = pool;
