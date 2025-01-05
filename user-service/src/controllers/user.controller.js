const { catchAsync, AppError } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const User = require("../models/User");
const { validate, registerSchema } = require("../middlewares/validation");
const generateToken = require("../utils/generateToken");

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

module.exports = {
    registerUser,
};
