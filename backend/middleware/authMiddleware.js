const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        let token = req.header("Authorization");

        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized, no token provided" });
        }

        token = token.split(" ")[1];  // ✅ Extract token after "Bearer"

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { userId: decoded.userId };  // ✅ Store user ID in req.user
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(401).json({ message: "Unauthorized, invalid token" });
    }
};

module.exports = protect;