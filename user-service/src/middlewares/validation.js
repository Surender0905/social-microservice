const joi = require("joi");

const registerSchema = joi.object({
    username: joi.string().alphanum().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    role: joi.string().valid("user", "admin").default("user"),
    status: joi.string().valid("active", "inactive").default("active"),
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
});

//update profile with optional fields with joi
const updateProfileSchema = joi.object({
    username: joi.string().alphanum().min(3).max(30),
    email: joi.string().email(),
    role: joi.string().valid("user", "admin"),
    status: joi.string().valid("active", "inactive"),
});

const updatePasswordSchema = joi.object({
    password: joi.string().min(6).required(),
});

const validate = (schema, data) => {
    const { error } = schema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return data;
};
module.exports = {
    registerSchema,
    validate,
    loginSchema,
};
