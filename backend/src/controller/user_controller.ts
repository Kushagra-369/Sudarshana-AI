import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, {
  UserRole,
  AuthProvider, AccountStatus
} from "../models/user_model";
import dotenv from "dotenv";
import { AuthRequest } from "../middleware/auth_middleware";
import EmailOTP from "../models/email_otp_model";
import {
  generateEmailOTP,
  hashEmailOTP,
} from "../utils/email_otp";
import { sendLoginOTP } from "../services/email_service";
dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

/* =========================================================
   HELPER: GENERATE JWT
========================================================= */

const generateToken = (
  userId: string,
  role: UserRole,
  baseId?: string
) => {
  return jwt.sign(
    {
      userId,
      role,
      baseId,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      role,
    }: {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
    } = req.body;

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    /* =====================================================
       VALIDATE ROLE
    ===================================================== */

    const allowedRoles: UserRole[] = [
      "USER",
      "BASE_HEAD",
      "ADMIN",
    ];

    const userRole: UserRole =
      role && allowedRoles.includes(role)
        ? role
        : "USER";

    /* =====================================================
       CHECK EXISTING ACCOUNT
    ===================================================== */

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    /*
     * -----------------------------------------------------
     * EXISTING ACCOUNT
     * -----------------------------------------------------
     */

    if (existingUser) {

      /* ===================================================
         ALREADY VERIFIED
         =================================================== */

      if (existingUser.emailVerified === true) {

        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists. Please sign in.",
          accountExists: true,
          emailVerified: true,
        });
      }

      /* ===================================================
         ACCOUNT EXISTS BUT EMAIL IS NOT VERIFIED

         Allow registration again.
         We update the account and generate a fresh OTP.
         =================================================== */

      console.log(
        "Unverified account found. Restarting registration:",
        normalizedEmail
      );

      /* -----------------------------------------------
         DELETE OLD OTP
      ----------------------------------------------- */

      await EmailOTP.deleteMany({
        userId: existingUser._id,
      });

      /* -----------------------------------------------
         UPDATE ACCOUNT
      ----------------------------------------------- */

      existingUser.name =
        name.trim();

      existingUser.password =
        await bcrypt.hash(
          password,
          12
        );

      existingUser.role =
        userRole;

      existingUser.status =
        userRole === "BASE_HEAD"
          ? "PENDING"
          : "APPROVED";

      existingUser.authProvider =
        "LOCAL";

      existingUser.isActive =
        true;

      existingUser.emailVerified =
        false;

      await existingUser.save();

      /* -----------------------------------------------
         GENERATE NEW OTP
      ----------------------------------------------- */

      const otp =
        generateEmailOTP();

      const otpHash =
        hashEmailOTP(otp);

      const expiresAt =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );

      /* -----------------------------------------------
         SAVE NEW OTP
      ----------------------------------------------- */

      await EmailOTP.create({
        userId:
          existingUser._id,

        email:
          existingUser.email,

        otpHash,

        expiresAt,

        attempts: 0,
      });

      /* -----------------------------------------------
         SEND NEW OTP
      ----------------------------------------------- */

      try {

        await sendLoginOTP(
          existingUser.email,
          otp,
          existingUser.name
        );

      } catch (emailError) {

        console.error(
          "Registration OTP email failed:",
          emailError
        );

        /* Remove newly created OTP */
        await EmailOTP.deleteMany({
          userId:
            existingUser._id,
        });

        return res.status(500).json({
          success: false,
          message:
            "Unable to send verification email. Please try again.",
        });
      }

      /* -----------------------------------------------
         GO TO OTP PAGE
      ----------------------------------------------- */

      return res.status(200).json({
        success: true,

        message:
          "Your email was not verified. A new verification code has been sent.",

        requiresEmailOTP: true,

        email:
          existingUser.email,

        userId:
          existingUser._id.toString(),

        role:
          existingUser.role,

        status:
          existingUser.status,
      });
    }

    /* =====================================================
       NEW ACCOUNT
    ===================================================== */

    /* =====================================================
       ACCOUNT STATUS
    ===================================================== */

    const accountStatus: AccountStatus =
      userRole === "BASE_HEAD"
        ? "PENDING"
        : "APPROVED";

    /* =====================================================
       HASH PASSWORD
    ===================================================== */

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    /* =====================================================
       CREATE USER
    ===================================================== */

    const user =
      await User.create({
        name:
          name.trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        role:
          userRole,

        status:
          accountStatus,

        authProvider:
          "LOCAL",

        isActive:
          true,

        emailVerified:
          false,

        totpEnabled:
          false,

        totpSecret:
          null,
      });

    /* =====================================================
       GENERATE EMAIL OTP
    ===================================================== */

    const otp =
      generateEmailOTP();

    const otpHash =
      hashEmailOTP(otp);

    const expiresAt =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );

    /* =====================================================
       REMOVE ANY OLD OTP
    ===================================================== */

    await EmailOTP.deleteMany({
      userId:
        user._id,
    });

    /* =====================================================
       SAVE OTP
    ===================================================== */

    await EmailOTP.create({
      userId:
        user._id,

      email:
        user.email,

      otpHash,

      expiresAt,

      attempts:
        0,
    });

    /* =====================================================
       SEND OTP EMAIL
    ===================================================== */

    try {

      await sendLoginOTP(
        user.email,
        otp,
        user.name
      );

    } catch (emailError) {

      console.error(
        "Registration OTP email failed:",
        emailError
      );

      /* -----------------------------------------------
         ROLLBACK OTP
      ----------------------------------------------- */

      await EmailOTP.deleteMany({
        userId:
          user._id,
      });

      /* -----------------------------------------------
         ROLLBACK USER
      ----------------------------------------------- */

      await User.findByIdAndDelete(
        user._id
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send verification email. Please try again.",
      });
    }

    /* =====================================================
       OTP REQUIRED
       NO JWT YET
    ===================================================== */

    return res.status(201).json({
      success: true,

      message:
        "Account created. Verification code sent to your email.",

      requiresEmailOTP:
        true,

      email:
        user.email,

      userId:
        user._id.toString(),

      role:
        user.role,

      status:
        user.status,
    });

  } catch (error) {

    console.error(
      "Register User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};
/* =========================================================
   LOGIN USER
========================================================= */

export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      password,
    }: {
      email?: string;
      password?: string;
    } = req.body;

    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    /* -----------------------------------------
       FIND USER
    ----------------------------------------- */

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    /* -----------------------------------------
       ACTIVE CHECK
    ----------------------------------------- */

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled",
      });
    }

    /* -----------------------------------------
       GOOGLE ACCOUNT
    ----------------------------------------- */

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    /* -----------------------------------------
       PASSWORD CHECK
    ----------------------------------------- */

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    /* -----------------------------------------
       SUSPENDED
    ----------------------------------------- */

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been suspended",
      });
    }

    /* -----------------------------------------
       REJECTED BASE HEAD
    ----------------------------------------- */

    if (
      user.role === "BASE_HEAD" &&
      user.status === "REJECTED"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your Base Head request has been rejected",
        status: "REJECTED",
      });
    }

    /* -----------------------------------------
       JWT
       EXISTING ACCOUNT = NO EMAIL OTP
    ----------------------------------------- */

    const token = generateToken(
      user._id.toString(),
      user.role,
      user.baseId?.toString()
    );

    /* -----------------------------------------
       ROLE-BASED RESPONSE
    ----------------------------------------- */

    return res.status(200).json({
      success: true,

      message: "Login successful",

      token,

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        baseId: user.baseId?.toString(),
      },
    });

  } catch (error) {
    console.error(
      "Login User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* =========================================================
   GOOGLE LOGIN
========================================================= */

export const googleLogin = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      googleId,
      name,
      email,
      role: selectedRole,
    } = req.body;

    if (!googleId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "Google ID, name and email are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // =====================================================
    // VALIDATE REQUESTED ROLE
    // =====================================================

    if (
      selectedRole &&
      selectedRole !== "USER" &&
      selectedRole !== "BASE_HEAD" &&
      selectedRole !== "ADMIN"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid account role",
      });
    }

    // =====================================================
    // FIND EXISTING ACCOUNT
    // =====================================================

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // =====================================================
    // NEW GOOGLE ACCOUNT
    // =====================================================

    if (!user) {

      // -----------------------------------------------
      // ADMIN CANNOT BE CREATED THROUGH GOOGLE
      // -----------------------------------------------

      if (selectedRole === "ADMIN") {
        return res.status(403).json({
          success: false,
          message:
            "Administrator accounts cannot be created through Google Sign-In.",
        });
      }

      // -----------------------------------------------
      // BASE HEAD
      // -----------------------------------------------

      const newRole: UserRole =
        selectedRole === "BASE_HEAD"
          ? "BASE_HEAD"
          : "USER";

      const newStatus =
        newRole === "BASE_HEAD"
          ? "PENDING"
          : "APPROVED";

      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        googleId,

        role: newRole,

        status: newStatus,

        authProvider: "GOOGLE",

        isActive: true,

        totpEnabled: false,
        totpSecret: null,
      });

    } else {

      // =================================================
      // EXISTING ACCOUNT
      // =================================================

      // Add Google ID if missing
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "GOOGLE";

        await user.save();
      }

      // =================================================
      // ROLE MUST MATCH DATABASE
      // =================================================

      if (
        selectedRole &&
        selectedRole !== user.role
      ) {
        return res.status(403).json({
          success: false,
          message:
            `This account is registered as ${user.role}`,
        });
      }
    }

    // =====================================================
    // ACCOUNT ACTIVE CHECK
    // =====================================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    // =====================================================
    // BASE HEAD STATUS
    // =====================================================

    if (user.role === "BASE_HEAD") {

      // -----------------------------------------------
      // REJECTED
      // -----------------------------------------------

      if (user.status === "REJECTED") {
        return res.status(403).json({
          success: false,
          message:
            "Your Base Head application was rejected by the administrator.",
          status: "REJECTED",
        });
      }

      // -----------------------------------------------
      // SUSPENDED
      // -----------------------------------------------

      if (user.status === "SUSPENDED") {
        return res.status(403).json({
          success: false,
          message:
            "Your Base Head account has been suspended.",
          status: "SUSPENDED",
        });
      }

      // -----------------------------------------------
      // PENDING
      // -----------------------------------------------

      if (user.status === "PENDING") {

        const token = generateToken(
          user._id.toString(),
          user.role,
          user.baseId?.toString()
        );

        return res.status(200).json({
          success: true,

          message:
            "Base Head application is awaiting administrator approval.",

          requiresApproval: true,

          token,

          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            baseId: user.baseId,
          },
        });
      }

      // -----------------------------------------------
      // APPROVED
      // -----------------------------------------------

      if (user.status === "APPROVED") {

        const token = generateToken(
          user._id.toString(),
          user.role,
          user.baseId?.toString()
        );

        return res.status(200).json({
          success: true,
          message: "Base Head login successful",

          token,

          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            baseId: user.baseId,
          },
        });
      }
    }

    // =====================================================
    // ADMIN GOOGLE LOGIN
    // =====================================================

    if (user.role === "ADMIN") {

      // Admin MUST have TOTP
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

      // Temporary token ONLY for TOTP verification
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

        message:
          "Admin identity verified. Two-factor authentication required.",

        requiresTwoFactor: true,

        verificationToken,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          baseId: user.baseId,
        },
      });
    }

    // =====================================================
    // NORMAL USER GOOGLE LOGIN
    // =====================================================

    const token = generateToken(
      user._id.toString(),
      user.role,
      user.baseId?.toString()
    );

    return res.status(200).json({
      success: true,

      message: "Google login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        baseId: user.baseId,
      },
    });

  } catch (error) {

    console.error(
      "Google Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Google authentication failed",
    });
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        authProvider: user.authProvider,
        baseId: user.baseId,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyEmailOTP = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      otp,
    }: {
      email?: string;
      otp?: string;
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    /*
    |--------------------------------------------------------------------------
    | FIND OTP
    |--------------------------------------------------------------------------
    */

    const otpRecord =
      await EmailOTP.findOne({
        email: normalizedEmail,
      }).sort({
        createdAt: -1,
      });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message:
          "Verification code not found or expired. Please request a new code.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | EXPIRY CHECK
    |--------------------------------------------------------------------------
    */

    if (
      otpRecord.expiresAt.getTime() <
      Date.now()
    ) {
      await EmailOTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "Verification code has expired. Please request a new code.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ATTEMPT LIMIT
    |--------------------------------------------------------------------------
    */

    if (otpRecord.attempts >= 5) {
      await EmailOTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new code.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY OTP
    |--------------------------------------------------------------------------
    */

    const submittedHash =
      hashEmailOTP(otp.trim());

    if (
      submittedHash !==
      otpRecord.otpHash
    ) {
      otpRecord.attempts += 1;

      await otpRecord.save();

      return res.status(401).json({
        success: false,
        message:
          "Invalid verification code",
        attemptsRemaining:
          5 - otpRecord.attempts,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND USER
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findById(
        otpRecord.userId
      );

    if (!user) {
      await EmailOTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(404).json({
        success: false,
        message:
          "User account no longer exists",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT CHECK
    |--------------------------------------------------------------------------
    */

    if (!user.isActive) {
      await EmailOTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled",
      });
    }

    if (user.status === "SUSPENDED") {
      await EmailOTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(403).json({
        success: false,
        message:
          "Your account has been suspended",
      });
    }

    if (
      user.role === "BASE_HEAD" &&
      user.status === "REJECTED"
    ) {
      await EmailOTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(403).json({
        success: false,
        message:
          "Your Base Head request has been rejected",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE USED OTP
    |--------------------------------------------------------------------------
    */

    await EmailOTP.deleteOne({
      _id: otpRecord._id,
    });

    /*
    |--------------------------------------------------------------------------
    | GENERATE FINAL JWT
    |--------------------------------------------------------------------------
    */

    const token =
      generateToken(
        user._id.toString(),
        user.role,
        user.baseId?.toString()
      );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message:
        "Email verification successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        baseId: user.baseId,
      },
    });

  } catch (error) {

    console.error(
      "Verify Email OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify email OTP",
    });
  }
};

export const resendEmailOTP = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
    }: {
      email?: string;
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Account not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled",
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been suspended",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GENERATE NEW OTP
    |--------------------------------------------------------------------------
    */

    const otp =
      generateEmailOTP();

    const otpHash =
      hashEmailOTP(otp);

    const expiresAt =
      new Date(
        Date.now() + 5 * 60 * 1000
      );

    /*
    |--------------------------------------------------------------------------
    | REMOVE OLD OTP
    |--------------------------------------------------------------------------
    */

    await EmailOTP.deleteMany({
      userId: user._id,
    });

    /*
    |--------------------------------------------------------------------------
    | SAVE NEW OTP
    |--------------------------------------------------------------------------
    */

    await EmailOTP.create({
      userId: user._id,
      email: user.email,
      otpHash,
      expiresAt,
      attempts: 0,
    });

    /*
    |--------------------------------------------------------------------------
    | SEND EMAIL
    |--------------------------------------------------------------------------
    */

    await sendLoginOTP(
      user.email,
      otp,
      user.name
    );

    return res.status(200).json({
      success: true,
      message:
        "A new verification code has been sent to your email.",
    });

  } catch (error) {

    console.error(
      "Resend Email OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to resend verification code",
    });
  }
};