import winston from "winston";
import PostgresTransport from "winston-postgres-transport";

// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.json(),
//   transports: [
//     //
//     // - Write all logs with importance level of `error` or less to `error.log`
//     // - Write all logs with importance level of `info` or less to `combined.log`
//     //
//     new PostgresTransport({
//       postgresUrl: process.env.DATABASE_URL,
//     }),
//   ],
// });
//
// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     })
//   );
// }
//
// process.on("unhandledRejection", (reason, promise) => {
//   // eslint-disable-next-line no-console
//   console.log("Unhandled Rejection at: Promise", promise, "reason:", reason);
//   throw reason;
// });

const logger = () => {
  return {
    info: (msg) => console.log(msg),
    error: (msg) => console.log(msg)
  }
}

export default logger;
