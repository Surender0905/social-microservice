require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");
const proxy = require("express-http-proxy");
const helmet = require("helmet");
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

//ip based rate limiter
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs

        message: "Too many requests, please try again later",
    }),
);

//proxy routes
const proxyOptions = {
    proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },

    // optional
    // proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
    //     return proxyReqOpts;
    // },

    proxyErrorHandler: (err, res, next) => {
        res.status(500).json({
            message: `Internal server error`,
            error: err.message,
        });
    },
};

//routes------------------------
app.use(
    "/v1/auth",
    proxy(process.env.USER_SERVICE_URL, {
        ...proxyOptions,
        proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
            // proxyReqOpts.headers.authorization = srcReq.headers.authorization;
            // proxyReqOpts.headers["Content-Type"] =
            //     srcReq.headers["Content-Type"];
            proxyReqOpts.headers["Content-Type"] = "application/json";
            return proxyReqOpts;
        },

        userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
            // userRes.removeHeader("set-cookie");
            return proxyResData;
        },
    }),
);

//error handler middleware
app.use(errorHandler);

//server start
app.listen(process.env.API_GATEWAY_PORT, () => {
    console.log(`Server running on port ${process.env.API_GATEWAY_PORT}`);
});
