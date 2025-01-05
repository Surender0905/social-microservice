const errorHandler = (err, req, res, next) => {
    console.log(err);
    res.status(err.statusCode || 500).json({
        status: "error",
        message: err.message || "Something went wrong ! api gateway",
    });
};

module.exports = errorHandler;
