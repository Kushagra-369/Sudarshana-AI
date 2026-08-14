import React, { useState } from "react";
import {
    Shield,
    Smartphone,
    CheckCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

const AdminTOTPSetup: React.FC = () => {
    const [email, setEmail] = useState("");
    const [setupKey, setSetupKey] = useState("");

    const [qrCode, setQrCode] =
        useState<string>("");

    const [otp, setOtp] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [confirming, setConfirming] =
        useState(false);

    const [success, setSuccess] =
        useState(false);

    const [error, setError] =
        useState("");

    // =====================================================
    // GENERATE QR
    // =====================================================

    const handleGenerateQR = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setError("");
        setSuccess(false);

        if (!email.trim()) {
            setError(
                "Enter the administrator email."
            );
            return;
        }

        if (!setupKey.trim()) {
            setError(
                "Enter the setup authorization key."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${APIURL}/admin/setup-totp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        setupKey: setupKey.trim(),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Unable to generate TOTP setup."
                );
                return;
            }

            if (!data.data?.qrCode) {
                setError(
                    "QR code was not returned by the server."
                );
                return;
            }

            setQrCode(
                data.data.qrCode
            );

        } catch (error) {
            console.error(
                "TOTP setup error:",
                error
            );

            setError(
                "Unable to connect to authentication server."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CONFIRM AUTHENTICATOR
    // =====================================================

    const handleConfirm = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setError("");

        if (!/^\d{6}$/.test(otp)) {
            setError(
                "Enter the 6-digit code shown in your authenticator app."
            );
            return;
        }

        try {
            setConfirming(true);

            const response = await fetch(
                `${APIURL}/admin/confirm-totp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        otp,
                        setupKey: setupKey.trim(),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Authenticator verification failed."
                );
                return;
            }

            setSuccess(true);

        } catch (error) {
            console.error(
                "TOTP confirmation error:",
                error
            );

            setError(
                "Unable to connect to authentication server."
            );
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div style={styles.page}>

            <div style={styles.grid} />

            <div style={styles.card}>

                {/* HEADER */}

                <div style={styles.header}>

                    <div style={styles.icon}>
                        <Shield size={28} />
                    </div>

                    <div style={styles.label}>
                        ADMINISTRATOR SETUP
                    </div>

                    <h1 style={styles.title}>
                        Authenticator Setup
                    </h1>

                    <p style={styles.subtitle}>
                        Configure two-factor authentication
                        for this administrator account.
                    </p>

                </div>

                {/* ERROR */}

                {error && (
                    <div style={styles.error}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* SUCCESS */}

                {success && (
                    <div style={styles.success}>
                        <CheckCircle size={18} />

                        <div>
                            <strong>
                                Authenticator activated
                            </strong>

                            <p>
                                Your admin account is now
                                protected by two-factor
                                authentication.
                            </p>
                        </div>
                    </div>
                )}

                {!success && (
                    <>
                        {/* ACCOUNT FORM */}

                        {!qrCode && (
                            <form
                                onSubmit={
                                    handleGenerateQR
                                }
                            >

                                <label style={styles.inputLabel}>
                                    ADMIN EMAIL
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="admin@example.com"
                                    style={styles.input}
                                />

                                <label
                                    style={{
                                        ...styles.inputLabel,
                                        marginTop: "18px",
                                    }}
                                >
                                    SETUP AUTHORIZATION KEY
                                </label>

                                <input
                                    type="password"
                                    value={setupKey}
                                    onChange={(e) =>
                                        setSetupKey(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter setup key"
                                    style={styles.input}
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        ...styles.button,
                                        opacity: loading
                                            ? 0.6
                                            : 1,
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                style={
                                                    styles.spinner
                                                }
                                            />
                                            GENERATING...
                                        </>
                                    ) : (
                                        <>
                                            <Smartphone
                                                size={17}
                                            />
                                            GENERATE QR CODE
                                        </>
                                    )}
                                </button>

                            </form>
                        )}

                        {/* QR CODE */}

                        {qrCode && (
                            <>
                                <div
                                    style={
                                        styles.instruction
                                    }
                                >
                                    <Smartphone
                                        size={18}
                                    />

                                    <span>
                                        Open Google Authenticator
                                        and scan the QR code below.
                                    </span>
                                </div>

                                <div
                                    style={
                                        styles.qrWrapper
                                    }
                                >
                                    <img
                                        src={qrCode}
                                        alt="Admin TOTP QR Code"
                                        style={styles.qr}
                                    />
                                </div>

                                <p
                                    style={
                                        styles.qrDescription
                                    }
                                >
                                    After scanning, your
                                    authenticator app will
                                    generate a new 6-digit code
                                    every few seconds.
                                </p>

                                {/* CONFIRM */}

                                <form
                                    onSubmit={
                                        handleConfirm
                                    }
                                >

                                    <label
                                        style={
                                            styles.inputLabel
                                        }
                                    >
                                        AUTHENTICATOR CODE
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
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
                                        }}
                                        placeholder="000000"
                                        style={{
                                            ...styles.input,
                                            textAlign:
                                                "center",
                                            fontSize:
                                                "22px",
                                            letterSpacing:
                                                "7px",
                                            fontFamily:
                                                "monospace",
                                        }}
                                    />

                                    <button
                                        type="submit"
                                        disabled={
                                            confirming ||
                                            otp.length !== 6
                                        }
                                        style={{
                                            ...styles.button,
                                            opacity:
                                                confirming ||
                                                    otp.length !== 6
                                                    ? 0.5
                                                    : 1,
                                        }}
                                    >
                                        {confirming ? (
                                            <>
                                                <Loader2
                                                    size={17}
                                                    style={
                                                        styles.spinner
                                                    }
                                                />
                                                VERIFYING...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle
                                                    size={17}
                                                />
                                                ACTIVATE AUTHENTICATOR
                                            </>
                                        )}
                                    </button>

                                </form>
                            </>
                        )}
                    </>
                )}

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
        padding: "30px",
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
        width: "min(450px, 92vw)",
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

    icon: {
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

    label: {
        color: "#6fae72",
        fontSize: "9px",
        fontWeight: 750,
        letterSpacing: "1.5px",
        marginBottom: "10px",
    },

    title: {
        margin: 0,
        fontSize: "27px",
        fontWeight: 650,
    },

    subtitle: {
        margin: "10px auto 0",
        maxWidth: "320px",
        color: "#6e7a72",
        fontSize: "11px",
        lineHeight: 1.6,
    },

    error: {
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
    },

    success: {
        display: "flex",
        gap: "12px",
        padding: "14px",
        border:
            "1px solid rgba(111,174,114,.4)",
        background:
            "rgba(111,174,114,.07)",
        color: "#83b986",
        fontSize: "11px",
    },

    inputLabel: {
        display: "block",
        color: "#87938b",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1px",
        marginBottom: "8px",
    },

    input: {
        width: "100%",
        height: "48px",
        boxSizing: "border-box",
        border: "1px solid #2a3930",
        outline: "none",
        background: "#0e1612",
        color: "#dce2dd",
        padding: "0 14px",
        fontSize: "13px",
    },

    button: {
        width: "100%",
        height: "46px",
        marginTop: "20px",
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
        cursor: "pointer",
    },

    instruction: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        color: "#89958d",
        fontSize: "11px",
        lineHeight: 1.5,
        marginBottom: "20px",
    },

    qrWrapper: {
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        background: "#ffffff",
        width: "fit-content",
        margin: "0 auto",
    },

    qr: {
        width: "220px",
        height: "220px",
        display: "block",
    },

    qrDescription: {
        color: "#69766e",
        fontSize: "10px",
        lineHeight: 1.5,
        textAlign: "center",
        margin:
            "18px auto 24px",
        maxWidth: "310px",
    },

    spinner: {
        animation:
            "spin 1s linear infinite",
    },
};

export default AdminTOTPSetup;