import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
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

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing",
            });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Bearer token missing",
            });
        }

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        ) as JwtPayload;

        req.userId = decoded.userId;
        req.userRole = decoded.role;
        if (decoded.baseId !== undefined) {
            req.baseId = decoded.baseId;
        }
        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};