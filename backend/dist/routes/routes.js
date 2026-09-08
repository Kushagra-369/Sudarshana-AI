"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const user_model_1 = __importDefault(require("../models/user_model"));
const user_controller_1 = require("../controller/user_controller");
const auth_middleware_1 = require("../middleware/auth_middleware");
const admin_auth_controller_1 = require("../controller/admin_auth_controller");
const admin_auth_service_1 = require("../services/admin_auth_service");
const admin_middleware_1 = require("../middleware/admin_middleware");
const admin_controller_1 = require("../controller/admin_controller");
const base_controller_1 = require("../controller/base_controller");
const ai_controller_1 = require("../controller/ai_controller");
// user 
router.post("/register", user_controller_1.registerUser);
router.post("/login", user_controller_1.loginUser);
router.post("/google", user_controller_1.googleLogin);
router.get("/me", auth_middleware_1.authenticateToken, user_controller_1.getCurrentUser);
router.post("/verify-email-otp", user_controller_1.verifyEmailOTP);
router.post("/resend-email-otp", user_controller_1.resendEmailOTP);
router.get("/get_all_users", user_controller_1.getAllUsers);
router.post("/update_location", auth_middleware_1.authenticateToken, user_controller_1.updateMyLocation);
//admin
router.get("/admin/head-requests", auth_middleware_1.authenticateToken, admin_middleware_1.requireAdmin, admin_controller_1.getBaseHeadRequests);
router.post("/admin/head-requests/:id/approve", auth_middleware_1.authenticateToken, admin_middleware_1.requireAdmin, admin_controller_1.approveBaseHead);
router.post("/admin/head-requests/:id/reject", auth_middleware_1.authenticateToken, admin_middleware_1.requireAdmin, admin_controller_1.rejectBaseHead);
router.post("/admin/login", admin_auth_controller_1.adminLogin);
router.post("/admin/verify-totp", admin_auth_controller_1.verifyAdminTOTP);
//basehead
// ============================================================
// BASE HEAD / BASE
// ============================================================
router.post("/base/setup", auth_middleware_1.authenticateToken, base_controller_1.createBaseProfile);
router.get("/base/me", auth_middleware_1.authenticateToken, base_controller_1.getMyBase);
router.put("/base/me", auth_middleware_1.authenticateToken, base_controller_1.updateMyBase);
router.post("/admin/setup-totp", async (req, res) => {
    try {
        const { email, setupKey, } = req.body;
        const adminSetupKey = process.env.ADMIN_SETUP_KEY;
        if (!adminSetupKey) {
            return res.status(500).json({
                success: false,
                message: "Admin setup key is not configured",
            });
        }
        if (typeof email !== "string" ||
            typeof setupKey !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email and setup key are required",
            });
        }
        if (setupKey !== adminSetupKey) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin setup authorization",
            });
        }
        const user = await user_model_1.default.findOne({
            email: email.toLowerCase().trim(),
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found",
            });
        }
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "This account is not an administrator",
            });
        }
        const result = await (0, admin_auth_service_1.setupAdminTOTP)(user._id.toString());
        return res.status(200).json({
            success: true,
            message: "TOTP setup generated successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Admin TOTP setup error:", error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "TOTP setup failed",
        });
    }
});
router.post("/admin/confirm-totp", async (req, res) => {
    try {
        const { email, otp, setupKey, } = req.body;
        const adminSetupKey = process.env.ADMIN_SETUP_KEY;
        if (!adminSetupKey) {
            return res.status(500).json({
                success: false,
                message: "Admin setup key is not configured",
            });
        }
        if (typeof email !== "string" ||
            typeof otp !== "string" ||
            typeof setupKey !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and setup key are required",
            });
        }
        if (setupKey !== adminSetupKey) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin setup authorization",
            });
        }
        const user = await user_model_1.default.findOne({
            email: email.toLowerCase().trim(),
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found",
            });
        }
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access denied",
            });
        }
        const valid = await (0, admin_auth_service_1.confirmAdminTOTP)(user._id.toString(), otp);
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Invalid authenticator code",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Admin authenticator activated successfully",
        });
    }
    catch (error) {
        console.error("Admin TOTP confirmation error:", error);
        return res.status(500).json({
            success: false,
            message: "TOTP confirmation failed",
        });
    }
});
router.post("/situation", auth_middleware_1.authenticateToken, ai_controller_1.analyzeSituation);
router.get("/status", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        // Fix: FastAPI port 8000 pe chal raha hai
        const response = await fetch("http://localhost:8000/api/health", {
            method: "GET",
            signal: AbortSignal.timeout(2000),
        });
        if (response.ok) {
            res.json({ status: "connected", message: "AI service is operational" });
        }
        else {
            res.json({ status: "error", message: "AI service returned error" });
        }
    }
    catch (error) {
        res.json({ status: "offline", message: "AI service is not available" });
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map