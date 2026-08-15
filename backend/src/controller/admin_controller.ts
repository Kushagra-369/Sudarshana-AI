import { Request, Response } from "express";

import User from "../models/user_model";
import Base from "../models/base_model";
import AuditLog from "../models/AuditLog";

import { AuthRequest } from "../middleware/auth_middleware";


// ============================================================================
// GET BASE HEAD REQUESTS
// ============================================================================
// Admin ko saare pending Base Head applications dikhata hai.
// Saath mein submitted Base ki information bhi bhejega.
// ============================================================================

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
            .sort({
                createdAt: -1,
            });

        // ------------------------------------------------------------
        // Base information attach karo
        // ------------------------------------------------------------

        const requestsWithBase =
            await Promise.all(
                requests.map(async (baseHead) => {
                    const base =
                        await Base.findOne({
                            createdBy:
                                baseHead._id,
                        });

                    return {
                        user: baseHead,
                        base: base
                            ? {
                                id: base._id,
                                name:
                                    base.name,
                                baseCode:
                                    base.baseCode,
                                type:
                                    base.type,
                                location:
                                    base.location,
                                address:
                                    base.address,
                                contactNumber:
                                    base.contactNumber,
                                officialEmail:
                                    base.officialEmail,
                                establishedDate:
                                    base.establishedDate,
                                personnelCount:
                                    base.personnelCount,
                                personnelCapacity:
                                    base.personnelCapacity,
                                emergencyContact:
                                    base.emergencyContact,
                                description:
                                    base.description,
                                status:
                                    base.status,
                            }
                            : null,
                    };
                })
            );

        return res.status(200).json({
            success: true,
            count:
                requestsWithBase.length,
            requests:
                requestsWithBase,
        });

    } catch (error) {
        console.error(
            "Get Base Head Requests Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch Base Head requests",
        });
    }
};


// ============================================================================
// APPROVE BASE HEAD
// ============================================================================
// Flow:
//
// Admin
//   ↓
// Pending Base Head
//   ↓
// Find Base created by that Base Head
//   ↓
// Base.headId = BaseHead._id
// BaseHead.baseId = Base._id
// BaseHead.status = APPROVED
//   ↓
// Audit Log
// ============================================================================

export const approveBaseHead = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        const adminId = req.userId;

        // ------------------------------------------------------------
        // ADMIN AUTHENTICATION
        // ------------------------------------------------------------

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // ------------------------------------------------------------
        // VERIFY ADMIN
        // ------------------------------------------------------------

        const admin =
            await User.findById(adminId);

        if (
            !admin ||
            admin.role !== "ADMIN"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Admin access required",
            });
        }

        // ------------------------------------------------------------
        // VALIDATE BASE HEAD ID
        // ------------------------------------------------------------

        if (
            typeof id !== "string" ||
            !id.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid Base Head ID",
            });
        }

        // ------------------------------------------------------------
        // FIND PENDING BASE HEAD
        // ------------------------------------------------------------

        const baseHead =
            await User.findOne({
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

        // ------------------------------------------------------------
        // FIND BASE SUBMITTED BY THIS BASE HEAD
        // ------------------------------------------------------------

        const base =
            await Base.findOne({
                createdBy:
                    baseHead._id,
            });

        if (!base) {
            return res.status(404).json({
                success: false,
                message:
                    "Base profile submitted by this Base Head was not found",
            });
        }

        // ------------------------------------------------------------
        // CHECK WHETHER BASE ALREADY HAS A HEAD
        // ------------------------------------------------------------

        if (base.headId) {
            return res.status(409).json({
                success: false,
                message:
                    "This base is already assigned to a Base Head",
            });
        }

        // ------------------------------------------------------------
        // CHECK WHETHER USER ALREADY HAS A BASE
        // ------------------------------------------------------------

        if (baseHead.baseId) {
            return res.status(409).json({
                success: false,
                message:
                    "This Base Head is already assigned to a base",
            });
        }

        // ------------------------------------------------------------
        // ASSIGN BASE HEAD TO BASE
        // ------------------------------------------------------------

        base.headId =
            baseHead._id;

        // ------------------------------------------------------------
        // ASSIGN BASE TO BASE HEAD
        // ------------------------------------------------------------

        baseHead.baseId =
            base._id;

        // ------------------------------------------------------------
        // APPROVE BASE HEAD
        // ------------------------------------------------------------

        baseHead.status =
            "APPROVED";

        // ------------------------------------------------------------
        // SAVE BOTH
        // ------------------------------------------------------------

        await base.save();
        await baseHead.save();

        // ------------------------------------------------------------
        // AUDIT LOG
        // ------------------------------------------------------------

        const auditData: {
            actorId: typeof admin._id;
            actorName: string;
            actorEmail: string;
            action:
            | "BASE_HEAD_APPROVED";
            targetUserId:
            typeof baseHead._id;
            targetBaseId:
            typeof base._id;
            description: string;
            ipAddress?: string;
            userAgent?: string;
        } = {
            actorId: admin._id,

            actorName:
                admin.name,

            actorEmail:
                admin.email,

            action:
                "BASE_HEAD_APPROVED",

            targetUserId:
                baseHead._id,

            targetBaseId:
                base._id,

            description:
                `Approved Base Head request for ${baseHead.name} and assigned base ${base.name}`,
        };

        // ------------------------------------------------------------
        // IP ADDRESS
        // ------------------------------------------------------------

        if (req.ip) {
            auditData.ipAddress =
                req.ip;
        }

        // ------------------------------------------------------------
        // USER AGENT
        // ------------------------------------------------------------

        const userAgent =
            req.headers[
            "user-agent"
            ];

        if (
            typeof userAgent ===
            "string"
        ) {
            auditData.userAgent =
                userAgent;
        }

        await AuditLog.create(
            auditData
        );

        // ------------------------------------------------------------
        // RESPONSE
        // ------------------------------------------------------------

        return res.status(200).json({
            success: true,

            message:
                "Base Head approved and base assigned successfully",

            user: {
                id:
                    baseHead._id,

                name:
                    baseHead.name,

                email:
                    baseHead.email,

                role:
                    baseHead.role,

                status:
                    baseHead.status,

                baseId:
                    baseHead.baseId,
            },

            base: {
                id:
                    base._id,

                name:
                    base.name,

                baseCode:
                    base.baseCode,

                type:
                    base.type,

                location:
                    base.location,

                address:
                    base.address,

                status:
                    base.status,

                headId:
                    base.headId,
            },
        });

    } catch (error) {
        console.error(
            "Approve Base Head Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to approve Base Head",
        });
    }
};


// ============================================================================
// REJECT BASE HEAD
// ============================================================================
// Reject karne par:
// Base Head status = REJECTED
//
// Base ko delete nahi kar rahe.
// Isse admin ke paas submitted Base information ka record rahega.
// ============================================================================

export const rejectBaseHead = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        const adminId = req.userId;

        // ------------------------------------------------------------
        // ADMIN AUTHENTICATION
        // ------------------------------------------------------------

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // ------------------------------------------------------------
        // VERIFY ADMIN
        // ------------------------------------------------------------

        const admin =
            await User.findById(adminId);

        if (
            !admin ||
            admin.role !== "ADMIN"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Admin access required",
            });
        }

        // ------------------------------------------------------------
        // VALIDATE ID
        // ------------------------------------------------------------

        if (
            typeof id !== "string" ||
            !id.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid Base Head ID",
            });
        }

        // ------------------------------------------------------------
        // FIND PENDING BASE HEAD
        // ------------------------------------------------------------

        const baseHead =
            await User.findOne({
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

        // ------------------------------------------------------------
        // FIND SUBMITTED BASE
        // ------------------------------------------------------------

        const base =
            await Base.findOne({
                createdBy:
                    baseHead._id,
            });

        // ------------------------------------------------------------
        // REJECT USER
        // ------------------------------------------------------------

        baseHead.status =
            "REJECTED";

        await baseHead.save();

        // ------------------------------------------------------------
        // AUDIT LOG
        // ------------------------------------------------------------

        const auditData: {
            actorId: typeof admin._id;
            actorName: string;
            actorEmail: string;
            action: "BASE_HEAD_REJECTED";
            targetUserId: typeof baseHead._id;
            targetBaseId?: typeof baseHead._id;
            description: string;
            ipAddress?: string;
            userAgent?: string;
        } = {
            actorId:
                admin._id,

            actorName:
                admin.name,

            actorEmail:
                admin.email,

            action:
                "BASE_HEAD_REJECTED",

            targetUserId:
                baseHead._id,

            description:
                `Rejected Base Head request for ${baseHead.name}`,
        };

        // ------------------------------------------------------------
        // BASE ID IF AVAILABLE
        // ------------------------------------------------------------

        if (base) {
            auditData.targetBaseId =
                base._id;
        }

        // ------------------------------------------------------------
        // IP
        // ------------------------------------------------------------

        if (req.ip) {
            auditData.ipAddress =
                req.ip;
        }

        // ------------------------------------------------------------
        // USER AGENT
        // ------------------------------------------------------------

        const userAgent =
            req.headers[
            "user-agent"
            ];

        if (
            typeof userAgent ===
            "string"
        ) {
            auditData.userAgent =
                userAgent;
        }

        await AuditLog.create(
            auditData
        );

        // ------------------------------------------------------------
        // RESPONSE
        // ------------------------------------------------------------

        return res.status(200).json({
            success: true,

            message:
                "Base Head request rejected",

            user: {
                id:
                    baseHead._id,

                name:
                    baseHead.name,

                email:
                    baseHead.email,

                role:
                    baseHead.role,

                status:
                    baseHead.status,

                baseId:
                    baseHead.baseId,
            },

            base: base
                ? {
                    id:
                        base._id,

                    name:
                        base.name,

                    baseCode:
                        base.baseCode,

                    type:
                        base.type,

                    location:
                        base.location,

                    status:
                        base.status,
                }
                : null,
        });

    } catch (error) {
        console.error(
            "Reject Base Head Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to reject Base Head",
        });
    }
};