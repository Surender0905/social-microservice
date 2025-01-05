const { catchAsync, AppError } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const User = require("../models/User");
const {
    validate,
    registerSchema,
    loginSchema,
} = require("../middlewares/validation");
const generateToken = require("../utils/generateToken");
const RefreshToken = require("../models/RefreshToken");

const registerUser = catchAsync(async (req, res) => {
    logger.info("register user controller called");

    //validate user input
    const validatedData = validate(registerSchema, req.body);
    console.log(validatedData);

    //check if user already exists
    const existingUser = await User.findOne({
        $or: [
            { email: validatedData.email.toLowerCase() },
            { username: validatedData.username },
        ],
    });
    if (existingUser) {
        logger.warn("User already exists");
        throw new AppError("User already exists", 400);
    }

    const user = await User.create(validatedData);

    if (!user) {
        logger.warn("User registration failed");
        throw new AppError("User registration failed", 400);
    }

    logger.info("User registered successfully", user._id);

    await generateToken(res, user, "User registered successfully");
});

//login
const login = catchAsync(async (req, res) => {
    logger.info("login user controller called");

    const validatedData = validate(loginSchema, req.body);

    const user = await User.findOne({
        $or: [
            { email: validatedData.email.toLowerCase() },
            { username: validatedData.username },
        ],
    });

    if (!user) {
        logger.warn("User not found");
        throw new AppError("User not found", 400);
    }

    if (!user.comparePassword(validatedData.password)) {
        logger.warn("Invalid password");
        throw new AppError("Invalid password", 400);
    }

    await generateToken(res, user, "User logged in successfully");
});

//logout
const logout = catchAsync(async (req, res) => {
    logger.info("logout user controller called");

    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        logger.warn("Refresh token not found");
        throw new AppError("Refresh token not found", 400);
    }

    //delete refresh token
    await RefreshToken.findOneAndDelete({
        token: refreshToken,
    });

    res.cookie("refreshToken", "", {
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(0),
    });

    res.status(200).json({
        status: "success",
        message: "User logged out successfully",
    });
});

//forgot password
const forgotPassword = catchAsync(async (req, res) => {});

//reset password
const resetPassword = catchAsync(async (req, res) => {});

//refresh token
const refreshToken = catchAsync(async (req, res) => {
    logger.info("refresh token controller called");

    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        logger.warn("Refresh token not found");
        throw new AppError("Refresh token not found", 400);
    }

    const refreshTokenDoc = await RefreshToken.findOne({
        token: refreshToken,
    });

    if (!refreshTokenDoc) {
        logger.warn("Refresh token not found");
        throw new AppError("Refresh token not found", 400);
    }

    if (refreshTokenDoc.expiresAt < Date.now()) {
        logger.warn("Refresh token expired");
        throw new AppError("Refresh token expired", 400);
    }

    const user = await User.findById(refreshTokenDoc.userId);
    if (!user) {
        logger.warn("User not found");
        throw new AppError("User not found", 400);
    }
    //delete refresh token
    await RefreshToken.findOneAndDelete({
        token: refreshToken,
    });

    ///delete old refresh token from db and create new one

    await generateToken(res, user, "Refresh token refreshed successfully");
});

module.exports = {
    registerUser,

    login,

    logout,

    forgotPassword,

    resetPassword,

    refreshToken,
};
