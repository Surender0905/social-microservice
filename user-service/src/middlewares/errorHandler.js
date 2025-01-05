const logger = require("../utils/logger");

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

//error handler for async functions
const catchAsync = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
};

//error handler

const errorHandler = (err, req, res, next) => {
    logger.error(err.message);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        // Development error response
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // Production error response
        if (err.isOperational) {
            // Operational, trusted error: send message to client
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            // Programming or other unknown error: don't leak error details
            console.error("ERROR 💥", err);
            res.status(500).json({
                status: "error",
                message: "Something went wrong!",
            });
        }
    }
};

module.exports = {
    AppError,
    errorHandler,
    catchAsync,
};
