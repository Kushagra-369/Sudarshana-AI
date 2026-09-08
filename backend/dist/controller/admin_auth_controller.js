"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminTOTP = exports.adminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user_model"));
const totp_1 = require("../utils/totp");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
|--------------------------------------------------------------------------
| This is NOT the final admin authentication.
| It only verifies that the account is an authorized ADMIN
| and creates a short-lived temporary verification token.
|--------------------------------------------------------------------------
*/
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== "string" ||
            typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        const user = await user_model_1.default.findOne({
            email: email.toLowerCase().trim(),
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials",
            });
        }
        // Actual DB role check
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access denied",
            });
        }
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Admin account is disabled",
            });
        }
        // IMPORTANT:
        // Use the SAME password hashing method
        // that your normal loginUser uses.
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password || "");
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials",
            });
        }
        if (!user.totpEnabled ||
            !user.totpSecret) {
            return res.status(403).json({
                success: false,
                message: "Admin two-factor authentication is not configured",
            });
        }
        const verificationToken = jsonwebtoken_1.default.sign({
            userId: user._id.toString(),
            role: "ADMIN",
            purpose: "ADMIN_2FA",
        }, JWT_SECRET, {
            expiresIn: "5m",
        });
        return res.status(200).json({
            success: true,
            requiresTwoFactor: true,
            verificationToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.adminLogin = adminLogin;
const verifyAdminTOTP = async (req, res) => {
    try {
        const { verificationToken, otp, } = req.body;
        if (typeof verificationToken !== "string" ||
            typeof otp !== "string") {
            return res.status(400).json({
                success: false,
                message: "Verification token and OTP are required",
            });
        }
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "OTP must contain exactly 6 digits",
            });
        }
        /*
         * Verify temporary admin token.
         */
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(verificationToken, JWT_SECRET);
        }
        catch {
            return res.status(401).json({
                success: false,
                message: "Admin verification session expired",
            });
        }
        /*
         * Make sure this token was specifically
         * issued for admin 2FA.
         */
        if (decoded.role !== "ADMIN" ||
            decoded.purpose !== "ADMIN_2FA") {
            return res.status(403).json({
                success: false,
                message: "Invalid admin verification session",
            });
        }
        const user = await user_model_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found",
            });
        }
        if (user.role !== "ADMIN" ||
            !user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Admin access denied",
            });
        }
        if (!user.totpEnabled ||
            !user.totpSecret) {
            return res.status(403).json({
                success: false,
                message: "Admin two-factor authentication is not configured",
            });
        }
        /*
         * REAL TOTP VERIFICATION
         */
        const isValid = await (0, totp_1.verifyTOTP)(user.totpSecret, otp);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication code",
            });
        }
        /*
         * TOTP successful.
         *
         * Now issue the REAL privileged admin token.
         */
        const adminToken = jsonwebtoken_1.default.sign({
            userId: user._id.toString(),
            role: "ADMIN",
        }, JWT_SECRET, {
            expiresIn: "30m",
        });
        return res.status(200).json({
            success: true,
            message: "Administrator authentication successful",
            token: adminToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        console.error("Admin TOTP verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.verifyAdminTOTP = verifyAdminTOTP;
//# sourceMappingURL=admin_auth_controller.js.map