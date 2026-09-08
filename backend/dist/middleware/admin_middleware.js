"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    try {
        // User must already be authenticated
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        // User must have ADMIN role
        if (req.userRole !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }
        next();
    }
    catch (error) {
        console.error("Admin authorization error:", error);
        return res.status(500).json({
            success: false,
            message: "Authorization error",
        });
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=admin_middleware.js.map