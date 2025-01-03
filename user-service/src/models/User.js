const mongoose = require("mongoose");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    },
);

//indexing email and username
userSchema.index({ email: 1, username: 1 }, { unique: true });

//hashing password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await argon2.hash(this.password);
    next();
});

///create virtual field  for fullname
// userSchema.virtual("fullName").get(function () {
//     return `${this.firstName} ${this.lastName}`;
// });

///add method for comparing password
userSchema.methods.comparePassword = async function (password) {
    //handle error
    try {
        return await argon2.verify(this.password, password);
    } catch (error) {
        console.log("error-form comparePassword", error);
        return false;
    }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
