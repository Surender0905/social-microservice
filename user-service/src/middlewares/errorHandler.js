const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    logger.error(err.message);
    res.status(err.statusCode || 500).json({
        error: err.message || "Internal server error",
    });
};

module.exports = errorHandler;
