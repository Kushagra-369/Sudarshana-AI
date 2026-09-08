"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTOTP = exports.createTOTPQRCode = exports.createTOTPSecret = void 0;
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const APP_NAME = "Sudarshana-AI";
const createTOTPSecret = () => {
    return (0, otplib_1.generateSecret)();
};
exports.createTOTPSecret = createTOTPSecret;
const createTOTPQRCode = async (email, secret) => {
    const uri = (0, otplib_1.generateURI)({
        issuer: APP_NAME,
        label: email,
        secret,
    });
    return await qrcode_1.default.toDataURL(uri);
};
exports.createTOTPQRCode = createTOTPQRCode;
const verifyTOTP = async (secret, token) => {
    try {
        const result = await (0, otplib_1.verify)({
            secret,
            token,
        });
        return result.valid;
    }
    catch (error) {
        console.error("TOTP verification error:", error);
        return false;
    }
};
exports.verifyTOTP = verifyTOTP;
//# sourceMappingURL=totp.js.map