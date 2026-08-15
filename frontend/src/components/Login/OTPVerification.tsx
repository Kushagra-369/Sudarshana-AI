import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { APIURL } from "../../GlobalAPIURL";

interface LocationState {
    email?: string;
    role?: "ADMIN" | "BASE_HEAD" | "USER";
}

interface VerifyResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role: "ADMIN" | "BASE_HEAD" | "USER";
        status:
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "SUSPENDED";
        baseId?: string;
    };
}

const OTPVerification: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const state =
        (location.state as LocationState | null) ||
        null;

    const email =
        state?.email ||
        sessionStorage.getItem(
            "pendingOTPEmail"
        );

    const role =
        state?.role ||
        sessionStorage.getItem(
            "pendingOTPRole"
        ) as
        | "ADMIN"
        | "BASE_HEAD"
        | "USER"
        | null;

    const [otp, setOtp] =
        useState("");

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [resending, setResending] =
        useState(false);

    const [countdown, setCountdown] =
        useState(60);

    /*
    |--------------------------------------------------------------------------
    | COUNTDOWN
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (countdown <= 0) {
            return;
        }

        const timer =
            setInterval(() => {
                setCountdown(
                    (previous) =>
                        previous - 1
                );
            }, 1000);

        return () =>
            clearInterval(timer);

    }, [countdown]);

    /*
    |--------------------------------------------------------------------------
    | PROTECT PAGE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!email) {
            navigate("/signin", {
                replace: true,
            });
        }

    }, [email, navigate]);

    /*
    |--------------------------------------------------------------------------
    | VERIFY OTP
    |--------------------------------------------------------------------------
    */

    const handleVerifyOTP = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!email) {
            setError(
                "Authentication session expired. Please sign in again."
            );
            return;
        }

        if (otp.length !== 6) {
            setError(
                "Please enter the 6-digit verification code."
            );
            return;
        }

        try {

            setLoading(true);

            const response =
                await fetch(
                    `${APIURL}/verify-email-otp`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            email,
                            otp,
                        }),
                    }
                );

            const data: VerifyResponse =
                await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Invalid verification code."
                );
                return;
            }

            if (!data.success || !data.user) {
                setError(
                    data.message ||
                    "Invalid authentication response."
                );
                return;
            }


            /*
            |--------------------------------------------------------------------------
            | CLEAN PENDING OTP DATA
            |--------------------------------------------------------------------------
            */

            sessionStorage.removeItem(
                "pendingOTPEmail"
            );

            sessionStorage.removeItem(
                "pendingOTPRole"
            );

            /*
            |--------------------------------------------------------------------------
            | ROLE BASED ROUTING
            |--------------------------------------------------------------------------
            */

            if (data.user.role === "ADMIN") {

                sessionStorage.setItem(
                    "adminPendingAuth",
                    JSON.stringify({
                        user: data.user,
                    })
                );

                navigate(
                    "/admin-verification",
                    {
                        replace: true,
                    }
                );

                return;
            }

            if (!data.token) {
                setError(
                    "Authentication token was not returned."
                );
                return;
            }

            sessionStorage.setItem(
                "authToken",
                data.token
            );

            sessionStorage.setItem(
                "authUser",
                JSON.stringify(data.user)
            );

            /*
            |--------------------------------------------------------------------------
            | BASE HEAD
            |--------------------------------------------------------------------------
            */

            if (
                data.user.role ===
                "BASE_HEAD"
            ) {

                if (
                    data.user.status ===
                    "PENDING"
                ) {

                    sessionStorage.setItem(
                        "pendingLoginUser",
                        JSON.stringify({
                            user: data.user,
                            token:
                                data.token,
                            role:
                                data.user.role,
                            email:
                                data.user.email,
                        })
                    );

                    navigate(
                        "/waiting-for-approval",
                        {
                            replace: true,
                        }
                    );

                    return;
                }

                if (
                    data.user.status ===
                    "APPROVED"
                ) {

                    navigate(
                        "/command",
                        {
                            replace: true,
                        }
                    );

                    return;
                }

                setError(
                    "Your Base Head account is not approved."
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | NORMAL USER
            |--------------------------------------------------------------------------
            */

            if (
                data.user.role ===
                "USER"
            ) {

                navigate(
                    "/user",
                    {
                        replace: true,
                    }
                );

                return;
            }

            setError(
                "Unsupported account role."
            );

        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );

            setError(
                "Unable to connect to authentication server."
            );

        } finally {

            setLoading(false);

        }
    };

    /*
    |--------------------------------------------------------------------------
    | RESEND OTP
    |--------------------------------------------------------------------------
    */

    const handleResendOTP = async () => {

        if (!email) {
            setError(
                "Authentication session expired. Please sign in again."
            );
            return;
        }

        if (countdown > 0) {
            return;
        }

        try {

            setError("");
            setSuccess("");
            setResending(true);

            const response =
                await fetch(
                    `${APIURL}/resend-email-otp`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            email,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Failed to resend OTP."
                );
                return;
            }

            setSuccess(
                "A new verification code has been sent to your email."
            );

            setOtp("");

            setCountdown(60);

        } catch (error) {

            console.error(
                "Resend OTP error:",
                error
            );

            setError(
                "Unable to resend verification code."
            );

        } finally {

            setResending(false);

        }
    };

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <div
            style={{
                minHeight:
                    "100vh",
                background:
                    "#080D0C",
                color:
                    "#E6E8E3",
                display:
                    "flex",
                alignItems:
                    "center",
                justifyContent:
                    "center",
                padding:
                    "20px",
                fontFamily:
                    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >

            <div
                style={{
                    width:
                        "100%",
                    maxWidth:
                        "420px",
                    background:
                        "#121A16",
                    border:
                        "1px solid #26352D",
                    borderRadius:
                        "10px",
                    padding:
                        "32px",
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        textAlign:
                            "center",
                        marginBottom:
                            "28px",
                    }}
                >

                    <div
                        style={{
                            width:
                                "46px",
                            height:
                                "46px",
                            margin:
                                "0 auto 16px",
                            borderRadius:
                                "8px",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            background:
                                "linear-gradient(135deg, #1A3A2A, #6FAF72)",
                            fontWeight:
                                700,
                            fontSize:
                                "16px",
                        }}
                    >
                        SA
                    </div>

                    <h2
                        style={{
                            margin:
                                "0 0 8px",
                            fontSize:
                                "21px",
                        }}
                    >
                        Verify Your Email
                    </h2>

                    <p
                        style={{
                            margin:
                                0,
                            color:
                                "#8C9890",
                            fontSize:
                                "13px",
                            lineHeight:
                                1.5,
                        }}
                    >
                        We've sent a 6-digit
                        verification code to
                    </p>

                    <p
                        style={{
                            margin:
                                "6px 0 0",
                            fontSize:
                                "13px",
                            fontWeight:
                                600,
                            wordBreak:
                                "break-all",
                        }}
                    >
                        {email || "your email"}
                    </p>

                </div>

                {/* ERROR */}

                {error && (
                    <div
                        style={{
                            marginBottom:
                                "16px",
                            padding:
                                "11px 12px",
                            borderRadius:
                                "6px",
                            background:
                                "rgba(217, 83, 79, 0.1)",
                            border:
                                "1px solid rgba(217, 83, 79, 0.35)",
                            color:
                                "#D9534F",
                            fontSize:
                                "13px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* SUCCESS */}

                {success && (
                    <div
                        style={{
                            marginBottom:
                                "16px",
                            padding:
                                "11px 12px",
                            borderRadius:
                                "6px",
                            background:
                                "rgba(111, 175, 114, 0.1)",
                            border:
                                "1px solid rgba(111, 175, 114, 0.35)",
                            color:
                                "#6FAF72",
                            fontSize:
                                "13px",
                        }}
                    >
                        {success}
                    </div>
                )}

                {/* FORM */}

                <form
                    onSubmit={
                        handleVerifyOTP
                    }
                >

                    <label
                        style={{
                            display:
                                "block",
                            fontSize:
                                "12px",
                            color:
                                "#8C9890",
                            marginBottom:
                                "8px",
                        }}
                    >
                        Authentication Code
                    </label>

                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {

                            const value =
                                e.target.value
                                    .replace(
                                        /\D/g,
                                        ""
                                    )
                                    .slice(
                                        0,
                                        6
                                    );

                            setOtp(value);
                            setError("");
                        }}
                        placeholder="000000"
                        style={{
                            width:
                                "100%",
                            boxSizing:
                                "border-box",
                            background:
                                "#080D0C",
                            border:
                                "1px solid #26352D",
                            borderRadius:
                                "6px",
                            padding:
                                "14px",
                            color:
                                "#E6E8E3",
                            fontSize:
                                "24px",
                            letterSpacing:
                                "8px",
                            textAlign:
                                "center",
                            outline:
                                "none",
                        }}
                    />

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            otp.length !== 6
                        }
                        style={{
                            width:
                                "100%",
                            marginTop:
                                "16px",
                            padding:
                                "13px",
                            border:
                                "none",
                            borderRadius:
                                "6px",
                            background:
                                loading ||
                                    otp.length !== 6
                                    ? "#26352D"
                                    : "#6FAF72",
                            color:
                                "#080D0C",
                            fontWeight:
                                700,
                            cursor:
                                loading ||
                                    otp.length !== 6
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify Code"}
                    </button>

                </form>

                {/* RESEND */}

                <div
                    style={{
                        textAlign:
                            "center",
                        marginTop:
                            "20px",
                        fontSize:
                            "13px",
                        color:
                            "#8C9890",
                    }}
                >

                    Didn't receive the code?

                    <button
                        type="button"
                        onClick={
                            handleResendOTP
                        }
                        disabled={
                            countdown > 0 ||
                            resending
                        }
                        style={{
                            marginLeft:
                                "5px",
                            background:
                                "transparent",
                            border:
                                "none",
                            color:
                                countdown > 0
                                    ? "#8C9890"
                                    : "#6FAF72",
                            cursor:
                                countdown > 0 ||
                                    resending
                                    ? "not-allowed"
                                    : "pointer",
                            fontWeight:
                                600,
                        }}
                    >
                        {resending
                            ? "Sending..."
                            : countdown > 0
                                ? `Resend in ${countdown}s`
                                : "Resend OTP"}
                    </button>

                </div>

                {/* BACK */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/signin",
                            {
                                replace: true,
                            }
                        )
                    }
                    style={{
                        width:
                            "100%",
                        marginTop:
                            "18px",
                        padding:
                            "10px",
                        background:
                            "transparent",
                        border:
                            "1px solid #26352D",
                        borderRadius:
                            "6px",
                        color:
                            "#8C9890",
                        cursor:
                            "pointer",
                    }}
                >
                    Back to Sign In
                </button>

            </div>

        </div>
    );
};

export default OTPVerification;