"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const baseSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
const Base = mongoose_1.default.model("Base", baseSchema);
exports.default = Base;
//# sourceMappingURL=base_model.js.map