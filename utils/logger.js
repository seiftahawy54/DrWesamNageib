import winston from "winston";
import {PostgresTransport} from "@innova2/winston-pg";

let dbConnectionOptions = {};
let logger = {}

if (process.env.NODE_ENV === 'production') {
    dbConnectionOptions = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    };
} else {
    dbConnectionOptions = {
        connectionString: process.env.DATABASE_URL,
    }
}

try {
    logger = winston.createLogger({
        level: "info",
        format: winston.format.json(),
        transports: [
            //
            // - Write all logs with importance level of `error` or less to `error.log`
            // - Write all logs with importance level of `info` or less to `combined.log`
            //
            new winston.transports.Console(),
            new PostgresTransport(dbConnectionOptions),
            new winston.transports.File({
                filename: 'logs/combined.log',
            }),
        ],
        exceptionHandlers: [
            new winston.transports.File({filename: 'logs/exception.log'}),
        ],
        rejectionHandlers: [
            new winston.transports.File({filename: 'logs/rejections.log'}),
        ],
    });

    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );

} catch (e) {
    console.error(e);
    process.on("unhandledRejection", (reason, promise) => {
        console.log("Unhandled Rejection at: Promise", promise, "reason:", reason);
        throw reason;
    });
}
export default logger;
