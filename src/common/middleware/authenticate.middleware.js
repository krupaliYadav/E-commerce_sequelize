const jwt = require("jsonwebtoken")
const User = require("../../models/user")
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")

exports.isAuthenticated = (requiredRole) => async (req, res, next) => {
    try {
        requiredRole = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const headers = req.headers.authorization;
        if (!headers) {
            return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ status: HTTP_STATUS_CODE.UNAUTHORIZED, success: false, message: "Please login to access this resource" });
        }

        const token = headers.split(" ")[1];
        if (!token) {
            return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ status: HTTP_STATUS_CODE.UNAUTHORIZED, success: false, message: "Please Enter a valid Token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SEC);

        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ status: HTTP_STATUS_CODE.UNAUTHORIZED, success: false, message: "Token is expired or Invalid." });
        }
        if (user.isActive === '0') {
            return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ status: HTTP_STATUS_CODE.UNAUTHORIZED, success: false, message: "Access denied" });
        }

        if (requiredRole.includes(user.roleId)) {
            switch (user.roleId) {
                case 1:
                    req.admin = decoded.id;
                    break;
                case 2:
                    req.manager = decoded.id;
                    break;
                case 3:
                    req.merchant = decoded.id;
                    break;
                case 4:
                    req.user = decoded.id;
                    break;
                default:
                    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ status: HTTP_STATUS_CODE.UNAUTHORIZED, success: false, message: "Access denied..!" });
            }
            next();
        } else {
            return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ status: HTTP_STATUS_CODE.UNAUTHORIZED, success: false, message: "Access denied." });
        }
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ status: HTTP_STATUS_CODE.INTERNAL_SERVER, success: false, message: error.message });
    }
};

exports.isAuthenticatedAdmin = exports.isAuthenticated(1);
exports.isAuthenticatedManager = exports.isAuthenticated(2);
exports.isAuthenticatedMerchant = exports.isAuthenticated(3);
exports.isAuthenticatedUser = exports.isAuthenticated(4);
exports.isAuthenticatedAdminOrManager = exports.isAuthenticated([1, 2]);
exports.isAuthenticatedAdminOrMerchant = exports.isAuthenticated([1, 3]);
exports.isAuthenticatedUserOrMerchant = exports.isAuthenticated([3, 4]);
