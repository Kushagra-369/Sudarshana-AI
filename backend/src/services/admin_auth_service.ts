import User from "../models/user_model";

import {
  createTOTPSecret,
  createTOTPQRCode,
  verifyTOTP,
} from "../utils/totp";

export const setupAdminTOTP = async (
  userId: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Admin account not found");
  }

  if (user.role !== "ADMIN") {
    throw new Error("Admin access denied");
  }

  if (user.totpEnabled) {
    throw new Error(
      "TOTP is already configured for this admin"
    );
  }

  let secret = user.totpSecret;

  if (!secret) {
    secret = createTOTPSecret();

    user.totpSecret = secret;
    user.totpEnabled = false;

    await user.save();
  }

  const qrCode = await createTOTPQRCode(
    user.email,
    secret
  );

  return {
    email: user.email,
    qrCode,
  };
};


export const confirmAdminTOTP = async (
  userId: string,
  otp: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    return false;
  }

  if (
    user.role !== "ADMIN" ||
    !user.totpSecret
  ) {
    return false;
  }

  const valid = await verifyTOTP(
    user.totpSecret,
    otp
  );

  if (!valid) {
    return false;
  }

  user.totpEnabled = true;

  await user.save();

  return true;
};