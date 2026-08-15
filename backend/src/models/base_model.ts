import mongoose, {
    Document,
    Schema,
} from "mongoose";

export type BaseType =
    | "HEADQUARTERS"
    | "REGIONAL"
    | "DISTRICT"
    | "FIELD"
    | "TRAINING";

export type BaseStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED";

export interface IBase extends Document {
    name: string;
    baseCode: string;

    type: BaseType;

    location: string;
    address: string;

    contactNumber?: string;
    officialEmail?: string;

    establishedDate?: Date;

    personnelCount: number;
    personnelCapacity?: number;

    emergencyContact?: string;

    description?: string;

    headId?: mongoose.Types.ObjectId;

    status: BaseStatus;

    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
}

const baseSchema = new Schema<IBase>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        baseCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        type: {
            type: String,
            enum: [
                "HEADQUARTERS",
                "REGIONAL",
                "DISTRICT",
                "FIELD",
                "TRAINING",
            ],
            required: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        contactNumber: {
            type: String,
            trim: true,
        },

        officialEmail: {
            type: String,
            lowercase: true,
            trim: true,
        },

        establishedDate: {
            type: Date,
        },

        personnelCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        personnelCapacity: {
            type: Number,
            min: 0,
        },

        emergencyContact: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        headId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: undefined,
        },

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "INACTIVE",
                "SUSPENDED",
            ],
            default: "ACTIVE",
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Base = mongoose.model<IBase>(
    "Base",
    baseSchema
);

export default Base;