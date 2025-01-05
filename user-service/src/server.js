require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const logger = require("./utils/logger");
const cors = require("cors");
const { errorHandler } = require("./middlewares/errorHandler");
const helmet = require("helmet");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { RedisStore } = require("rate-limit-redis");

//import all routes
const userRoutes = require("./routes/user.route");

//redis connection
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

// It is recommended to process Redis errors and setup some reconnection strategy
redisClient.on("error", (err) => {
    logger.error(err);
    console.log("Redis connection FAILED ", err);
    process.exit(1);
});

//initialize express app
const app = express();

///middlewares
app.use(cors());
app.use(helmet());

app.use(express.json({ limit: "16kb" }));

app.use((req, res, next) => {
    logger.info(`Request: ${req.method}   Request URL: ${req.url}`);
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
    next();
});

//ddos protection middleware
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient, // default
    keyPrefix: "rateLimiter", // optional
    points: 5, // 5 requests per minute
    duration: 1, // per second

    // Custom
    blockDuration: 0, // Do not block if consumed more than points
});

//ddos protection
app.use((req, res, next) => {
    rateLimiter
        .consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            logger.warn("Too many requests, please try again later");
            res.status(429).json({
                status: "error",
                message: "Too many requests, please try again later",
            });
        });
});

//ip based rate limiter for sensitive routes
const rateLimiterIp = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    skip: function (req, res) {
        // rate limit only for api routes
        return req.path.startsWith("/api");
    },
    handler: function (req, res, next) {
        logger.warn("Too many requests, please try again later");
        res.status(429).json({
            status: "error",
            message: "Too many requests, please try again later",
        });
    },

    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

//ip based rate limiter
app.use(rateLimiterIp);

//routes------------------------
app.use("/api/auth", userRoutes);

//error handler
app.use(errorHandler);

//server start
const port = process.env.PORT || 5000;
connectDB()
    .then(() => {
        app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
        });
    })
    .catch((err) => {
        logger.error(err);
        console.log("MONGODB connection FAILED ", err);
        process.exit(1);
    });
