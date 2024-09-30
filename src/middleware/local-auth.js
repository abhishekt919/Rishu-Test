module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (token === process.env.LOCAL_AUTH) {
            next();
        } else {
            res.status(203).json({
                message: "You are not authorized.",
                messageId: 203
            });
        }
    } catch (error) {
        res.status(401).json({
            message: "Login session expired. Please login again.",
            messageId: 401
        });
    }
};
