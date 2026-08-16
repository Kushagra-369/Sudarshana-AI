import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
/*
|--------------------------------------------------------------------------
| GMAIL SMTP TRANSPORTER
|--------------------------------------------------------------------------
*/

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

/*
|--------------------------------------------------------------------------
| SEND LOGIN / REGISTRATION OTP
|--------------------------------------------------------------------------
*/

export const sendLoginOTP = async (
  email: string,
  otp: string,
  name?: string
) => {
  try {
    const senderEmail =
      process.env.SMTP_EMAIL;

    if (!senderEmail) {
      throw new Error(
        "SMTP_EMAIL is not configured"
      );
    }

    if (!process.env.SMTP_APP_PASSWORD) {
      throw new Error(
        "SMTP_APP_PASSWORD is not configured"
      );
    }

    const mailOptions = {
      from: `"Sudarshana-AI Security" <${senderEmail}>`,

      to: email,

      subject:
        "Sudarshana-AI Login Verification Code",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 520px;
          margin: auto;
          padding: 30px;
          background: #080D0C;
          color: #E6E8E3;
          border-radius: 10px;
        ">

          <h2>
            Sudarshana-AI
          </h2>

          <p>
            Hello ${name || "User"},
          </p>

          <p>
            Your verification code is:
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 20px;
            text-align: center;
            background: #121A16;
            border-radius: 8px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

          <p>
            This code will expire
            in <strong>5 minutes</strong>.
          </p>

          <p style="
            color: #8C9890;
            font-size: 13px;
          ">
            If you did not attempt to
            create an account or sign in,
            you can safely ignore this email.
          </p>

          <hr style="
            border: none;
            border-top:
            1px solid #26352D;
          " />

          <p style="
            color: #8C9890;
            font-size: 12px;
          ">
            Sudarshana-AI Security
          </p>

        </div>
      `,
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "OTP email sent successfully:",
      info.messageId
    );

    return info;

  } catch (error) {

    console.error(
      "Gmail OTP email error:",
      error
    );

    throw new Error(
      "Failed to send verification email"
    );
  }
};