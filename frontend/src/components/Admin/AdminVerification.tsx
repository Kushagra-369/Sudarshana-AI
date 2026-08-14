import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Shield,
    LockKeyhole,
    ArrowRight,
    AlertCircle,
    Loader2,
    LogOut,
} from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

const AdminVerification: React.FC = () => {
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerify = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");

        if (!/^\d{6}$/.test(otp)) {
            setError(
                "Enter the 6-digit authentication code."
            );
            return;
        }

        const pendingAuth =
            sessionStorage.getItem("adminPendingAuth");

        if (!pendingAuth) {
            setError(
                "Admin authentication session expired. Please sign in again."
            );
            return;
        }

        try {
            const parsedAuth = JSON.parse(pendingAuth);

            // IMPORTANT:
            // Signin.tsx stores verificationToken,
            // NOT token.
            if (
                !parsedAuth.verificationToken ||
                !parsedAuth.user
            ) {
                setError(
                    "Invalid authentication session. Please sign in again."
                );
                return;
            }

            setLoading(true);

            const response = await fetch(
                `${APIURL}/admin/verify-totp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        otp,
                        verificationToken:
                            parsedAuth.verificationToken,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Invalid authentication code."
                );
                return;
            }

            // Backend must return final admin JWT
            if (!data.token) {
                setError(
                    "Authentication completed but no admin token was returned."
                );
                return;
            }

            // Remove temporary authentication
            sessionStorage.removeItem(
                "adminPendingAuth"
            );

            // Store FINAL admin token
            sessionStorage.setItem(
                "authToken",
                data.token
            );

            // Store admin user
            sessionStorage.setItem(
                "authUser",
                JSON.stringify(
                    data.user || parsedAuth.user
                )
            );

            // Admin dashboard
            navigate("/admin");

        } catch (error) {
            console.error(
                "Admin verification error:",
                error
            );

            setError(
                "Unable to connect to the authentication server."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        sessionStorage.removeItem("adminPendingAuth");
        navigate("/signin");
    };

    return (
        <div style={styles.page}>
            <div style={styles.grid} />

            <div style={styles.card}>

                {/* Header */}
                <div style={styles.header}>

                    <div style={styles.iconWrapper}>
                        <Shield size={28} />
                    </div>

                    <div style={styles.systemLabel}>
                        ADMINISTRATOR ACCESS
                    </div>

                    <h1 style={styles.title}>
                        Verify Identity
                    </h1>

                    <p style={styles.subtitle}>
                        Enter the 6-digit authentication code
                        from your authenticator app.
                    </p>

                </div>

                {/* Error */}
                {error && (
                    <div style={styles.errorBox}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleVerify}>

                    <div style={styles.inputGroup}>

                        <label style={styles.label}>
                            AUTHENTICATION CODE
                        </label>

                        <div style={styles.inputWrapper}>

                            <LockKeyhole
                                size={18}
                                style={styles.inputIcon}
                            />

                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => {
                                    const value =
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6);

                                    setOtp(value);
                                }}
                                style={styles.input}
                                autoFocus
                            />

                        </div>

                    </div>

                    <button
                        type="submit"
                        disabled={
                            loading || otp.length !== 6
                        }
                        style={{
                            ...styles.verifyButton,
                            opacity:
                                loading || otp.length !== 6
                                    ? 0.55
                                    : 1,
                            cursor:
                                loading || otp.length !== 6
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={17}
                                    style={styles.spinner}
                                />
                                VERIFYING...
                            </>
                        ) : (
                            <>
                                VERIFY ACCESS
                                <ArrowRight size={17} />
                            </>
                        )}
                    </button>

                </form>

                {/* Security message */}
                <div style={styles.securityNotice}>
                    <Shield size={12} />
                    <span>
                        Multi-factor authentication ·
                        Secure administrator access
                    </span>
                </div>

                {/* Back */}
                <button
                    type="button"
                    onClick={handleBackToLogin}
                    style={styles.backButton}
                >
                    <LogOut size={14} />
                    Back to sign in
                </button>

            </div>
        </div>
    );
};

const styles: Record<
    string,
    React.CSSProperties
> = {
    page: {
        minHeight: "100vh",
        background: "#080d0c",
        color: "#e6e8e3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },

    grid: {
        position: "absolute",
        inset: 0,
        backgroundImage:
            "linear-gradient(rgba(111,174,114,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(111,174,114,.035) 1px, transparent 1px)",
        backgroundSize: "55px 55px",
        pointerEvents: "none",
    },

    card: {
        width: "min(420px, 90vw)",
        padding: "42px",
        background: "#0c1310",
        border: "1px solid #26352d",
        boxShadow:
            "0 25px 80px rgba(0,0,0,.45)",
        position: "relative",
        zIndex: 2,
    },

    header: {
        textAlign: "center",
        marginBottom: "30px",
    },

    iconWrapper: {
        width: "58px",
        height: "58px",
        margin: "0 auto 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#14231a",
        border: "1px solid #3c5c42",
        color: "#79ae7b",
    },

    systemLabel: {
        color: "#6fae72",
        fontSize: "9px",
        fontWeight: 750,
        letterSpacing: "1.5px",
        marginBottom: "10px",
    },

    title: {
        margin: 0,
        fontSize: "28px",
        fontWeight: 650,
    },

    subtitle: {
        margin: "10px auto 0",
        maxWidth: "300px",
        color: "#6e7a72",
        fontSize: "11px",
        lineHeight: 1.6,
    },

    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 12px",
        marginBottom: "18px",
        border:
            "1px solid rgba(217,83,79,.35)",
        background:
            "rgba(217,83,79,.07)",
        color: "#d87874",
        fontSize: "10px",
        lineHeight: 1.4,
    },

    inputGroup: {
        marginBottom: "20px",
    },

    label: {
        display: "block",
        color: "#87938b",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1px",
        marginBottom: "8px",
    },

    inputWrapper: {
        height: "52px",
        display: "flex",
        alignItems: "center",
        border: "1px solid #2a3930",
        background: "#0e1612",
    },

    inputIcon: {
        marginLeft: "14px",
        color: "#59675e",
        flexShrink: 0,
    },

    input: {
        flex: 1,
        height: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        color: "#dce2dd",
        padding: "0 14px",
        fontSize: "22px",
        fontWeight: 600,
        letterSpacing: "7px",
        textAlign: "center",
        fontFamily: "monospace",
    },

    verifyButton: {
        width: "100%",
        height: "46px",
        border: "1px solid #527956",
        background: "#36583b",
        color: "#edf2ed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "10px",
        fontWeight: 750,
        letterSpacing: "1px",
    },

    securityNotice: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        marginTop: "22px",
        color: "#4f5d54",
        fontSize: "8px",
        letterSpacing: ".3px",
    },

    backButton: {
        margin: "22px auto 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        border: "none",
        background: "transparent",
        color: "#66736b",
        fontSize: "10px",
        cursor: "pointer",
    },

    spinner: {
        animation: "spin 1s linear infinite",
    },
};

export default AdminVerification;