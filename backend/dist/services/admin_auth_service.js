"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmAdminTOTP = exports.setupAdminTOTP = void 0;
const user_model_1 = __importDefault(require("../models/user_model"));
const totp_1 = require("../utils/totp");
const setupAdminTOTP = async (userId) => {
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        throw new Error("Admin account not found");
    }
    if (user.role !== "ADMIN") {
        throw new Error("Admin access denied");
    }
    if (user.totpEnabled) {
        throw new Error("TOTP is already configured for this admin");
    }
    let secret = user.totpSecret;
    if (!secret) {
        secret = (0, totp_1.createTOTPSecret)();
        user.totpSecret = secret;
        user.totpEnabled = false;
        await user.save();
    }
    const qrCode = await (0, totp_1.createTOTPQRCode)(user.email, secret);
    return {
        email: user.email,
        qrCode,
    };
};
exports.setupAdminTOTP = setupAdminTOTP;
const confirmAdminTOTP = async (userId, otp) => {
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        return false;
    }
    if (user.role !== "ADMIN" ||
        !user.totpSecret) {
        return false;
    }
    const valid = await (0, totp_1.verifyTOTP)(user.totpSecret, otp);
    if (!valid) {
        return false;
    }
    user.totpEnabled = true;
    await user.save();
    return true;
};
exports.confirmAdminTOTP = confirmAdminTOTP;
//# sourceMappingURL=admin_auth_service.js.map