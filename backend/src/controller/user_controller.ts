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
dotenv.config({ quiet: true });
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
       PUBLIC REGISTRATION ROLES
       ADMIN CANNOT BE CREATED FROM SIGNUP
    ===================================================== */

    if (role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "Administrator accounts cannot be created through public registration.",
      });
    }

    const userRole: UserRole =
      role === "BASE_HEAD"
        ? "BASE_HEAD"
        : "USER";

    /* =====================================================
       FIND EXISTING ACCOUNT
    ===================================================== */

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    /* =====================================================
       EXISTING ACCOUNT
    ===================================================== */

    if (existingUser) {

      /* ===================================================
         ADMIN CANNOT BE MODIFIED
      =================================================== */

      if (existingUser.role === "ADMIN") {
        return res.status(403).json({
          success: false,
          message:
            "Administrator accounts must use administrator authentication.",
        });
      }

      /* ===================================================
         VERIFIED ACCOUNT
         Handle USER <-> BASE_HEAD conversion
      =================================================== */

      if (existingUser.emailVerified === true) {

        /* -----------------------------------------------
           USER → BASE_HEAD
        ----------------------------------------------- */

        if (
          existingUser.role === "USER" &&
          userRole === "BASE_HEAD"
        ) {
          existingUser.role = "BASE_HEAD";
          existingUser.status = "PENDING";

          // Do not carry any old base
          existingUser.set("baseId", undefined);

          await existingUser.save();

          return res.status(200).json({
            success: true,
            message:
              "Your account has been changed to Base Head. Waiting for administrator approval.",
            role: existingUser.role,
            status: existingUser.status,
            requiresApproval: true,
            requiresLogin: true,
            user: {
              id: existingUser._id.toString(),
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
              status: existingUser.status,
            },
          });
        }

        /* -----------------------------------------------
           BASE_HEAD → USER

           Allowed ONLY if not APPROVED
        ----------------------------------------------- */

        if (
          existingUser.role === "BASE_HEAD" &&
          userRole === "USER"
        ) {

          if (
            existingUser.status === "APPROVED"
          ) {
            return res.status(403).json({
              success: false,
              message:
                "An approved Base Head cannot be changed to a User account.",
            });
          }

          existingUser.role = "USER";
          existingUser.status = "APPROVED";

          // Remove Base Head association
          existingUser.set("baseId", undefined);

          await existingUser.save();

          return res.status(200).json({
            success: true,
            message:
              "Your account has been changed to User.",
            role: existingUser.role,
            status: existingUser.status,
            requiresLogin: true,
            user: {
              id: existingUser._id.toString(),
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
              status: existingUser.status,
            },
          });
        }

        /* -----------------------------------------------
           SAME ROLE
        ----------------------------------------------- */

        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists. Please sign in.",
          accountExists: true,
          emailVerified: true,
          role: existingUser.role,
          status: existingUser.status,
        });
      }

      /* ===================================================
         UNVERIFIED ACCOUNT

         Allow registration again and generate fresh OTP.
      =================================================== */

      await EmailOTP.deleteMany({
        userId: existingUser._id,
      });

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

      existingUser.set("baseId", undefined);

      await existingUser.save();

      /* -----------------------------------------------
         GENERATE OTP
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
         SEND OTP
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

    const accountStatus: AccountStatus =
      userRole === "BASE_HEAD"
        ? "PENDING"
        : "APPROVED";

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

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
       EMAIL OTP
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

    await EmailOTP.deleteMany({
      userId:
        user._id,
    });

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
       SEND OTP
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

      await EmailOTP.deleteMany({
        userId:
          user._id,
      });

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
      role: selectedRole,
    }: {
      email?: string;
      password?: string;
      role?: UserRole;
    } = req.body;

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    /* =====================================================
       VALIDATE ROLE
    ===================================================== */

    if (
      selectedRole &&
      selectedRole !== "USER" &&
      selectedRole !== "BASE_HEAD"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid account role",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    /* =====================================================
       FIND USER
    ===================================================== */

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    /* =====================================================
       ADMIN
       Normal /login can NEVER change ADMIN.
    ===================================================== */

    if (user.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "Administrator accounts must use administrator login.",
        role: "ADMIN",
      });
    }

    /* =====================================================
       ACTIVE CHECK
    ===================================================== */

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled",
      });
    }

    /* =====================================================
       GOOGLE ACCOUNT
    ===================================================== */

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    /* =====================================================
       PASSWORD
    ===================================================== */

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

    /* =====================================================
       ROLE TRANSITIONS
    ===================================================== */

    /* -----------------------------------------------------
       USER → BASE_HEAD
    ----------------------------------------------------- */

    if (
      user.role === "USER" &&
      selectedRole === "BASE_HEAD"
    ) {

      user.role =
        "BASE_HEAD";

      user.status =
        "PENDING";

      user.set("baseId", undefined);

      await user.save();
    }

    /* -----------------------------------------------------
       BASE_HEAD → USER
       ONLY IF NOT APPROVED
    ----------------------------------------------------- */

    else if (
      user.role === "BASE_HEAD" &&
      selectedRole === "USER"
    ) {

      if (
        user.status === "APPROVED"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "An approved Base Head cannot be changed to a User account.",
          status:
            "APPROVED",
        });
      }

      user.role =
        "USER";

      user.status =
        "APPROVED";

      user.set("baseId", undefined);

      await user.save();
    }

    /* =====================================================
       BASE HEAD STATUS
    ===================================================== */

    if (
      user.role === "BASE_HEAD"
    ) {

      /* -----------------------------------------------
         REJECTED
      ----------------------------------------------- */

      if (
        user.status === "REJECTED"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your Base Head application was rejected. Select User to continue as a normal user.",
          status:
            "REJECTED",
          canLoginAsUser:
            true,
        });
      }

      /* -----------------------------------------------
         SUSPENDED
      ----------------------------------------------- */

      if (
        user.status === "SUSPENDED"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your Base Head account is suspended. Select User to continue as a normal user.",
          status:
            "SUSPENDED",
          canLoginAsUser:
            true,
        });
      }

      /* -----------------------------------------------
         PENDING
      ----------------------------------------------- */

      if (
        user.status === "PENDING"
      ) {

        const token =
          generateToken(
            user._id.toString(),
            user.role,
            user.baseId?.toString()
          );

        return res.status(200).json({
          success: true,

          message:
            "Base Head application is awaiting administrator approval.",

          requiresApproval:
            true,

          token,

          user: {
            id:
              user._id.toString(),
            name:
              user.name,
            email:
              user.email,
            role:
              user.role,
            status:
              user.status,
            baseId:
              user.baseId?.toString(),
          },
        });
      }

      /* -----------------------------------------------
         APPROVED
      ----------------------------------------------- */

      if (
        user.status === "APPROVED"
      ) {

        const token =
          generateToken(
            user._id.toString(),
            user.role,
            user.baseId?.toString()
          );

        return res.status(200).json({
          success: true,

          message:
            "Base Head login successful",

          token,

          user: {
            id:
              user._id.toString(),
            name:
              user.name,
            email:
              user.email,
            role:
              user.role,
            status:
              user.status,
            baseId:
              user.baseId?.toString(),
          },
        });
      }
    }

    /* =====================================================
       NORMAL USER
    ===================================================== */

    const token =
      generateToken(
        user._id.toString(),
        user.role,
        user.baseId?.toString()
      );

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      token,

      user: {
        id:
          user._id.toString(),
        name:
          user.name,
        email:
          user.email,
        role:
          user.role,
        status:
          user.status,
        baseId:
          user.baseId?.toString(),
      },
    });

  } catch (error) {

    console.error(
      "Login User Error:",
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
   GOOGLE LOGIN
========================================================= */

export const googleLogin = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("\n========================================");
    console.log("🔥 GOOGLE LOGIN REQUEST RECEIVED");
    console.log("========================================");

    const {
      googleId,
      name,
      email,
      role: selectedRole,
    } = req.body;

    console.log("📦 Google Request Body:", {
      googleId: googleId ? "RECEIVED" : "MISSING",
      name,
      email,
      selectedRole,
    });

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!googleId || !name || !email) {
      console.log("❌ Google validation failed");

      return res.status(400).json({
        success: false,
        message:
          "Google ID, name and email are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    console.log(
      "📧 Normalized Email:",
      normalizedEmail
    );

    /* =====================================================
       VALIDATE ROLE
    ===================================================== */

    if (
      selectedRole &&
      selectedRole !== "USER" &&
      selectedRole !== "BASE_HEAD" &&
      selectedRole !== "ADMIN"
    ) {
      console.log(
        "❌ Invalid role:",
        selectedRole
      );

      return res.status(400).json({
        success: false,
        message: "Invalid account role",
      });
    }

    /* =====================================================
       FIND EXISTING ACCOUNT
    ===================================================== */

    console.log(
      "🔍 Searching MongoDB for existing user..."
    );

    let user = await User.findOne({
      email: normalizedEmail,
    });

    console.log(
      "🔎 Existing User:",
      user
        ? {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            status: user.status,
            authProvider: user.authProvider,
            hasGoogleId: !!user.googleId,
          }
        : "NO USER FOUND"
    );

    /* =====================================================
       NEW GOOGLE ACCOUNT
    ===================================================== */

    if (!user) {
      console.log(
        "🆕 No existing account found."
      );

      console.log(
        "📝 Creating new Google account..."
      );

      const newRole: UserRole =
        selectedRole === "BASE_HEAD"
          ? "BASE_HEAD"
          : "USER";

      const newStatus: AccountStatus =
        newRole === "BASE_HEAD"
          ? "PENDING"
          : "APPROVED";

      console.log("👤 New Role:", newRole);
      console.log("📊 New Status:", newStatus);

      user = await User.create({
        name: name.trim(),

        email: normalizedEmail,

        googleId,

        role: newRole,

        status: newStatus,

        authProvider: "GOOGLE",

        isActive: true,

        emailVerified: true,

        totpEnabled: false,

        totpSecret: null,
      });

      console.log(
        "✅ GOOGLE USER CREATED SUCCESSFULLY"
      );

      console.log("🆔 MongoDB User ID:", user._id);
      console.log("📧 Email:", user.email);
      console.log("👤 Role:", user.role);
      console.log("🔐 Auth Provider:", user.authProvider);
    }

    /* =====================================================
       EXISTING ACCOUNT
    ===================================================== */

    else {
      console.log(
        "♻️ Existing account found. Updating/checking account..."
      );

      /* -----------------------------------------------
         ADMIN
      ----------------------------------------------- */

      if (user.role === "ADMIN") {
        console.log(
          "👑 Existing account is ADMIN"
        );

        if (
          selectedRole &&
          selectedRole !== "ADMIN"
        ) {
          console.log(
            "❌ Attempted ADMIN role conversion"
          );

          return res.status(403).json({
            success: false,
            message:
              "Administrator accounts cannot be converted to another role.",
          });
        }
      }

      /* -----------------------------------------------
         USER → BASE_HEAD
      ----------------------------------------------- */

      else if (
        user.role === "USER" &&
        selectedRole === "BASE_HEAD"
      ) {
        console.log(
          "🔄 Converting USER → BASE_HEAD"
        );

        user.role = "BASE_HEAD";

        user.status = "PENDING";

        user.set("baseId", undefined);

        await user.save();

        console.log(
          "✅ USER → BASE_HEAD saved to MongoDB"
        );
      }

      /* -----------------------------------------------
         BASE_HEAD → USER
         ONLY NON-APPROVED
      ----------------------------------------------- */

      else if (
        user.role === "BASE_HEAD" &&
        selectedRole === "USER"
      ) {
        console.log(
          "🔄 BASE_HEAD → USER requested"
        );

        if (user.status === "APPROVED") {
          console.log(
            "❌ Approved Base Head cannot become User"
          );

          return res.status(403).json({
            success: false,
            message:
              "An approved Base Head cannot be changed to a User account.",
            status: "APPROVED",
          });
        }

        user.role = "USER";

        user.status = "APPROVED";

        user.set("baseId", undefined);

        await user.save();

        console.log(
          "✅ BASE_HEAD → USER saved to MongoDB"
        );
      }

      /* -----------------------------------------------
         UPDATE GOOGLE INFORMATION
      ----------------------------------------------- */

      let googleDataChanged = false;

      if (!user.googleId) {
        console.log(
          "➕ Google ID missing. Adding Google ID..."
        );

        user.googleId = googleId;

        googleDataChanged = true;
      }

      if (user.authProvider !== "GOOGLE") {
        console.log(
          "➕ Updating authProvider → GOOGLE"
        );

        user.authProvider = "GOOGLE";

        googleDataChanged = true;
      }

      if (!user.emailVerified) {
        console.log(
          "➕ Marking email as verified"
        );

        user.emailVerified = true;

        googleDataChanged = true;
      }

      if (googleDataChanged) {
        await user.save();

        console.log(
          "✅ Existing Google account updated in MongoDB"
        );
      } else {
        console.log(
          "ℹ️ No MongoDB update required for existing user"
        );
      }
    }

    /* =====================================================
       ACTIVE CHECK
    ===================================================== */

    console.log(
      "🔐 Checking account active status..."
    );

    if (!user.isActive) {
      console.log(
        "❌ Account is disabled"
      );

      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled",
      });
    }

    /* =====================================================
       ADMIN GOOGLE LOGIN
    ===================================================== */

    if (user.role === "ADMIN") {
      console.log(
        "👑 ADMIN Google login"
      );

      if (
        !user.totpEnabled ||
        !user.totpSecret
      ) {
        console.log(
          "❌ Admin TOTP not configured"
        );

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

      console.log(
        "✅ Admin Google identity verified"
      );

      return res.status(200).json({
        success: true,

        message:
          "Admin identity verified. Two-factor authentication required.",

        requiresTwoFactor: true,

        verificationToken,

        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          baseId: user.baseId?.toString(),
        },
      });
    }

    /* =====================================================
       BASE HEAD
    ===================================================== */

    if (user.role === "BASE_HEAD") {
      console.log(
        "🏢 BASE_HEAD Google login"
      );

      /* -----------------------------------------------
         REJECTED
      ----------------------------------------------- */

      if (user.status === "REJECTED") {
        console.log(
          "❌ Base Head account rejected"
        );

        return res.status(403).json({
          success: false,
          message:
            "Your Base Head application was rejected. Select User to continue.",
          status: "REJECTED",
          canLoginAsUser: true,
        });
      }

      /* -----------------------------------------------
         SUSPENDED
      ----------------------------------------------- */

      if (user.status === "SUSPENDED") {
        console.log(
          "❌ Base Head account suspended"
        );

        return res.status(403).json({
          success: false,
          message:
            "Your Base Head account is suspended. Select User to continue.",
          status: "SUSPENDED",
          canLoginAsUser: true,
        });
      }

      /* -----------------------------------------------
         PENDING
      ----------------------------------------------- */

      if (user.status === "PENDING") {
        console.log(
          "⏳ Base Head account pending approval"
        );

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
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            baseId: user.baseId?.toString(),
          },
        });
      }

      /* -----------------------------------------------
         APPROVED
      ----------------------------------------------- */

      if (user.status === "APPROVED") {
        console.log(
          "✅ Base Head account approved"
        );

        const token = generateToken(
          user._id.toString(),
          user.role,
          user.baseId?.toString()
        );

        return res.status(200).json({
          success: true,

          message:
            "Base Head login successful",

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
      }
    }

    /* =====================================================
       NORMAL USER GOOGLE LOGIN
    ===================================================== */

    console.log(
      "👤 NORMAL USER Google login"
    );

    const token = generateToken(
      user._id.toString(),
      user.role,
      user.baseId?.toString()
    );

    console.log(
      "🎉 GOOGLE LOGIN SUCCESS"
    );

    console.log("🆔 User ID:", user._id.toString());
    console.log("📧 Email:", user.email);
    console.log("👤 Role:", user.role);

    console.log("========================================\n");

    return res.status(200).json({
      success: true,

      message:
        "Google login successful",

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

  } catch (error: any) {
    console.error(
      "\n========================================"
    );

    console.error(
      "❌ GOOGLE LOGIN ERROR"
    );

    console.error(
      "========================================"
    );

    console.error(error);

    console.error(
      "========================================\n"
    );

    return res.status(500).json({
      success: false,
      message:
        "Google authentication failed",
      error:
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined,
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

/* =========================================================
   GET ALL NORMAL USERS
   Only users with role === "USER"
========================================================= */

export const getAllUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.find({
      role: "USER",
    })
      .select(
        "_id name email role status authProvider baseId isActive emailVerified createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        authProvider: user.authProvider,
        baseId: user.baseId?.toString() || null,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};