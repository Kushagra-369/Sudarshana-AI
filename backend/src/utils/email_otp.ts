import crypto from "crypto";

export const generateEmailOTP = () => {

    return crypto
        .randomInt(100000, 1000000)
        .toString();
};

export const hashEmailOTP = (
    otp: string
) => {

    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};