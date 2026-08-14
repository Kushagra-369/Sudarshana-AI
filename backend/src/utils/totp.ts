import {
  generateSecret,
  generateURI,
  verify,
} from "otplib";

import QRCode from "qrcode";

const APP_NAME = "Sudarshana-AI";

export const createTOTPSecret = () => {
  return generateSecret();
};

export const createTOTPQRCode = async (
  email: string,
  secret: string
) => {
  const uri = generateURI({
    issuer: APP_NAME,
    label: email,
    secret,
  });

  return await QRCode.toDataURL(uri);
};

export const verifyTOTP = async (
  secret: string,
  token: string
) => {
  try {
    const result = await verify({
      secret,
      token,
    });

    return result.valid;
  } catch (error) {
    console.error(
      "TOTP verification error:",
      error
    );

    return false;
  }
};