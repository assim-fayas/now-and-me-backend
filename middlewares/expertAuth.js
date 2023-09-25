// expertAuthMiddleware.js
const jwt = require('jsonwebtoken');

const expertAuthMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                auth: false,
                status: "failed",
                message: "No token provided",
            });
        }

        jwt.verify(token, process.env._JWT_EXPERT_SECERETKEY, (err, decoded) => {
            if (err) {
                console.log("Expert Authentication failed");
                return res.status(401).json({
                    auth: false,
                    status: "failed",
                    message: "Failed to authenticate",
                });
            } else {
                req.headers.expertId = decoded._id; // Expert ID is stored in '_id'
                next();
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Internal server error",
        });
    }
}

module.exports = expertAuthMiddleware;
