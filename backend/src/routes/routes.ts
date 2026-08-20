import express, {
  Request,
  Response,
} from "express"; const router = express.Router();
import User from "../models/user_model";
import { googleLogin, loginUser, registerUser, getCurrentUser,verifyEmailOTP,resendEmailOTP } from "../controller/user_controller"
import { authenticateToken, AuthRequest } from "../middleware/auth_middleware";
import { adminLogin, verifyAdminTOTP, } from "../controller/admin_auth_controller";
import { setupAdminTOTP, confirmAdminTOTP, } from "../services/admin_auth_service";
import { requireAdmin } from "../middleware/admin_middleware";
import { getBaseHeadRequests, approveBaseHead, rejectBaseHead, } from "../controller/admin_controller";
import { createBaseProfile, getMyBase, updateMyBase, } from "../controller/base_controller";
// user 
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/verify-email-otp",verifyEmailOTP);
router.post("/resend-email-otp",resendEmailOTP);
//admin
router.get("/admin/head-requests", authenticateToken, requireAdmin, getBaseHeadRequests);
router.post("/admin/head-requests/:id/approve", authenticateToken, requireAdmin, approveBaseHead);
router.post("/admin/head-requests/:id/reject", authenticateToken, requireAdmin, rejectBaseHead);
router.post("/admin/login", adminLogin);
router.post("/admin/verify-totp", verifyAdminTOTP);

//basehead
// ============================================================
// BASE HEAD / BASE
// ============================================================

router.post("/base/setup", authenticateToken, createBaseProfile);
router.get("/base/me", authenticateToken, getMyBase);
router.put("/base/me", authenticateToken, updateMyBase);

router.post(
  "/admin/setup-totp",
  async (req: Request, res: Response) => {
    try {
      const {
        email,
        setupKey,
      } = req.body;

      const adminSetupKey =
        process.env.ADMIN_SETUP_KEY;

      if (!adminSetupKey) {
        return res.status(500).json({
          success: false,
          message:
            "Admin setup key is not configured",
        });
      }

      if (
        typeof email !== "string" ||
        typeof setupKey !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and setup key are required",
        });
      }

      if (setupKey !== adminSetupKey) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid admin setup authorization",
        });
      }

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Admin account not found",
        });
      }

      if (user.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message:
            "This account is not an administrator",
        });
      }

      const result =
        await setupAdminTOTP(
          user._id.toString()
        );

      return res.status(200).json({
        success: true,
        message:
          "TOTP setup generated successfully",
        data: result,
      });

    } catch (error) {
      console.error(
        "Admin TOTP setup error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "TOTP setup failed",
      });
    }
  }
);

router.post(
  "/admin/confirm-totp",
  async (req: Request, res: Response) => {
    try {
      const {
        email,
        otp,
        setupKey,
      } = req.body;

      const adminSetupKey =
        process.env.ADMIN_SETUP_KEY;

      if (!adminSetupKey) {
        return res.status(500).json({
          success: false,
          message:
            "Admin setup key is not configured",
        });
      }

      if (
        typeof email !== "string" ||
        typeof otp !== "string" ||
        typeof setupKey !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email, OTP and setup key are required",
        });
      }

      if (setupKey !== adminSetupKey) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid admin setup authorization",
        });
      }

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "Admin account not found",
        });
      }

      if (user.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message:
            "Admin access denied",
        });
      }

      const valid =
        await confirmAdminTOTP(
          user._id.toString(),
          otp
        );

      if (!valid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticator code",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Admin authenticator activated successfully",
      });

    } catch (error) {
      console.error(
        "Admin TOTP confirmation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "TOTP confirmation failed",
      });
    }
  }
);

// router.post(
//     "/admin/setup-totp",
//     authenticateToken,requireAdmin,
//     async (req : AuthRequest, res) => {
//         try {
//             const userId = req.userId;

//             if (!userId) {
//                 return res.status(401).json({
//                     success: false,
//                     message: "Unauthorized",
//                 });
//             }

//             const result = await setupAdminTOTP(
//                 userId
//             );

//             return res.status(200).json({
//                 success: true,
//                 message: "TOTP setup created",
//                 data: result,
//             });
//         } catch (error) {
//             console.error(
//                 "Admin TOTP setup error:",
//                 error
//             );

//             return res.status(400).json({
//                 success: false,
//                 message:
//                     error instanceof Error
//                         ? error.message
//                         : "TOTP setup failed",
//             });
//         }
//     }
// );


// Confirm first TOTP code
// router.post(
//     "/admin/confirm-totp",
//     authenticateToken,requireAdmin,
//     async (req: AuthRequest, res) => {
//         try {
//             const userId = req.userId;
//             const { otp } = req.body;

//             if (!userId) {
//                 return res.status(401).json({
//                     success: false,
//                     message: "Unauthorized",
//                 });
//             }

//             if (!otp) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "OTP is required",
//                 });
//             }

//             const valid = await confirmAdminTOTP(
//                 userId,
//                 otp
//             );

//             if (!valid) {
//                 return res.status(401).json({
//                     success: false,
//                     message: "Invalid OTP",
//                 });
//             }

//             return res.status(200).json({
//                 success: true,
//                 message:
//                     "Admin TOTP enabled successfully",
//             });
//         } catch (error) {
//             console.error(
//                 "Admin TOTP confirmation error:",
//                 error
//             );

//             return res.status(500).json({
//                 success: false,
//                 message:
//                     "TOTP confirmation failed",
//             });
//         }
//     }
// );

export default router;