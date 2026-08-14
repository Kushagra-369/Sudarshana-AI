import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user_model";
import { verifyTOTP } from "../utils/totp";
import bcrypt from "bcryptjs";
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

export const adminLogin = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
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
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password || ""
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    if (
      !user.totpEnabled ||
      !user.totpSecret
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin two-factor authentication is not configured",
      });
    }

    const verificationToken = jwt.sign(
      {
        userId: user._id.toString(),
        role: "ADMIN",
        purpose: "ADMIN_2FA",
      },
      JWT_SECRET,
      {
        expiresIn: "5m",
      }
    );

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
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyAdminTOTP = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      verificationToken,
      otp,
    } = req.body;

    if (
      typeof verificationToken !== "string" ||
      typeof otp !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Verification token and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must contain exactly 6 digits",
      });
    }

    /*
     * Verify temporary admin token.
     */

    let decoded: {
      userId: string;
      role: string;
      purpose: string;
    };

    try {
      decoded = jwt.verify(
        verificationToken,
        JWT_SECRET
      ) as typeof decoded;
    } catch {
      return res.status(401).json({
        success: false,
        message:
          "Admin verification session expired",
      });
    }

    /*
     * Make sure this token was specifically
     * issued for admin 2FA.
     */

    if (
      decoded.role !== "ADMIN" ||
      decoded.purpose !== "ADMIN_2FA"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid admin verification session",
      });
    }

    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (
      user.role !== "ADMIN" ||
      !user.isActive
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access denied",
      });
    }

    if (
      !user.totpEnabled ||
      !user.totpSecret
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin two-factor authentication is not configured",
      });
    }

    /*
     * REAL TOTP VERIFICATION
     */

    const isValid = await verifyTOTP(
      user.totpSecret,
      otp
    );

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

    const adminToken = jwt.sign(
      {
        userId: user._id.toString(),
        role: "ADMIN",
      },
      JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );

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
    
  } catch (error) {
    console.error(
      "Admin TOTP verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

