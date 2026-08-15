import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "ADMIN" | "BASE_HEAD" | "USER";

export type AccountStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type AuthProvider = "LOCAL" | "GOOGLE";

export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified: boolean;
  password?: string;
  googleId?: string;

  role: UserRole;
  status: AccountStatus;
  authProvider: AuthProvider;

  baseId?: mongoose.Types.ObjectId;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
  totpSecret?: string | null;
  totpEnabled: boolean;

}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "BASE_HEAD", "USER"],
      default: "USER",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "SUSPENDED",
      ],
      default: "APPROVED",
      required: true,
    },

    authProvider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
      required: true,
    },

    baseId: {
      type: Schema.Types.ObjectId,
      ref: "Base",
      required: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    totpSecret: {
      type: String,
      default: null,
    },

    totpEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;