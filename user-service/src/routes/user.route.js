const express = require("express");
const {
    registerUser,
    login,
    logout,
    refreshToken,
    resetPassword,
} = require("../controllers/user.controller");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/reset-password", resetPassword);

module.exports = router;
