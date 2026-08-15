import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Shield,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    Loader2,
    User,
    Building2,
    KeyRound,
} from "lucide-react";

import { APIURL } from "../../GlobalAPIURL";

type SignupRole =
    | "USER"
    | "BASE_HEAD";

const Signup: React.FC = () => {

    const navigate = useNavigate();

    // =====================================================
    // ROLE
    // =====================================================

    const [selectedRole, setSelectedRole] =
        useState<SignupRole>("USER");

    // =====================================================
    // FORM
    // =====================================================

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    // =====================================================
    // UI
    // =====================================================

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    // =====================================================
    // ROLE NAME
    // =====================================================

    const roleName = {
        USER: "User",
        BASE_HEAD: "Base Head",
    }[selectedRole];
    // =====================================================
    // ROLE CHANGE
    // =====================================================

    const handleRoleChange = (
        role: SignupRole
    ) => {

        setSelectedRole(role);
        setError("");
    };

    // =====================================================
    // REGISTER
    // =====================================================

    const handleRegister = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        setError("");

        // =================================================
        // VALIDATION
        // =================================================

        if (!name.trim()) {

            setError(
                "Please enter your full name."
            );

            return;
        }

        if (!email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }

        if (!password) {

            setError(
                "Please enter your password."
            );

            return;
        }

        if (password.length < 6) {

            setError(
                "Password must be at least 6 characters."
            );

            return;
        }

        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }

        try {

            setLoading(true);

            // =================================================
            // REGISTER API
            // =================================================

            const response = await fetch(
                `${APIURL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password,
                        role: selectedRole,
                    }),
                }
            );

            const data =
                await response.json();

            console.log(
                "REGISTER STATUS:",
                response.status
            );

            console.log(
                "REGISTER RESPONSE:",
                data
            );

            // =================================================
            // BACKEND ERROR
            // =================================================

            if (!response.ok) {

                setError(
                    data.message ||
                    "Unable to create account."
                );

                return;
            }

            // =================================================
            // OTP REQUIRED
            // =================================================

            if (
                data.requiresEmailOTP
            ) {

                /*
                 * Store temporary registration
                 * information.
                 *
                 * No JWT is stored here.
                 *
                 * User becomes authenticated
                 * only after OTP verification.
                 */

                sessionStorage.setItem(
                    "pendingOTPEmail",
                    data.email || email.trim()
                );

                sessionStorage.setItem(
                    "pendingOTPRole",
                    data.role || selectedRole
                );

                sessionStorage.setItem(
                    "pendingOTPUserId",
                    data.userId
                );

                // =================================================
                // GO TO OTP VERIFICATION
                // =================================================

                navigate(
                    "/email-otp",
                    {
                        replace: true,

                        state: {
                            email:
                                data.email ||
                                email.trim(),

                            role:
                                data.role ||
                                selectedRole,

                            userId:
                                data.userId,
                        },
                    }
                );

                return;
            }

            // =================================================
            // FALLBACK
            // =================================================

            setError(
                "Account created, but OTP verification was not initiated."
            );

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            setError(
                "Unable to connect to the server. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // ROLE ICON
    // =====================================================

    const RoleIcon = () => {

        if (selectedRole === "USER") {

            return <User size={16} />;
        }

        if (
            selectedRole === "BASE_HEAD"
        ) {

            return <Building2 size={16} />;
        }

        return <KeyRound size={16} />;
    };

    // =====================================================
    // UI
    // =====================================================

    return (

        <div style={styles.page}>

            {/* BACKGROUND */}

            <div style={styles.grid} />

            <div style={styles.glowOne} />

            <div style={styles.glowTwo} />

            {/* =================================================
                MAIN CONTAINER
            ================================================= */}

            <div style={styles.container}>

                {/* =================================================
                    LEFT PANEL
                ================================================= */}

                <div style={styles.leftPanel}>

                    {/* BRAND */}

                    <div style={styles.brand}>

                        <div style={styles.logo}>

                            <Shield size={24} />

                        </div>

                        <div>

                            <div style={styles.brandName}>

                                SUDARSHANA

                                <span
                                    style={
                                        styles.brandAccent
                                    }
                                >
                                    -AI
                                </span>

                            </div>

                            <div
                                style={
                                    styles.brandSub
                                }
                            >
                                DEFENCE INTELLIGENCE SYSTEM
                            </div>

                        </div>

                    </div>

                    {/* MAIN TEXT */}

                    <div
                        style={
                            styles.leftContent
                        }
                    >

                        <div
                            style={
                                styles.systemLabel
                            }
                        >

                            <span
                                style={
                                    styles.greenDot
                                }
                            />

                            CREATE SECURE IDENTITY

                        </div>

                        <h1
                            style={
                                styles.heading
                            }
                        >

                            Join.

                            <br />

                            Secure.

                            <br />

                            <span>
                                Defend.
                            </span>

                        </h1>

                        <p
                            style={
                                styles.description
                            }
                        >
                            Create your secure
                            Sudarshana-AI account.
                            Your email will be
                            verified using a
                            one-time verification
                            code.
                        </p>

                    </div>

                    {/* SYSTEM INFO */}

                    <div
                        style={
                            styles.systemInfo
                        }
                    >

                        <div
                            style={
                                styles.infoItem
                            }
                        >

                            <span>
                                SYSTEM
                            </span>

                            <strong>
                                OPERATIONAL
                            </strong>

                        </div>

                        <div
                            style={
                                styles.infoItem
                            }
                        >

                            <span>
                                VERIFICATION
                            </span>

                            <strong>
                                EMAIL OTP
                            </strong>

                        </div>

                        <div
                            style={
                                styles.infoItem
                            }
                        >

                            <span>
                                SECURITY
                            </span>

                            <strong>
                                ENABLED
                            </strong>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    RIGHT PANEL
                ================================================= */}

                <div
                    style={
                        styles.formPanel
                    }
                >

                    <div
                        style={
                            styles.formContainer
                        }
                    >

                        {/* =================================================
                            ROLE SELECTOR
                        ================================================= */}

                        <div
                            style={
                                styles.roleSelector
                            }
                        >

                            {/* USER */}

                            <button
                                type="button"
                                onClick={() =>
                                    handleRoleChange(
                                        "USER"
                                    )
                                }
                                style={{
                                    ...styles.roleButton,
                                    ...(selectedRole ===
                                        "USER"
                                        ? styles.roleButtonActive
                                        : {}),
                                }}
                            >

                                <User size={14} />

                                USER

                            </button>

                            {/* BASE HEAD */}

                            <button
                                type="button"
                                onClick={() =>
                                    handleRoleChange(
                                        "BASE_HEAD"
                                    )
                                }
                                style={{
                                    ...styles.roleButton,
                                    ...(selectedRole ===
                                        "BASE_HEAD"
                                        ? styles.roleButtonActive
                                        : {}),
                                }}
                            >

                                <Building2 size={14} />

                                BASE HEAD

                            </button>



                        </div>

                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div
                            style={
                                styles.formHeader
                            }
                        >

                            <div
                                style={
                                    styles.accessBadge
                                }
                            >

                                <RoleIcon />

                                {roleName.toUpperCase()}

                            </div>

                            <h2
                                style={
                                    styles.formTitle
                                }
                            >
                                Create Account
                            </h2>

                            <p
                                style={
                                    styles.formSubtitle
                                }
                            >
                                Create a secure{" "}
                                {roleName.toLowerCase()}{" "}
                                account.
                            </p>

                        </div>

                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (

                            <div
                                style={
                                    styles.errorBox
                                }
                            >

                                <AlertCircle
                                    size={15}
                                />

                                <span>
                                    {error}
                                </span>

                            </div>

                        )}

                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form
                            onSubmit={
                                handleRegister
                            }
                        >

                            {/* =================================================
                                NAME
                            ================================================= */}

                            <div
                                style={
                                    styles.inputGroup
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    FULL NAME
                                </label>

                                <div
                                    style={
                                        styles.inputWrapper
                                    }
                                >

                                    <User
                                        size={17}
                                        style={
                                            styles.inputIcon
                                        }
                                    />

                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        autoComplete="name"
                                        style={
                                            styles.input
                                        }
                                    />

                                </div>

                            </div>

                            {/* =================================================
                                EMAIL
                            ================================================= */}

                            <div
                                style={
                                    styles.inputGroup
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    EMAIL ADDRESS
                                </label>

                                <div
                                    style={
                                        styles.inputWrapper
                                    }
                                >

                                    <Mail
                                        size={17}
                                        style={
                                            styles.inputIcon
                                        }
                                    />

                                    <input
                                        type="email"
                                        placeholder="operator@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        autoComplete="email"
                                        style={
                                            styles.input
                                        }
                                    />

                                </div>

                            </div>

                            {/* =================================================
                                PASSWORD
                            ================================================= */}

                            <div
                                style={
                                    styles.inputGroup
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    PASSWORD
                                </label>

                                <div
                                    style={
                                        styles.inputWrapper
                                    }
                                >

                                    <Lock
                                        size={17}
                                        style={
                                            styles.inputIcon
                                        }
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Create your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                        autoComplete="new-password"
                                        style={
                                            styles.input
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        style={
                                            styles.eyeButton
                                        }
                                    >

                                        {showPassword ? (
                                            <EyeOff
                                                size={17}
                                            />
                                        ) : (
                                            <Eye
                                                size={17}
                                            />
                                        )}

                                    </button>

                                </div>

                            </div>

                            {/* =================================================
                                CONFIRM PASSWORD
                            ================================================= */}

                            <div
                                style={
                                    styles.inputGroup
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    CONFIRM PASSWORD
                                </label>

                                <div
                                    style={
                                        styles.inputWrapper
                                    }
                                >

                                    <Lock
                                        size={17}
                                        style={
                                            styles.inputIcon
                                        }
                                    />

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Confirm your password"
                                        value={
                                            confirmPassword
                                        }
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        autoComplete="new-password"
                                        style={
                                            styles.input
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        style={
                                            styles.eyeButton
                                        }
                                    >

                                        {showConfirmPassword ? (
                                            <EyeOff
                                                size={17}
                                            />
                                        ) : (
                                            <Eye
                                                size={17}
                                            />
                                        )}

                                    </button>

                                </div>

                            </div>

                            {/* =================================================
                                REGISTER BUTTON
                            ================================================= */}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.submitButton,
                                    opacity: loading
                                        ? 0.65
                                        : 1,
                                    cursor: loading
                                        ? "not-allowed"
                                        : "pointer",
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

                                        CREATING ACCOUNT...

                                    </>

                                ) : (

                                    <>
                                        CREATE ACCOUNT

                                        <ArrowRight
                                            size={17}
                                        />
                                    </>

                                )}

                            </button>

                        </form>

                        {/* =================================================
                            LOGIN LINK
                        ================================================= */}

                        <div
                            style={
                                styles.loginLink
                            }
                        >

                            <span>
                                Already have an account?
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/signin"
                                    )
                                }
                                style={
                                    styles.loginButton
                                }
                            >
                                SIGN IN
                            </button>

                        </div>

                        {/* =================================================
                            SECURITY
                        ================================================= */}

                        <div
                            style={
                                styles.securityNotice
                            }
                        >

                            <Shield size={12} />

                            <span>
                                Secure authentication ·
                                Email verification required
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

/* =========================================================
   STYLES
========================================================= */

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

    glowOne: {
        position: "absolute",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(72,120,78,.09), transparent 70%)",
        left: "-180px",
        top: "-180px",
        pointerEvents: "none",
    },

    glowTwo: {
        position: "absolute",
        width: "450px",
        height: "450px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(72,120,78,.06), transparent 70%)",
        right: "-180px",
        bottom: "-180px",
        pointerEvents: "none",
    },

    container: {
        width: "min(1080px, 94vw)",
        minHeight: "700px",
        display: "grid",
        gridTemplateColumns: "1.05fr .95fr",
        border: "1px solid #26352d",
        background: "#0c1310",
        position: "relative",
        zIndex: 2,
        boxShadow:
            "0 25px 80px rgba(0,0,0,.45)",
    },

    leftPanel: {
        padding: "42px",
        borderRight:
            "1px solid #26352d",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
            "linear-gradient(145deg, rgba(20,34,27,.8), rgba(8,13,12,.95))",
    },

    brand: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },

    logo: {
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#14231a",
        border: "1px solid #3c5c42",
        color: "#79ae7b",
    },

    brandName: {
        fontSize: "17px",
        fontWeight: 750,
        letterSpacing: ".7px",
    },

    brandAccent: {
        color: "#b8945c",
    },

    brandSub: {
        fontSize: "8px",
        color: "#65736a",
        letterSpacing: "1.5px",
        marginTop: "4px",
    },

    leftContent: {
        maxWidth: "420px",
    },

    systemLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#6fae72",
        fontSize: "9px",
        fontWeight: 750,
        letterSpacing: "1.4px",
        marginBottom: "20px",
    },

    greenDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#6fae72",
        boxShadow:
            "0 0 9px rgba(111,174,114,.5)",
    },

    heading: {
        margin: 0,
        fontSize: "43px",
        lineHeight: 1.08,
        fontWeight: 650,
        letterSpacing: "-1.5px",
    },

    description: {
        marginTop: "22px",
        color: "#7e8b83",
        fontSize: "13px",
        lineHeight: 1.7,
        maxWidth: "360px",
    },

    systemInfo: {
        display: "flex",
        gap: "28px",
        paddingTop: "22px",
        borderTop:
            "1px solid #26352d",
    },

    infoItem: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },

    formPanel: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b110e",
    },

    formContainer: {
        width: "min(360px, 82%)",
    },

    roleSelector: {
        display: "grid",
        gridTemplateColumns:
            "1fr 1fr",
        gap: "5px",
        marginBottom: "27px",
        padding: "4px",
        background: "#080d0b",
        border: "1px solid #26352d",
    },

    roleButton: {
        height: "36px",
        border: "1px solid transparent",
        background: "transparent",
        color: "#66736b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        fontSize: "8px",
        fontWeight: 750,
        letterSpacing: ".6px",
        cursor: "pointer",
    },

    roleButtonActive: {
        background: "#1b3020",
        border:
            "1px solid #3d6042",
        color: "#7db17f",
    },

    formHeader: {
        marginBottom: "27px",
    },

    accessBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 8px",
        border:
            "1px solid #35513a",
        background:
            "rgba(111,174,114,.06)",
        color: "#75a878",
        fontSize: "8px",
        fontWeight: 750,
        letterSpacing: "1.2px",
        marginBottom: "13px",
    },

    formTitle: {
        margin: 0,
        fontSize: "28px",
        fontWeight: 650,
    },

    formSubtitle: {
        margin: "7px 0 0",
        color: "#6e7a72",
        fontSize: "11px",
        lineHeight: 1.5,
    },

    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 12px",
        marginBottom: "16px",
        border:
            "1px solid rgba(217,83,79,.35)",
        background:
            "rgba(217,83,79,.07)",
        color: "#d87874",
        fontSize: "10px",
        lineHeight: 1.4,
    },

    inputGroup: {
        marginBottom: "17px",
    },

    label: {
        display: "block",
        color: "#87938b",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1px",
        marginBottom: "7px",
    },

    inputWrapper: {
        height: "43px",
        display: "flex",
        alignItems: "center",
        border:
            "1px solid #2a3930",
        background: "#0e1612",
    },

    inputIcon: {
        marginLeft: "12px",
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
        padding: "0 11px",
        fontSize: "12px",
        fontFamily: "inherit",
    },

    eyeButton: {
        border: "none",
        background: "transparent",
        color: "#68756d",
        cursor: "pointer",
        padding: "10px",
    },

    submitButton: {
        width: "100%",
        height: "44px",
        marginTop: "5px",
        border:
            "1px solid #527956",
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

    loginLink: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        marginTop: "20px",
        color: "#68756d",
        fontSize: "9px",
    },

    loginButton: {
        border: "none",
        background: "none",
        color: "#6fae72",
        fontSize: "9px",
        fontWeight: 750,
        cursor: "pointer",
        padding: 0,
    },

    securityNotice: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        marginTop: "18px",
        color: "#4f5d54",
        fontSize: "8px",
        letterSpacing: ".3px",
    },

    spinner: {
        animation:
            "spin 1s linear infinite",
    },
};

export default Signup;