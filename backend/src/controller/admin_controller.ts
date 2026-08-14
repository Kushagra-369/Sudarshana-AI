import { Request, Response } from "express";
import User from "../models/user_model";
import AuditLog from "../models/AuditLog";
import { AuthRequest } from "../middleware/auth_middleware";

/*
|--------------------------------------------------------------------------
| GET BASE HEAD REQUESTS
|--------------------------------------------------------------------------
| Admin ko saare pending Base Head applications dikhayega.
|--------------------------------------------------------------------------
*/

export const getBaseHeadRequests = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const requests = await User.find({
            role: "BASE_HEAD",
            status: "PENDING",
        })
            .select(
                "-password -googleId -totpSecret"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests,
        });
    } catch (error) {
        console.error(
            "Get Base Head Requests Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch Base Head requests",
        });
    }
};


/*
|--------------------------------------------------------------------------
| APPROVE BASE HEAD
|--------------------------------------------------------------------------
*/

export const approveBaseHead = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        const adminId = req.userId;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const admin = await User.findById(adminId);

        if (!admin || admin.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }

        if (typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid Base Head ID",
            });
        }

        const baseHead = await User.findOne({
            _id: id,
            role: "BASE_HEAD",
            status: "PENDING",
        });

        if (!baseHead) {
            return res.status(404).json({
                success: false,
                message:
                    "Pending Base Head request not found",
            });
        }

        baseHead.status = "APPROVED";

        await baseHead.save();

        /*
         * Audit log
         */

        const auditData: {
            actorId: typeof admin._id;
            actorName: string;
            actorEmail: string;
            action: "BASE_HEAD_APPROVED";
            targetUserId: typeof baseHead._id;
            description: string;
            ipAddress?: string;
            userAgent?: string;
        } = {
            actorId: admin._id,
            actorName: admin.name,
            actorEmail: admin.email,
            action: "BASE_HEAD_APPROVED",
            targetUserId: baseHead._id,
            description: `Approved Base Head request for ${baseHead.name}`,
        };

        if (req.ip) {
            auditData.ipAddress = req.ip;
        }

        const userAgent = req.headers["user-agent"];

        if (typeof userAgent === "string") {
            auditData.userAgent = userAgent;
        }

        await AuditLog.create(auditData);

        return res.status(200).json({
            success: true,
            message: "Base Head approved successfully",
            user: {
                id: baseHead._id,
                name: baseHead.name,
                email: baseHead.email,
                status: baseHead.status,
            },
        });
    } catch (error) {
        console.error(
            "Approve Base Head Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to approve Base Head",
        });
    }
};


/*
|--------------------------------------------------------------------------
| REJECT BASE HEAD
|--------------------------------------------------------------------------
*/

export const rejectBaseHead = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        const adminId = req.userId;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const admin = await User.findById(adminId);

        if (!admin || admin.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }

        if (typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid Base Head ID",
            });
        }

        const baseHead = await User.findOne({
            _id: id,
            role: "BASE_HEAD",
            status: "PENDING",
        });

        if (!baseHead) {
            return res.status(404).json({
                success: false,
                message:
                    "Pending Base Head request not found",
            });
        }

        baseHead.status = "REJECTED";

        await baseHead.save();

        /*
         * Audit log
         */

        const auditData: {
            actorId: typeof admin._id;
            actorName: string;
            actorEmail: string;
            action: "BASE_HEAD_REJECTED";
            targetUserId: typeof baseHead._id;
            description: string;
            ipAddress?: string;
            userAgent?: string;
        } = {
            actorId: admin._id,
            actorName: admin.name,
            actorEmail: admin.email,
            action: "BASE_HEAD_REJECTED",
            targetUserId: baseHead._id,
            description: `Rejected Base Head request for ${baseHead.name}`,
        };

        if (req.ip) {
            auditData.ipAddress = req.ip;
        }

        const userAgent = req.headers["user-agent"];

        if (typeof userAgent === "string") {
            auditData.userAgent = userAgent;
        }

        await AuditLog.create(auditData);

        return res.status(200).json({
            success: true,
            message: "Base Head request rejected",
            user: {
                id: baseHead._id,
                name: baseHead.name,
                email: baseHead.email,
                status: baseHead.status,
            },
        });
    } catch (error) {
        console.error(
            "Reject Base Head Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to reject Base Head",
        });
    }
};