import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorEmail: string;

  action:
    | "ADMIN_LOGIN"
    | "ADMIN_LOGIN_FAILED"
    | "TOTP_VERIFIED"
    | "BASE_HEAD_APPROVED"
    | "BASE_HEAD_REJECTED"
    | "BASE_HEAD_SUSPENDED"
    | "USER_SUSPENDED"
    | "USER_ACTIVATED";

  targetUserId?: mongoose.Types.ObjectId;
  targetBaseId?: mongoose.Types.ObjectId;

  description: string;

  ipAddress?: string;
  userAgent?: string;

  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actorName: {
      type: String,
      required: true,
      trim: true,
    },

    actorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    action: {
      type: String,
      enum: [
        "ADMIN_LOGIN",
        "ADMIN_LOGIN_FAILED",
        "TOTP_VERIFIED",
        "BASE_HEAD_APPROVED",
        "BASE_HEAD_REJECTED",
        "BASE_HEAD_SUSPENDED",
        "USER_SUSPENDED",
        "USER_ACTIVATED",
      ],
      required: true,
    },

    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },

    targetBaseId: {
      type: Schema.Types.ObjectId,
      ref: "Base",
      default: undefined,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    ipAddress: {
      type: String,
      default: undefined,
    },

    userAgent: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model<IAuditLog>(
  "AuditLog",
  auditLogSchema
);

export default AuditLog;