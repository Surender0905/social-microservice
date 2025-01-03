const winston = require("winston");
const winstonDaily = require("winston-daily-rotate-file");

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp(), // Add timestamp to logs
    winston.format.errors({ stack: true }), // Include stack trace for errors
    winston.format.splat(), // Include stack trace for errors
    winston.format.json(), // Format logs as JSON
);

// Create a transport for logging to the console (useful for development)
const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(), // Colorize logs for better readability
        logFormat,
    ),
});

// create file for error logs
const errorTransport = new winstonDaily({
    level: "error",
    datePattern: "YYYY-MM-DD",
    dirname: "./logs",
    filename: "error-%DATE%.log",
    maxFiles: 30,
    zippedArchive: true,
    format: logFormat,
    colorize: false,
});

// Create a transport for logging to a file (useful for production)
const fileTransport = new winstonDaily({
    level: "info",
    datePattern: "YYYY-MM-DD",
    dirname: "./logs",
    filename: "combined-%DATE%.log",
    maxFiles: 30,
    zippedArchive: true,
    format: logFormat,
    colorize: false,
});

const logger = winston.createLogger({
    level: "info",
    format: logFormat,
    defaultMeta: { service: "user-service" },
    transports: [consoleTransport, fileTransport, errorTransport],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    );
}

// Create a custom stream for logging
//it used for logging to files like combined.log and error.log
logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    },
};

logger.info("Logger initialized");

module.exports = logger;
