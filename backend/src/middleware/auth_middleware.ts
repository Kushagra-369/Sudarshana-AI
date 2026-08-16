import {
    Request,
    Response,
    NextFunction,
} from "express";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import User from "../models/user_model";

dotenv.config({ quiet: true });
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        "JWT_SECRET is not configured"
    );
}

interface JwtPayload {
    userId: string;
    role: string;
    baseId?: string;
}

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
    baseId?: string;
}

export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        // =====================================================
        // 1. READ AUTHORIZATION HEADER
        // =====================================================

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message:
                    "Authorization header missing",
            });
        }

        // =====================================================
        // 2. EXTRACT BEARER TOKEN
        // =====================================================

        if (
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Bearer token missing",
            });
        }

        const token =
            authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication token missing",
            });
        }

        // =====================================================
        // 3. VERIFY JWT
        // =====================================================

        let decoded: JwtPayload;

        try {

            decoded = jwt.verify(
                token,
                JWT_SECRET
            ) as JwtPayload;

        } catch (error) {

            console.error(
                "JWT verification failed:",
                error
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid or expired token",
            });
        }

        // =====================================================
        // 4. VALIDATE JWT PAYLOAD
        // =====================================================

        if (
            !decoded.userId ||
            !decoded.role
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid authentication token",
            });
        }

        // =====================================================
        // 5. IMPORTANT:
        // CHECK USER STILL EXISTS IN DATABASE
        // =====================================================

        const user = await User.findById(
            decoded.userId
        ).select(
            "_id name email role status isActive baseId"
        );

        // User was deleted from MongoDB
        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Account no longer exists",
            });
        }

        // =====================================================
        // 6. CHECK ACCOUNT ACTIVE STATUS
        // =====================================================

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been disabled",
            });
        }

        // =====================================================
        // 7. CHECK ACCOUNT STATUS
        // =====================================================

        if (
            user.status === "SUSPENDED"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been suspended",
            });
        }

        if (
            user.status === "REJECTED"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account access has been rejected",
            });
        }

        // =====================================================
        // 8. IMPORTANT:
        // CHECK TOKEN ROLE AGAINST CURRENT DB ROLE
        // =====================================================

        if (
            user.role !== decoded.role
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication role is no longer valid",
            });
        }

        // =====================================================
        // 9. PUT CURRENT DB DATA INTO REQUEST
        // =====================================================

        req.userId =
            user._id.toString();

        req.userRole =
            user.role;

        if (user.baseId) {
            req.baseId =
                user.baseId.toString();
        } 

        // =====================================================
        // 10. AUTHENTICATION SUCCESSFUL
        // =====================================================

        next();

    } catch (error) {

        console.error(
            "Authentication middleware error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Authentication error",
        });
    }
};