import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user_model";
import Base, { BaseType } from "../models/base_model";
import { AuthRequest } from "../middleware/auth_middleware";


// ============================================================
// CREATE BASE PROFILE
// ============================================================
// Base Head login ke baad apni Base ki information submit karega.
//
// IMPORTANT:
// - Base Head hona required hai.
// - Base abhi kisi Head ko officially assign nahi hogi.
// - `createdBy` se pata chalega ki Base kis Base Head ne submit ki.
// - Admin approval ke baad `headId` aur User ka `baseId` set hoga.
// ============================================================

export const createBaseProfile = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;

        // --------------------------------------------------------
        // AUTHENTICATION
        // --------------------------------------------------------

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // --------------------------------------------------------
        // FIND USER
        // --------------------------------------------------------

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // --------------------------------------------------------
        // ROLE CHECK
        // --------------------------------------------------------

        if (user.role !== "BASE_HEAD") {
            return res.status(403).json({
                success: false,
                message:
                    "Only Base Heads can create a base profile",
            });
        }

        // --------------------------------------------------------
        // CHECK EXISTING BASE ASSIGNMENT
        // --------------------------------------------------------

        if (user.baseId) {
            return res.status(409).json({
                success: false,
                message:
                    "A base is already assigned to this account",
            });
        }

        // --------------------------------------------------------
        // REQUEST BODY
        // --------------------------------------------------------

        const {
            name,
            baseCode,
            type,
            location,
            address,
            contactNumber,
            officialEmail,
            establishedDate,
            personnelCount,
            personnelCapacity,
            emergencyContact,
            description,
        } = req.body;

        // --------------------------------------------------------
        // REQUIRED FIELDS
        // --------------------------------------------------------

        if (
            typeof name !== "string" ||
            !name.trim() ||

            typeof baseCode !== "string" ||
            !baseCode.trim() ||

            typeof type !== "string" ||

            typeof location !== "string" ||
            !location.trim() ||

            typeof address !== "string" ||
            !address.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, base code, type, location and address are required",
            });
        }

        // --------------------------------------------------------
        // VALID BASE TYPE
        // --------------------------------------------------------

        const allowedBaseTypes: BaseType[] = [
            "HEADQUARTERS",
            "REGIONAL",
            "DISTRICT",
            "FIELD",
            "TRAINING",
        ];

        if (
            typeof type !== "string" ||
            !allowedBaseTypes.includes(type as BaseType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid base type",
            });
        }

        const baseType = type as BaseType;

        // --------------------------------------------------------
        // CHECK DUPLICATE BASE CODE
        // --------------------------------------------------------

        const normalizedBaseCode =
            baseCode.trim().toUpperCase();

        const existingBase = await Base.findOne({
            baseCode: normalizedBaseCode,
        });

        if (existingBase) {
            return res.status(409).json({
                success: false,
                message: "Base code already exists",
            });
        }

        // --------------------------------------------------------
        // CHECK WHETHER THIS USER ALREADY SUBMITTED A BASE
        // --------------------------------------------------------

        const existingSubmission =
            await Base.findOne({
                createdBy: user._id,
            });

        if (existingSubmission) {
            return res.status(409).json({
                success: false,
                message:
                    "A base profile has already been submitted for this account",
            });
        }

        // --------------------------------------------------------
        // PREPARE OPTIONAL DATA
        // --------------------------------------------------------

        let parsedEstablishedDate:
            Date | undefined;

        if (establishedDate) {
            const date = new Date(
                establishedDate
            );

            if (Number.isNaN(date.getTime())) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid established date",
                });
            }

            parsedEstablishedDate = date;
        }

        // --------------------------------------------------------
        // PERSONNEL COUNT VALIDATION
        // --------------------------------------------------------

        let finalPersonnelCount = 0;

        if (
            personnelCount !== undefined
        ) {
            if (
                typeof personnelCount !== "number" ||
                personnelCount < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Personnel count must be a non-negative number",
                });
            }

            finalPersonnelCount =
                personnelCount;
        }

        // --------------------------------------------------------
        // PERSONNEL CAPACITY VALIDATION
        // --------------------------------------------------------

        if (
            personnelCapacity !== undefined
        ) {
            if (
                typeof personnelCapacity !== "number" ||
                personnelCapacity < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Personnel capacity must be a non-negative number",
                });
            }

            if (
                personnelCapacity <
                finalPersonnelCount
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Personnel capacity cannot be less than personnel count",
                });
            }
        }



        // --------------------------------------------------------
        // CREATE BASE
        // --------------------------------------------------------

        const base = await Base.create({
            name: name.trim(),

            baseCode:
                normalizedBaseCode,

            type: baseType,

            location:
                location.trim(),

            address:
                address.trim(),

            ...(typeof contactNumber === "string" &&
                contactNumber.trim()
                ? {
                    contactNumber:
                        contactNumber.trim(),
                }
                : {}),

            ...(typeof officialEmail === "string" &&
                officialEmail.trim()
                ? {
                    officialEmail:
                        officialEmail
                            .trim()
                            .toLowerCase(),
                }
                : {}),

            ...(parsedEstablishedDate
                ? {
                    establishedDate:
                        parsedEstablishedDate,
                }
                : {}),

            personnelCount:
                finalPersonnelCount,

            ...(typeof personnelCapacity ===
                "number"
                ? {
                    personnelCapacity,
                }
                : {}),

            ...(typeof emergencyContact ===
                "string" &&
                emergencyContact.trim()
                ? {
                    emergencyContact:
                        emergencyContact.trim(),
                }
                : {}),

            ...(typeof description === "string" &&
                description.trim()
                ? {
                    description:
                        description.trim(),
                }
                : {}),

            // ------------------------------------------------------
            // IMPORTANT
            // ------------------------------------------------------
            // This identifies which Base Head submitted this Base.
            // Admin approval ke baad headId assign hoga.
            // ------------------------------------------------------

            createdBy: user._id,

            // Base itself can exist as a record,
            // but Base Head is not assigned until Admin approval.
            status: "ACTIVE",
        });

        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        return res.status(201).json({
            success: true,

            message:
                "Base profile submitted successfully",

            base: {
                id: base._id,
                name: base.name,
                baseCode: base.baseCode,
                type: base.type,
                location: base.location,
                address: base.address,
                status: base.status,
            },
        });

    } catch (error) {
        console.error(
            "Create Base Profile Error:",
            error
        );

        // --------------------------------------------------------
        // DUPLICATE KEY
        // --------------------------------------------------------

        if (
            error instanceof mongoose.Error &&
            "code" in error &&
            (error as { code?: number }).code ===
            11000
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Base code already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to create base profile",
        });
    }
};


// ============================================================
// GET MY BASE
// ============================================================
// Base Head apni assigned Base ki information dekhega.
// Ye normally approval ke BAAD useful hoga.
// ============================================================

export const getMyBase = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const user = await User.findById(userId).select(
            "name email role status baseId isActive"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Only Base Head
        if (user.role !== "BASE_HEAD") {
            return res.status(403).json({
                success: false,
                message: "Only Base Heads can access this",
            });
        }

        // Suspended account
        if (user.status === "SUSPENDED") {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended",
                status: user.status,
            });
        }

        /*
        |--------------------------------------------------------------------------
        | FIND BASE
        |--------------------------------------------------------------------------
        |
        | APPROVED:
        |     Find using user.baseId
        |
        | PENDING:
        |     Base is not assigned yet, so find using createdBy
        |
        */

        let base = null;

        // APPROVED Base Head
        if (user.status === "APPROVED" && user.baseId) {
            base = await Base.findById(
                user.baseId
            ).populate(
                "headId",
                "name email"
            );
        }

        // PENDING Base Head
        if (user.status === "PENDING") {
            base = await Base.findOne({
                createdBy: user._id,
            }).populate(
                "headId",
                "name email"
            );
        }

        // No base submitted yet
        if (!base) {
            return res.status(404).json({
                success: false,
                message: "No base profile found",
                status: user.status,
            });
        }

        return res.status(200).json({
            success: true,

            status: user.status,

            base,
        });

    } catch (error) {
        console.error(
            "Get My Base Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch base information",
        });
    }
};

// ============================================================
// UPDATE MY BASE
// ============================================================
// Sirf APPROVED Base Head apni assigned Base update kar sakta hai.
// Base Code aur ownership fields yahan change nahi honge.
// ============================================================

export const updateMyBase = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;

        // --------------------------------------------------------
        // AUTHENTICATION
        // --------------------------------------------------------

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // --------------------------------------------------------
        // FIND USER
        // --------------------------------------------------------

        const user = await User.findById(
            userId
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // --------------------------------------------------------
        // ROLE CHECK
        // --------------------------------------------------------

        if (user.role !== "BASE_HEAD") {
            return res.status(403).json({
                success: false,
                message:
                    "Only Base Heads can update a base",
            });
        }

        // --------------------------------------------------------
        // APPROVAL CHECK
        // --------------------------------------------------------

        if (user.status !== "APPROVED") {
            return res.status(403).json({
                success: false,
                message:
                    "Your Base Head account has not been approved yet",
                status: user.status,
            });
        }

        // --------------------------------------------------------
        // BASE ASSIGNMENT
        // --------------------------------------------------------

        if (!user.baseId) {
            return res.status(404).json({
                success: false,
                message:
                    "No base has been assigned to this account",
            });
        }

        // --------------------------------------------------------
        // FIND BASE
        // --------------------------------------------------------

        const base = await Base.findById(
            user.baseId
        );

        if (!base) {
            return res.status(404).json({
                success: false,
                message: "Base not found",
            });
        }

        // --------------------------------------------------------
        // REQUEST BODY
        // --------------------------------------------------------

        const {
            name,
            type,
            location,
            address,
            contactNumber,
            officialEmail,
            establishedDate,
            personnelCount,
            personnelCapacity,
            emergencyContact,
            description,
        } = req.body;

        // --------------------------------------------------------
        // VALID BASE TYPE
        // --------------------------------------------------------

        if (type !== undefined) {
            const allowedBaseTypes: BaseType[] = [
                "HEADQUARTERS",
                "REGIONAL",
                "DISTRICT",
                "FIELD",
                "TRAINING",
            ];

            if (
                typeof type !== "string" ||
                !allowedBaseTypes.includes(type as BaseType)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid base type",
                });
            }

            base.type = type as BaseType;
        }

        // --------------------------------------------------------
        // NAME
        // --------------------------------------------------------

        if (
            typeof name === "string" &&
            name.trim()
        ) {
            base.name =
                name.trim();
        }

        // --------------------------------------------------------
        // LOCATION
        // --------------------------------------------------------

        if (
            typeof location === "string" &&
            location.trim()
        ) {
            base.location =
                location.trim();
        }

        // --------------------------------------------------------
        // ADDRESS
        // --------------------------------------------------------

        if (
            typeof address === "string" &&
            address.trim()
        ) {
            base.address =
                address.trim();
        }

        // --------------------------------------------------------
        // CONTACT NUMBER
        // --------------------------------------------------------

        if (
            typeof contactNumber === "string"
        ) {
            base.contactNumber =
                contactNumber.trim();
        }

        // --------------------------------------------------------
        // OFFICIAL EMAIL
        // --------------------------------------------------------

        if (
            typeof officialEmail === "string"
        ) {
            base.officialEmail =
                officialEmail
                    .trim()
                    .toLowerCase();
        }

        // --------------------------------------------------------
        // ESTABLISHED DATE
        // --------------------------------------------------------

        if (establishedDate !== undefined) {
            const date = new Date(
                establishedDate
            );

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid established date",
                });
            }

            base.establishedDate =
                date;
        }

        // --------------------------------------------------------
        // PERSONNEL COUNT
        // --------------------------------------------------------

        if (
            personnelCount !== undefined
        ) {
            if (
                typeof personnelCount !==
                "number" ||
                personnelCount < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Personnel count must be a non-negative number",
                });
            }

            base.personnelCount =
                personnelCount;
        }

        // --------------------------------------------------------
        // PERSONNEL CAPACITY
        // --------------------------------------------------------

        if (
            personnelCapacity !==
            undefined
        ) {
            if (
                typeof personnelCapacity !==
                "number" ||
                personnelCapacity < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Personnel capacity must be a non-negative number",
                });
            }

            if (
                personnelCapacity <
                base.personnelCount
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Personnel capacity cannot be less than personnel count",
                });
            }

            base.personnelCapacity =
                personnelCapacity;
        }

        // --------------------------------------------------------
        // EMERGENCY CONTACT
        // --------------------------------------------------------

        if (
            typeof emergencyContact ===
            "string"
        ) {
            base.emergencyContact =
                emergencyContact.trim();
        }

        // --------------------------------------------------------
        // DESCRIPTION
        // --------------------------------------------------------

        if (
            typeof description === "string"
        ) {
            base.description =
                description.trim();
        }

        // --------------------------------------------------------
        // SAVE
        // --------------------------------------------------------

        await base.save();

        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        return res.status(200).json({
            success: true,

            message:
                "Base updated successfully",

            base,
        });

    } catch (error) {
        console.error(
            "Update My Base Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update base",
        });
    }
};