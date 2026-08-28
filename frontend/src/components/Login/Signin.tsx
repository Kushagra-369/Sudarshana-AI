import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { APIURL } from "../../GlobalAPIURL";
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

declare global {
    interface Window {
        AndroidGoogleAuth?: {
            startGoogleSignIn: () => void;
        };

        onNativeGoogleSuccess?: (token: string) => void;
        onNativeGoogleError?: (message: string) => void;
    }
}

type LoginRole = "USER" | "BASE_HEAD" | "ADMIN";


const Signin: React.FC = () => {
    const navigate = useNavigate();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsSmallMobile(window.innerWidth <= 480);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // =====================================================
    // ROLE
    // =====================================================

    const [selectedRole, setSelectedRole] =
        useState<LoginRole>("USER");

    // =====================================================
    // FORM
    // =====================================================

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isRegisterMode, setIsRegisterMode] =
        useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [, setGoogleLoading] = useState(false);

    const [error, setError] = useState("");

    // =====================================================
    // ROLE NAME
    // =====================================================

    const roleName = {
        USER: "User",
        BASE_HEAD: "Base Head",
        ADMIN: "Administrator",
    }[selectedRole];

    // =====================================================
    // ROLE CHANGE
    // =====================================================

    const handleRoleChange = (role: LoginRole) => {
        setSelectedRole(role);
        setError("");
    };

    const handleModeChange = (
        register: boolean
    ) => {
        setIsRegisterMode(register);
        setError("");

        setName("");
        setEmail("");
        setPassword("");

        // ADMIN cannot register
        if (
            register &&
            selectedRole === "ADMIN"
        ) {
            setSelectedRole("USER");
        }
    };

    // =====================================================
    // EMAIL + PASSWORD LOGIN
    // =====================================================

    const handleEmailLogin = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");

        // =================================================
        // BASIC VALIDATION
        // =================================================

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        try {
            setLoading(true);

            // =================================================
            // ADMIN LOGIN
            // IMPORTANT:
            // ADMIN DOES NOT USE /login
            // =================================================

            if (selectedRole === "ADMIN") {
                const adminResponse = await fetch(
                    `${APIURL}/admin/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            email: email.trim(),
                            password,
                        }),
                    }
                );

                const adminData =
                    await adminResponse.json();

                // -------------------------------
                // ADMIN BACKEND ERROR
                // -------------------------------

                if (!adminResponse.ok) {
                    setError(
                        adminData.message ||
                        "Admin authentication failed."
                    );

                    return;
                }

                // -------------------------------
                // INVALID RESPONSE
                // -------------------------------

                if (
                    !adminData.user ||
                    !adminData.verificationToken
                ) {
                    setError(
                        "Invalid admin authentication response."
                    );

                    return;
                }

                // -------------------------------
                // STORE TEMPORARY ADMIN SESSION
                // -------------------------------

                localStorage.setItem(
                    "adminPendingAuth",
                    JSON.stringify({
                        user: adminData.user,
                        verificationToken:
                            adminData.verificationToken,
                    })
                );

                // IMPORTANT:
                // Do NOT save authToken here.
                // Final admin token comes after TOTP.

                navigate("/admin-verification");

                return;
            }

            // =================================================
            // NORMAL LOGIN
            // USER + BASE HEAD
            // =================================================

            const response = await fetch(
                `${APIURL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                        role: selectedRole,
                    }),
                }
            );

            const data = await response.json();

            // =================================================
            // BACKEND ERROR
            // =================================================

            if (!response.ok) {
                setError(
                    data.message ||
                    "Unable to sign in. Please check your credentials."
                );

                return;
            }


            // =================================================
            // SERVER RESPONSE VALIDATION
            // =================================================

            if (!data.user) {
                setError(
                    "Invalid server response."
                );

                return;
            }

            // =================================================
            // ROLE VALIDATION
            // =================================================

            const actualRole = data.user.role;
            const accountStatus = data.user.status;

            // =================================================
            // USER LOGIN
            // =================================================

            if (selectedRole === "USER") {

                if (actualRole === "USER") {
                    // normal user
                }

                else if (
                    actualRole === "BASE_HEAD" &&
                    accountStatus !== "APPROVED"
                ) {
                    // Base Head is allowed to continue as User
                }

                else if (
                    actualRole === "BASE_HEAD" &&
                    accountStatus === "APPROVED"
                ) {
                    setError(
                        "Your Base Head account is approved. Please sign in as Base Head."
                    );
                    return;
                }

                else {
                    setError(
                        "This account cannot be accessed as User."
                    );
                    return;
                }
            }

            // =================================================
            // BASE HEAD LOGIN
            // =================================================

            if (selectedRole === "BASE_HEAD") {

                if (actualRole !== "BASE_HEAD") {
                    setError(
                        "This account is not registered as a Base Head."
                    );
                    return;
                }
            }

            // =================================================
            // USER LOGIN
            // =================================================

            if (
                selectedRole === "USER" &&
                (
                    data.user.role === "USER" ||
                    (
                        data.user.role === "BASE_HEAD" &&
                        data.user.status !== "APPROVED"
                    )
                )
            ) {

                const userSession = {
                    ...data.user,

                    // If Base Head is temporarily using USER access,
                    // frontend treats this session as USER.
                    accessRole: "USER",
                };

                localStorage.setItem(
                    "authUser",
                    JSON.stringify(data.user)
                );

                if (data.token) {
                    localStorage.setItem(
                        "authToken",
                        data.token
                    );
                }

                navigate("/user");

                return;
            }




            if (data.user.role === "BASE_HEAD") {

                // Save authenticated user
                localStorage.setItem("authUser", JSON.stringify(data.user));
                // Save JWT
                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                }

                // ---------------------------------------------
                // REJECTED
                // ---------------------------------------------

                if (data.user.status === "REJECTED") {
                    setError(
                        "Your Base Head application was rejected by the administrator."
                    );
                    return;
                }

                // ---------------------------------------------
                // SUSPENDED
                // ---------------------------------------------

                if (data.user.status === "SUSPENDED") {
                    setError(
                        "Your Base Head account has been suspended."
                    );
                    return;
                }

                // ---------------------------------------------
                // APPROVED
                // ---------------------------------------------

                if (
                    data.user.status === "APPROVED" &&
                    data.user.baseId
                ) {
                    navigate("/command");
                    return;
                }

                // ---------------------------------------------
                // PENDING
                // ---------------------------------------------

                if (data.user.status === "PENDING") {

                    try {

                        const baseResponse = await fetch(
                            `${APIURL}/base/me`,
                            {
                                method: "GET",

                                headers: {
                                    Authorization:
                                        `Bearer ${data.token}`,
                                    "Content-Type":
                                        "application/json",
                                },
                            }
                        );

                        const baseData =
                            await baseResponse.json();

                        console.log(
                            "BASE PROFILE CHECK:",
                            baseResponse.status,
                            baseData
                        );

                        // -----------------------------------------
                        // BASE ALREADY SUBMITTED
                        // -----------------------------------------

                        if (
                            baseResponse.ok &&
                            baseData.success &&
                            baseData.base
                        ) {
                            navigate(
                                "/waiting-for-approval"
                            );

                            return;
                        }

                        // -----------------------------------------
                        // BASE NOT SUBMITTED YET
                        // -----------------------------------------

                        navigate("/base-setup");

                        return;

                    } catch (error) {

                        console.error(
                            "Base profile check error:",
                            error
                        );

                        navigate("/base-setup");

                        return;
                    }
                }

                // ---------------------------------------------
                // FALLBACK
                // ---------------------------------------------

                navigate("/base-setup");

                return;
            }

            // =================================================
            // UNKNOWN ROLE
            // =================================================

            setError(
                "Unsupported account role."
            );

        } catch (error) {

            console.error(
                "Login error:",
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
    // REGISTER NEW ACCOUNT
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

        // ADMIN CANNOT REGISTER
        if (selectedRole === "ADMIN") {
            setError(
                "Administrator accounts cannot be created through registration."
            );
            return;
        }

        try {
            setLoading(true);

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
                sessionStorage.setItem(
                    "pendingOTPEmail",
                    data.email
                );

                sessionStorage.setItem(
                    "pendingOTPRole",
                    data.role
                );

                sessionStorage.setItem(
                    "pendingOTPUserId",
                    data.userId
                );

                navigate(
                    "/email-otp",
                    {
                        replace: true,

                        state: {
                            email:
                                data.email,

                            role:
                                data.role,

                            userId:
                                data.userId,
                        },
                    }
                );

                return;
            }

            setError(
                "Invalid registration response from server."
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
    // GOOGLE LOGIN
    // =====================================================

    const handleGoogleSuccess = async (credentialResponse: {
        credential?: string;
    }) => {
        setError("");

        if (!credentialResponse.credential) {
            setError("Google authentication failed.");
            return;
        }

        try {
            setGoogleLoading(true);

            // =================================================
            // DECODE GOOGLE CREDENTIAL
            // =================================================

            const decoded: {
                sub: string;
                name?: string;
                email?: string;
                picture?: string;
            } = jwtDecode(credentialResponse.credential);

            if (!decoded.email || !decoded.sub) {
                setError(
                    "Unable to read Google account details."
                );
                return;
            }

            // =================================================
            // SEND GOOGLE USER TO BACKEND
            // =================================================

            const response = await fetch(
                `${APIURL}/google`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        googleId: decoded.sub,
                        name: decoded.name || "Google User",
                        email: decoded.email,
                        picture: decoded.picture || "",
                        role: selectedRole,
                    }),
                }
            );

            const data = await response.json();

            console.log("GOOGLE LOGIN STATUS:", response.status);
            console.log("GOOGLE LOGIN RESPONSE:", data);

            // =================================================
            // BACKEND ERROR
            // =================================================

            if (!response.ok) {
                setError(
                    data.message ||
                    "Google Sign-In failed."
                );
                return;
            }

            if (!data.user) {
                setError(
                    "Invalid response from server."
                );
                return;
            }

            // =================================================
            // IMPORTANT ROLE CHECK
            // =================================================

            if (data.user.role !== selectedRole) {
                setError(
                    `This Google account is not registered as ${roleName}.`
                );
                return;
            }

            // =================================================
            // ADMIN GOOGLE LOGIN
            // =================================================

            // =================================================
            // ADMIN GOOGLE LOGIN
            // =================================================

            if (data.user.role === "ADMIN") {

                /*
                 * Admin Google login does NOT return
                 * the final admin JWT.
                 *
                 * Backend returns a temporary
                 * ADMIN_2FA verification token.
                 */

                if (!data.verificationToken) {
                    setError(
                        "Admin verification token was not received."
                    );
                    return;
                }

                localStorage.setItem(
                    "adminPendingAuth",
                    JSON.stringify({
                        user: data.user,

                        // IMPORTANT:
                        // This comes from data.verificationToken,
                        // NOT data.token.
                        verificationToken:
                            data.verificationToken,
                    })
                );

                navigate("/admin-verification");

                return;
            }

            // =================================================
            // NORMAL USER GOOGLE LOGIN
            // =================================================

            if (data.user.role === "USER") {

                localStorage.setItem("authUser", JSON.stringify(data.user));

                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                }

                navigate("/user");

                return;
            }

            // =================================================
            // BASE HEAD GOOGLE LOGIN
            // =================================================

            // =================================================
            // BASE HEAD GOOGLE LOGIN
            // =================================================

            if (data.user.role === "BASE_HEAD") {

                // Store user
                localStorage.setItem("authUser", JSON.stringify(data.user));
                // Store JWT if available
                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                }

                // ---------------------------------------------
                // REJECTED
                // ---------------------------------------------

                if (data.user.status === "REJECTED") {
                    setError(
                        "Your Base Head application was rejected by the administrator."
                    );

                    return;
                }

                // ---------------------------------------------
                // SUSPENDED
                // ---------------------------------------------

                if (data.user.status === "SUSPENDED") {
                    setError(
                        "Your Base Head account has been suspended."
                    );

                    return;
                }

                // ---------------------------------------------
                // APPROVED
                // ---------------------------------------------

                if (
                    data.user.status === "APPROVED" &&
                    data.user.baseId
                ) {
                    navigate("/command");
                    return;
                }

                // ---------------------------------------------
                // PENDING
                // ---------------------------------------------

                if (data.user.status === "PENDING") {
                    try {
                        const baseResponse = await fetch(
                            `${APIURL}/base/me`,
                            {
                                method: "GET",
                                headers: {
                                    Authorization: `Bearer ${data.token}`,
                                },
                            }
                        );

                        const baseData = await baseResponse.json();

                        console.log("BASE STATUS:", baseData);

                        // ==========================================
                        // BASE ALREADY EXISTS
                        // ==========================================

                        if (
                            baseResponse.ok &&
                            baseData.success &&
                            baseData.base
                        ) {
                            navigate("/waiting-for-approval");
                            return;
                        }

                        // ==========================================
                        // NO BASE PROFILE YET
                        // ==========================================

                        navigate("/base-setup");
                        return;

                    } catch (error) {
                        console.error(
                            "Base profile check error:",
                            error
                        );

                        navigate("/base-setup");
                        return;
                    }
                }
                // ---------------------------------------------
                // FALLBACK
                // ---------------------------------------------

                navigate("/base-setup");

                return;
            }

            // =================================================
            // UNKNOWN ROLE
            // =================================================

            setError(
                "Unsupported account role."
            );

        } catch (error) {

            console.error(
                "Google login error:",
                error
            );

            setError(
                "Unable to connect to authentication server."
            );

        } finally {

            setGoogleLoading(false);

        }
    };

    React.useEffect(() => {
        window.onNativeGoogleSuccess = (token: string) => {
            console.log("NATIVE GOOGLE TOKEN RECEIVED");

            handleGoogleSuccess({
                credential: token
            });
        };

        window.onNativeGoogleError = (message: string) => {
            console.error("NATIVE GOOGLE ERROR:", message);
            setError(message);
            setGoogleLoading(false);
        };

        return () => {
            delete window.onNativeGoogleSuccess;
            delete window.onNativeGoogleError;
        };
    }, []);
    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    const handleForgotPassword = () => {
        setError("Password recovery will be available soon.");
    };

    // =====================================================
    // ROLE ICON
    // =====================================================

    const RoleIcon = () => {
        if (selectedRole === "USER") {
            return <User size={16} />;
        }

        if (selectedRole === "BASE_HEAD") {
            return <Building2 size={16} />;
        }

        return <KeyRound size={16} />;
    };

    // =====================================================
    // RESPONSIVE STYLES
    // =====================================================

    // UI
    // =====================================================

    return (
        <div style={styles.page}>
            {/* Background */}

            <div style={styles.grid} />
            <div style={styles.glowOne} />
            <div style={styles.glowTwo} />

            <div style={isMobile ? styles.containerMobile : styles.container}>

                {/* =================================================
            LEFT PANEL - Hidden on mobile
        ================================================= */}

                {!isMobile && (
                    <div style={styles.leftPanel}>

                        {/* BRAND */}

                        <div style={styles.brand}>
                            <div style={styles.logo}>
                                <Shield size={24} />
                            </div>

                            <div>
                                <div style={styles.brandName}>
                                    SUDARSHANA
                                    <span style={styles.brandAccent}>-AI</span>
                                </div>

                                <div style={styles.brandSub}>
                                    DEFENCE INTELLIGENCE SYSTEM
                                </div>
                            </div>
                        </div>

                        {/* MAIN TEXT */}

                        <div style={styles.leftContent}>

                            <div style={styles.systemLabel}>
                                <span style={styles.greenDot} />
                                SECURE ACCESS TERMINAL
                            </div>

                            <h1 style={styles.heading}>
                                Command.
                                <br />
                                Intelligence.
                                <br />
                                <span>Awareness.</span>
                            </h1>

                            <p style={styles.description}>
                                Secure access to the Sudarshana-AI
                                situational awareness platform.
                            </p>

                        </div>

                        {/* SYSTEM STATUS */}

                        <div style={styles.systemInfo}>

                            <div style={styles.infoItem}>
                                <span>SYSTEM</span>
                                <strong>OPERATIONAL</strong>
                            </div>

                            <div style={styles.infoItem}>
                                <span>PROCESSING</span>
                                <strong>LOCAL</strong>
                            </div>

                            <div style={styles.infoItem}>
                                <span>SECURITY</span>
                                <strong>ENABLED</strong>
                            </div>

                        </div>
                    </div>
                )}

                {/* =================================================
            RIGHT PANEL - Always visible
        ================================================= */}

                <div style={isMobile ? styles.formPanelMobile : styles.formPanel}>

                    <div style={isMobile ? styles.formContainerMobile : styles.formContainer}>

                        {/* =================================================
                ROLE SELECTOR
            ================================================= */}

                        <div style={isSmallMobile ? styles.roleSelectorSmall : styles.roleSelector}>

                            {/* USER */}

                            <button
                                type="button"
                                onClick={() =>
                                    handleRoleChange("USER")
                                }
                                style={{
                                    ...styles.roleButton,
                                    ...(selectedRole === "USER"
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
                                    handleRoleChange("BASE_HEAD")
                                }
                                style={{
                                    ...styles.roleButton,
                                    ...(selectedRole === "BASE_HEAD"
                                        ? styles.roleButtonActive
                                        : {}),
                                }}
                            >
                                <Building2 size={14} />
                                BASE HEAD
                            </button>

                            {/* ADMIN */}
                            {!isRegisterMode && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRoleChange("ADMIN")
                                    }
                                    style={{
                                        ...styles.roleButton,
                                        ...(selectedRole === "ADMIN"
                                            ? styles.roleButtonActive
                                            : {}),
                                    }}
                                >
                                    <KeyRound size={14} />
                                    ADMIN
                                </button>
                            )}

                        </div>

                        {/* =================================================
                HEADER
            ================================================= */}

                        <div style={styles.formHeader}>

                            <div style={styles.accessBadge}>
                                <RoleIcon />

                                {roleName.toUpperCase()}
                            </div>

                            <h2 style={isSmallMobile ? styles.formTitleSmall : styles.formTitle}>
                                {isRegisterMode
                                    ? "Create Account"
                                    : "Sign in"}
                            </h2>

                            <p style={isSmallMobile ? styles.formSubtitleSmall : styles.formSubtitle}>
                                {isRegisterMode
                                    ? `Create a secure ${roleName.toLowerCase()} account.`
                                    : `Authenticate to access the ${roleName.toLowerCase()} interface.`}
                            </p>

                        </div>

                        {/* =================================================
                ERROR
            ================================================= */}

                        {error && (
                            <div style={styles.errorBox}>
                                <AlertCircle size={15} />

                                <span>{error}</span>
                            </div>
                        )}

                        {/* =================================================
                LOGIN FORM
            ================================================= */}
                        <form
                            onSubmit={
                                isRegisterMode
                                    ? handleRegister
                                    : handleEmailLogin
                            }
                        >

                            {/* EMAIL */}

                            {/* NAME - REGISTER ONLY */}

                            {isRegisterMode && (
                                <div style={styles.inputGroup}>

                                    <label style={styles.label}>
                                        FULL NAME
                                    </label>

                                    <div style={styles.inputWrapper}>

                                        <User
                                            size={17}
                                            style={styles.inputIcon}
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
                                            style={styles.input}
                                        />

                                    </div>

                                </div>
                            )}

                            <div style={styles.inputGroup}>

                                <label style={styles.label}>
                                    EMAIL ADDRESS
                                </label>

                                <div style={styles.inputWrapper}>

                                    <Mail
                                        size={17}
                                        style={styles.inputIcon}
                                    />

                                    <input
                                        type="email"
                                        placeholder="operator@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        autoComplete="email"
                                        style={styles.input}
                                    />

                                </div>
                            </div>

                            {/* PASSWORD */}

                            <div style={styles.inputGroup}>

                                <div style={styles.labelRow}>

                                    <label style={styles.label}>
                                        PASSWORD
                                    </label>

                                    {!isRegisterMode && (
                                        <button
                                            type="button"
                                            style={styles.forgotButton}
                                            onClick={handleForgotPassword}
                                        >
                                            Forgot password?
                                        </button>
                                    )}

                                </div>

                                <div style={styles.inputWrapper}>

                                    <Lock
                                        size={17}
                                        style={styles.inputIcon}
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        autoComplete={
                                            isRegisterMode
                                                ? "new-password"
                                                : "current-password"
                                        }
                                        style={styles.input}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        style={styles.eyeButton}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>

                                </div>
                            </div>

                            {/* SIGN IN */}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.submitButton,
                                    opacity: loading ? 0.65 : 1,
                                    cursor: loading
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

                                        {isRegisterMode
                                            ? "CREATING ACCOUNT..."
                                            : "AUTHENTICATING..."}
                                    </>
                                ) : (
                                    <>
                                        {isRegisterMode
                                            ? "CREATE ACCOUNT"
                                            : "SIGN IN"}

                                        <ArrowRight size={17} />
                                    </>
                                )}

                            </button>

                        </form>

                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "18px",
                                fontSize: "10px",
                                color: "#68756d",
                            }}
                        >
                            <span>Don't have an account? </span>

                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#6fae72",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    padding: 0,
                                }}
                            >
                                Create one
                            </button>
                        </div>

                        {/* =================================================
                DIVIDER
            ================================================= */}

                        <div style={styles.divider}>

                            <span
                                style={styles.dividerLine}
                            />

                            <p style={styles.dividerText}>
                                OR
                            </p>

                            <span
                                style={styles.dividerLine}
                            />

                        </div>

                        {/* =================================================
                GOOGLE
            ================================================= */}

                        <div style={styles.googleButtonWrapper}>
                            {window.AndroidGoogleAuth ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");

                                        if (window.AndroidGoogleAuth) {
                                            window.AndroidGoogleAuth.startGoogleSignIn();
                                        } else {
                                            setError("Google Sign-In is available only in the Android app.");
                                        }
                                    }}
                                    style={{
                                        width: "100%",
                                        maxWidth: "360px",
                                        height: "40px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Continue with Google
                                </button>
                            ) : (
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        setError("Google Sign-In failed.");
                                    }}
                                    useOneTap={false}
                                    theme="filled_black"
                                    size="large"
                                    text="continue_with"
                                    shape="rectangular"
                                    width="360"
                                />
                            )}
                        </div>
                        {/* =================================================
                ROLE INFO
            ================================================= */}

                        <div style={styles.roleInfo}>

                            <span>
                                Access level:
                            </span>

                            <strong>
                                {roleName}
                            </strong>

                        </div>

                        {/* =================================================
                SECURITY
            ================================================= */}

                        <div style={styles.securityNotice}>

                            <Shield size={12} />

                            <span>
                                Secure authentication · Protected
                                connection
                            </span>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// MEDIA QUERY HOOK
// ============================================================

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);
    return matches;
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
        padding: "1rem",
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
        minHeight: "650px",
        display: "grid",
        gridTemplateColumns: "1.05fr .95fr",
        border: "1px solid #26352d",
        background: "#0c1310",
        position: "relative",
        zIndex: 2,
        boxShadow:
            "0 25px 80px rgba(0,0,0,.45)",
    },

    containerMobile: {
        width: "min(420px, 100%)",
        minHeight: "auto",
        display: "grid",
        gridTemplateColumns: "1fr",
        border: "1px solid #26352d",
        background: "#0c1310",
        position: "relative",
        zIndex: 2,
        boxShadow:
            "0 25px 80px rgba(0,0,0,.45)",
    },

    /* =====================================================
       LEFT
    ===================================================== */

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

    /* =====================================================
       RIGHT
    ===================================================== */

    formPanel: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b110e",
        padding: "2rem 1rem",
    },

    formPanelMobile: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b110e",
        padding: "1.5rem 0.75rem",
    },

    formContainer: {
        width: "min(360px, 100%)",
    },

    formContainerMobile: {
        width: "100%",
        maxWidth: "340px",
    },

    /* =====================================================
       ROLE SELECTOR
    ===================================================== */

    roleSelector: {
        display: "grid",
        gridTemplateColumns:
            "1fr 1fr 1fr",
        gap: "5px",
        marginBottom: "27px",
        padding: "4px",
        background: "#080d0b",
        border: "1px solid #26352d",
    },

    roleSelectorSmall: {
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

    /* =====================================================
       HEADER
    ===================================================== */

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

    formTitleSmall: {
        margin: 0,
        fontSize: "22px",
        fontWeight: 650,
    },

    formSubtitle: {
        margin: "7px 0 0",
        color: "#6e7a72",
        fontSize: "11px",
        lineHeight: 1.5,
    },

    formSubtitleSmall: {
        margin: "7px 0 0",
        color: "#6e7a72",
        fontSize: "10px",
        lineHeight: 1.4,
    },

    /* =====================================================
       ERROR
    ===================================================== */

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

    /* =====================================================
       INPUTS
    ===================================================== */

    inputGroup: {
        marginBottom: "17px",
    },

    labelRow: {
        display: "flex",
        alignItems: "center",
        justifyContent:
            "space-between",
        marginBottom: "7px",
    },

    label: {
        display: "block",
        color: "#87938b",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1px",
        marginBottom: "7px",
    },

    forgotButton: {
        border: "none",
        background: "none",
        color: "#6fae72",
        fontSize: "9px",
        cursor: "pointer",
        padding: 0,
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

    /* =====================================================
       BUTTONS
    ===================================================== */

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

    divider: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        margin: "20px 0",
    },

    dividerLine: {
        flex: 1,
        height: "1px",
        background: "#26352d",
    },

    dividerText: {
        margin: 0,
        color: "#4f5c54",
        fontSize: "9px",
    },

    googleButtonWrapper: {
        display: "flex",
        justifyContent: "center",
        width: "100%",
        overflow: "hidden",
    },

    googleButton: {
        width: "100%",
        maxWidth: "360px",
        height: "43px",
        border:
            "1px solid #2a3930",
        background: "#101813",
        color: "#b8c1bb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: ".7px",
        cursor: "pointer",
    },

    googleIcon: {
        fontSize: "16px",
        fontWeight: 700,
        color: "#d7ddd8",
    },

    /* =====================================================
       INFO
    ===================================================== */

    roleInfo: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
        marginTop: "20px",
        color: "#68756d",
        fontSize: "9px",
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

export default Signin;