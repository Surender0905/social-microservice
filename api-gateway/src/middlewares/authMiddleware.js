const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({ status: "error", message: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res
                .status(403)
                .json({ status: "error", message: "Forbidden" });
        }
        req.user = user;
        next();
    });
};

module.exports = validateToken;
