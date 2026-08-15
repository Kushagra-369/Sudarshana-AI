import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IEmailOTP
  extends Document {

  userId: mongoose.Types.ObjectId;

  email: string;

  otpHash: string;

  expiresAt: Date;

  attempts: number;

  createdAt: Date;

  updatedAt: Date;
}

const emailOTPSchema =
  new Schema<IEmailOTP>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      otpHash: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      attempts: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    {
      timestamps: true, 
    }
  );

// Automatically delete expired OTP documents
emailOTPSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  }
);

const EmailOTP =
  mongoose.model<IEmailOTP>(
    "EmailOTP",
    emailOTPSchema
  );

export default EmailOTP;