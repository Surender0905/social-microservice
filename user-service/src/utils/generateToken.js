const { catchAsync } = require("../middlewares/errorHandler");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const generateToken = catchAsync(async (res, user, message) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    const refreshToken = crypto.randomBytes(64).toString("hex");
    //expiresAt for 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
        token: refreshToken,
        userId: user._id,
        expiresAt: expiresAt,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
        status: "success",
        message: message,
        token: token,
    });
});

module.exports = generateToken;
