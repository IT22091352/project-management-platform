const AppError = require("../utils/app-error");
const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;
	const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
	const cookieToken = req.cookies?.token || req.cookies?.authToken;
	const token = bearerToken || cookieToken;

	if (!token) {
		return next(new AppError("Authentication required", 401));
	}

	try {
		const decoded = verifyToken(token);
		req.user = {
			id: decoded.id,
			role: decoded.role,
		};

		return next();
	} catch (error) {
		return next(new AppError("Invalid or expired token", 401));
	}
};

module.exports = authMiddleware;
