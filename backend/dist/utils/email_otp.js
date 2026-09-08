"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashEmailOTP = exports.generateEmailOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateEmailOTP = () => {
    return crypto_1.default
        .randomInt(100000, 1000000)
        .toString();
};
exports.generateEmailOTP = generateEmailOTP;
const hashEmailOTP = (otp) => {
    return crypto_1.default
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};
exports.hashEmailOTP = hashEmailOTP;
//# sourceMappingURL=email_otp.js.map