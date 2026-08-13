import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, {
  UserRole,
  AuthProvider,
} from "../models/user_model";
import dotenv from "dotenv";

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

/* =========================================================
   REGISTER USER
========================================================= */

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

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    /* -----------------------------------------
       CHECK EXISTING USER
    ----------------------------------------- */

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    /* -----------------------------------------
       IMPORTANT:
       NEVER TRUST ADMIN FROM FRONTEND
    ----------------------------------------- */

    let userRole: UserRole;

    if (role === "BASE_HEAD") {
      userRole = "BASE_HEAD";
    } else {
      // USER is the default.
      // ADMIN can NEVER be created through signup.
      userRole = "USER";
    }

    /* -----------------------------------------
       ACCOUNT STATUS
    ----------------------------------------- */

    const accountStatus =
      userRole === "BASE_HEAD"
        ? "PENDING"
        : "APPROVED";

    /* -----------------------------------------
       HASH PASSWORD
    ----------------------------------------- */

    const hashedPassword = await bcrypt.hash(password, 12);

    /* -----------------------------------------
       CREATE USER
    ----------------------------------------- */

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      role: userRole,
      status: accountStatus,

      authProvider: "LOCAL" as AuthProvider,

      isActive: true,
    });

    /* -----------------------------------------
       BASE HEAD
       NO TOKEN YET
    ----------------------------------------- */

    if (userRole === "BASE_HEAD") {
      return res.status(201).json({
        success: true,
        message:
          "Base Head registration submitted. Waiting for administrator approval.",
        requiresApproval: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    }

    /* -----------------------------------------
       NORMAL USER
       LOGIN IMMEDIATELY
    ----------------------------------------- */

    const token = generateToken(
      user._id.toString(),
      user.role
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      requiresApproval: false,
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Register User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    /* -----------------------------------------
       FIND USER
       password is select:false in model,
       therefore explicitly select it.
    ----------------------------------------- */

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* -----------------------------------------
       ACCOUNT ACTIVE CHECK
    ----------------------------------------- */

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    /* -----------------------------------------
       BASE HEAD APPROVAL CHECK
    ----------------------------------------- */

    if (user.role === "BASE_HEAD") {
      if (user.status === "PENDING") {
        return res.status(403).json({
          success: false,
          message:
            "Your Base Head account is waiting for administrator approval",
          requiresApproval: true,
          status: "PENDING",
        });
      }

      if (user.status === "REJECTED") {
        return res.status(403).json({
          success: false,
          message:
            "Your Base Head request has been rejected",
          status: "REJECTED",
        });
      }
    }

    /* -----------------------------------------
       GENERAL STATUS CHECK
    ----------------------------------------- */

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended",
      });
    }

    /* -----------------------------------------
       PASSWORD CHECK
    ----------------------------------------- */

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* -----------------------------------------
       TOKEN
    ----------------------------------------- */

    const token = generateToken(
      user._id.toString(),
      user.role,
      user.baseId?.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
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
    console.error("Login User Error:", error);

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
    const { googleId, name, email } = req.body;

    if (!googleId || !name || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Google ID, name and email are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    /* -----------------------------------------
       FIND EXISTING USER
    ----------------------------------------- */

    let user = await User.findOne({
      email: normalizedEmail,
    });

    /* -----------------------------------------
       NEW GOOGLE USER
       Always USER
    ----------------------------------------- */

    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        googleId,

        // NEVER allow Google signup to create ADMIN
        role: "USER",

        status: "APPROVED",
        authProvider: "GOOGLE",

        isActive: true,
      });
    } else {
      /* -----------------------------------------
         UPDATE GOOGLE ID IF REQUIRED
      ----------------------------------------- */

      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "GOOGLE";

        await user.save();
      }
    }

    /* -----------------------------------------
       ACCOUNT CHECK
    ----------------------------------------- */

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    if (user.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Your account is not approved",
        status: user.status,
      });
    }

    /* -----------------------------------------
       TOKEN
    ----------------------------------------- */

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
    console.error("Google Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

