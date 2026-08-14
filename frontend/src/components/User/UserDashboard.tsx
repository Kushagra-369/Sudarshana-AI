// components/UserDashboard.tsx
import React, { useState } from "react";
import {
    Shield,
    AlertTriangle,
    Bell,
    Info,
    Clock,
    MapPin,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    MessageCircle,

    Sparkles,

    ArrowRight,
    Calendar,
} from "lucide-react";

interface PublicAlert {
    id: string;
    severity: "HIGH" | "MEDIUM" | "INFORMATION";
    title: string;
    description: string;
    area: string;
    timestamp: string;
    status: "ACTIVE" | "RESOLVED" | "UPDATED";
}

interface SafetyUpdate {
    id: string;
    title: string;
    category: string;
    description: string;
    date: string;
    status: "NEW" | "UPDATED";
}

interface PublicInfo {
    id: string;
    title: string;
    category: string;
    description: string;
    date: string;
    status: "PUBLISHED" | "UPDATED";
}

const UserDashboard: React.FC = () => {
    const [, setSelectedAlert] = useState<string | null>(null);

    const colors = {
        bg: "#080D0C",
        surface: "#111A16",
        surfaceLighter: "#1A2622",
        border: "#26352D",
        borderLight: "#354A40",
        textPrimary: "#E6E8E3",
        textSecondary: "#8C9890",
        accentGreen: "#6FAF72",
        accentAmber: "#D59B3A",
        accentOrange: "#D97832",
        accentRed: "#D9534F",
        accentBlue: "#4A8C9E",
    };

    // Mock data
    const mockAlerts: PublicAlert[] = [
        {
            id: "alert-001",
            severity: "HIGH",
            title: "Restricted Area Advisory",
            description: "Public access is temporarily restricted in the designated area. Follow official guidance.",
            area: "Sector B Area",
            timestamp: "2025-04-13 14:32:18",
            status: "ACTIVE",
        },
        {
            id: "alert-002",
            severity: "MEDIUM",
            title: "Movement Advisory",
            description: "Residents are advised to follow official instructions in the affected area.",
            area: "Sector A Perimeter",
            timestamp: "2025-04-13 14:28:45",
            status: "ACTIVE",
        },
        {
            id: "alert-003",
            severity: "INFORMATION",
            title: "Routine Safety Notice",
            description: "Follow official safety guidance and verified announcements.",
            area: "All Sectors",
            timestamp: "2025-04-13 13:15:22",
            status: "UPDATED",
        },
    ];

    const mockSafetyUpdates: SafetyUpdate[] = [
        {
            id: "safety-001",
            title: "Emergency Preparedness Guidance",
            category: "Preparedness",
            description: "Stay informed about emergency procedures. Know your safe zones and evacuation routes.",
            date: "2025-04-13 12:00:00",
            status: "NEW",
        },
        {
            id: "safety-002",
            title: "Restricted Area Awareness",
            category: "Awareness",
            description: "Be aware of restricted areas and follow all posted signage and instructions.",
            date: "2025-04-12 10:30:00",
            status: "UPDATED",
        },
        {
            id: "safety-003",
            title: "Public Emergency Response",
            category: "Response",
            description: "In case of emergency, follow instructions from authorized personnel immediately.",
            date: "2025-04-11 08:15:00",
            status: "UPDATED",
        },
    ];

    const mockPublicInfo: PublicInfo[] = [
        {
            id: "info-001",
            title: "Public Area Advisory",
            category: "Advisory",
            description: "Authorities have issued a temporary movement advisory for the affected region.",
            date: "2025-04-13 11:45:00",
            status: "PUBLISHED",
        },
        {
            id: "info-002",
            title: "Safety Infrastructure Update",
            category: "Infrastructure",
            description: "Routine security preparedness activity has been completed.",
            date: "2025-04-12 09:20:00",
            status: "PUBLISHED",
        },
        {
            id: "info-003",
            title: "Public Safety Communication",
            category: "Communication",
            description: "Official public safety channels are active. Ensure you are subscribed to notifications.",
            date: "2025-04-11 16:30:00",
            status: "UPDATED",
        },
    ];

    const containerStyle: React.CSSProperties = {
        background: colors.bg,
        minHeight: "calc(100vh - 64px)",
        padding: "2rem 1.5rem",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: colors.textPrimary,
    };

    const innerContainerStyle: React.CSSProperties = {
        maxWidth: "1200px",
        margin: "0 auto",
    };

    // Section 1 - Header
    const headerStyle: React.CSSProperties = {
        marginBottom: "2rem",
    };

    const headerTitleStyle: React.CSSProperties = {
        fontSize: "28px",
        fontWeight: 700,
        color: colors.textPrimary,
        marginBottom: "0.25rem",
    };

    const headerSubtitleStyle: React.CSSProperties = {
        fontSize: "14px",
        color: colors.textSecondary,
    };

    const headerMetaStyle: React.CSSProperties = {
        display: "flex",
        gap: "1.5rem",
        marginTop: "0.5rem",
        fontSize: "12px",
        color: colors.textSecondary,
    };

    // Section 2 - Status Card
    const statusCardStyle: React.CSSProperties = {
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
    };

    const statusIconStyle: React.CSSProperties = {
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: `${colors.accentGreen}22`,
        border: `2px solid ${colors.accentGreen}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const statusContentStyle: React.CSSProperties = {
        flex: 1,
    };

    const statusLabelStyle: React.CSSProperties = {
        fontSize: "12px",
        fontWeight: 600,
        color: colors.textSecondary,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
    };

    const statusValueStyle: React.CSSProperties = {
        fontSize: "20px",
        fontWeight: 700,
        color: colors.accentGreen,
        margin: "0.25rem 0",
    };

    const statusDescStyle: React.CSSProperties = {
        fontSize: "14px",
        color: colors.textSecondary,
    };

    // Grid layouts
    const grid2Style: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "1.5rem",
        marginBottom: "2rem",
    };

    const grid3Style: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1.5rem",
        marginBottom: "2rem",
    };

    const panelStyle: React.CSSProperties = {
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        padding: "1.25rem",
    };

    const panelHeaderStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
        paddingBottom: "0.5rem",
        borderBottom: `1px solid ${colors.border}`,
    };

    const panelTitleStyle: React.CSSProperties = {
        fontSize: "14px",
        fontWeight: 600,
        color: colors.textPrimary,
        letterSpacing: "0.3px",
    };

    const panelActionStyle: React.CSSProperties = {
        fontSize: "12px",
        color: colors.textSecondary,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        background: "transparent",
        border: "none",
        fontFamily: "inherit",
        padding: "0.25rem 0.5rem",
    };

    // Alert card
    const alertCardStyle = (severity: string): React.CSSProperties => {
        const borderColor =
            severity === "HIGH" ? colors.accentRed :
                severity === "MEDIUM" ? colors.accentAmber :
                    colors.accentBlue;
        return {
            padding: "0.75rem",
            borderLeft: `3px solid ${borderColor}`,
            borderBottom: `1px solid ${colors.border}`,
            marginBottom: "0.5rem",
            cursor: "pointer",
            transition: "background 0.15s",
        };
    };

    const alertSeverityStyle = (severity: string): React.CSSProperties => {
        const color =
            severity === "HIGH" ? colors.accentRed :
                severity === "MEDIUM" ? colors.accentAmber :
                    colors.accentBlue;
        return {
            fontSize: "10px",
            fontWeight: 700,
            color,
            letterSpacing: "0.3px",
        };
    };

    // Safety update item
    const safetyItemStyle: React.CSSProperties = {
        padding: "0.5rem 0",
        borderBottom: `1px solid ${colors.border}`,
    };

    const infoItemStyle: React.CSSProperties = {
        padding: "0.5rem 0",
        borderBottom: `1px solid ${colors.border}`,
    };

    // AI Assistant card
    const aiCardStyle: React.CSSProperties = {
        background: colors.surfaceLighter,
        border: `1px solid ${colors.border}`,
        padding: "1.25rem",
        marginBottom: "2rem",
    };

    const aiHeaderStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "0.75rem",
    };

    const aiQuestionStyle: React.CSSProperties = {
        display: "inline-block",
        padding: "0.3rem 0.6rem",
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        fontSize: "12px",
        color: colors.textSecondary,
        marginRight: "0.5rem",
        marginBottom: "0.5rem",
        cursor: "pointer",
    };

    const aiDisclaimerStyle: React.CSSProperties = {
        fontSize: "11px",
        color: colors.textSecondary,
        padding: "0.5rem",
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        marginTop: "0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    };

    // Emergency notice
    const emergencyStyle: React.CSSProperties = {
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        padding: "1rem 1.25rem",
        marginTop: "2rem",
    };

    const emergencyTitleStyle: React.CSSProperties = {
        fontSize: "13px",
        fontWeight: 600,
        color: colors.textPrimary,
    };

    const emergencyTextStyle: React.CSSProperties = {
        fontSize: "13px",
        color: colors.textSecondary,
        marginTop: "0.25rem",
    };

    return (
        <div style={containerStyle}>
            <div style={innerContainerStyle}>
                {/* SECTION 1 - HEADER */}
                <div style={headerStyle}>
                    <div style={headerTitleStyle}>Public Safety Overview</div>
                    <div style={headerSubtitleStyle}>
                        Verified security and safety information for public awareness.
                    </div>
                    <div style={headerMetaStyle}>
                        <span>
                            <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />
                            {new Date().toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                        <span>
                            <Clock size={14} style={{ display: "inline", marginRight: "4px" }} />
                            Last updated: {new Date().toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                </div>

                {/* SECTION 2 - STATUS CARD */}
                <div style={statusCardStyle}>
                    <div style={statusIconStyle}>
                        <CheckCircle size={32} color={colors.accentGreen} />
                    </div>
                    <div style={statusContentStyle}>
                        <div style={statusLabelStyle}>Public Security Status</div>
                        <div style={statusValueStyle}>NORMAL</div>
                        <div style={statusDescStyle}>No active public safety emergency</div>
                    </div>
                    <div style={{ fontSize: "12px", color: colors.textSecondary, textAlign: "right" }}>
                        <div>Status ID: PS-2025-0413</div>
                        <div style={{ marginTop: "4px" }}>Last verified: 14:32</div>
                    </div>
                </div>

                {/* SECTION 3 & 4 - ALERTS + SAFETY UPDATES */}
                <div style={grid2Style}>
                    {/* Active Alerts */}
                    <div style={panelStyle}>
                        <div style={panelHeaderStyle}>
                            <span style={panelTitleStyle}>
                                <Bell size={16} style={{ display: "inline", marginRight: "6px" }} />
                                Active Public Alerts
                            </span>
                            <button style={panelActionStyle}>
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        {mockAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                style={alertCardStyle(alert.severity)}
                                onClick={() => setSelectedAlert(alert.id)}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={alertSeverityStyle(alert.severity)}>{alert.severity}</div>
                                        <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "2px" }}>{alert.title}</div>
                                        <div style={{ fontSize: "12px", color: colors.textSecondary, marginTop: "4px" }}>
                                            {alert.description}
                                        </div>
                                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "4px", fontSize: "11px", color: colors.textSecondary }}>
                                            <span><MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />{alert.area}</span>
                                            <span><Clock size={12} style={{ display: "inline", marginRight: "4px" }} />{alert.timestamp.split(" ")[1]}</span>
                                            <span style={{
                                                padding: "0.1rem 0.4rem",
                                                border: `1px solid ${alert.status === "ACTIVE" ? colors.accentRed : colors.accentAmber}`,
                                                borderRadius: "2px",
                                                fontSize: "8px",
                                                color: alert.status === "ACTIVE" ? colors.accentRed : colors.accentAmber,
                                            }}>
                                                {alert.status}
                                            </span>
                                        </div>
                                    </div>
                                    <AlertTriangle size={16} color={
                                        alert.severity === "HIGH" ? colors.accentRed :
                                            alert.severity === "MEDIUM" ? colors.accentAmber :
                                                colors.accentBlue
                                    } />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Safety Updates */}
                    <div style={panelStyle}>
                        <div style={panelHeaderStyle}>
                            <span style={panelTitleStyle}>
                                <Shield size={16} style={{ display: "inline", marginRight: "6px" }} />
                                Safety Updates
                            </span>
                            <button style={panelActionStyle}>
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        {mockSafetyUpdates.map((update) => (
                            <div key={update.id} style={safetyItemStyle}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{update.title}</div>
                                        <div style={{ fontSize: "11px", color: colors.textSecondary, marginTop: "2px" }}>
                                            {update.category}
                                        </div>
                                        <div style={{ fontSize: "12px", color: colors.textSecondary, marginTop: "4px" }}>
                                            {update.description}
                                        </div>
                                        <div style={{ fontSize: "10px", color: colors.textSecondary, marginTop: "4px" }}>
                                            <Clock size={10} style={{ display: "inline", marginRight: "4px" }} />
                                            {update.date}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: "8px",
                                        fontWeight: 600,
                                        color: update.status === "NEW" ? colors.accentGreen : colors.accentAmber,
                                        padding: "0.1rem 0.4rem",
                                        border: `1px solid ${update.status === "NEW" ? colors.accentGreen : colors.accentAmber}`,
                                        borderRadius: "2px",
                                    }}>
                                        {update.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION 5 - RECENT PUBLIC INFORMATION */}
                <div style={panelStyle}>
                    <div style={panelHeaderStyle}>
                        <span style={panelTitleStyle}>
                            <Info size={16} style={{ display: "inline", marginRight: "6px" }} />
                            Recent Public Information
                        </span>
                        <button style={panelActionStyle}>
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div style={grid3Style}>
                        {mockPublicInfo.map((info) => (
                            <div key={info.id} style={{ ...infoItemStyle, borderBottom: "none", padding: "0.5rem 0.5rem 0.5rem 0" }}>
                                <div style={{ fontSize: "12px", fontWeight: 600 }}>{info.title}</div>
                                <div style={{ fontSize: "10px", color: colors.textSecondary }}>{info.category}</div>
                                <div style={{ fontSize: "11px", color: colors.textSecondary, marginTop: "4px" }}>
                                    {info.description}
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "4px", fontSize: "10px", color: colors.textSecondary }}>
                                    <span><Clock size={10} style={{ display: "inline", marginRight: "4px" }} />{info.date.split(" ")[1]}</span>
                                    <span style={{
                                        padding: "0.1rem 0.4rem",
                                        border: `1px solid ${info.status === "PUBLISHED" ? colors.accentGreen : colors.accentAmber}`,
                                        borderRadius: "2px",
                                        fontSize: "7px",
                                        color: info.status === "PUBLISHED" ? colors.accentGreen : colors.accentAmber,
                                    }}>
                                        {info.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION 6 - AI ASSISTANT */}
                <div style={aiCardStyle}>
                    <div style={aiHeaderStyle}>
                        <Sparkles size={24} color={colors.accentGreen} />
                        <div>
                            <div style={{ fontSize: "16px", fontWeight: 600 }}>Sudarshana AI Assistant</div>
                            <div style={{ fontSize: "12px", color: colors.textSecondary }}>
                                Ask about current public alerts, safety guidance and verified public information.
                            </div>
                        </div>
                    </div>
                    <div style={{ marginBottom: "0.75rem" }}>
                        {[
                            "What alerts are active?",
                            "What should I do during an emergency?",
                            "Are there any public safety advisories?",
                            "What does the current security status mean?"
                        ].map((question, idx) => (
                            <span key={idx} style={aiQuestionStyle}>
                                {question}
                            </span>
                        ))}
                    </div>
                    <button style={{
                        background: colors.accentGreen,
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.6rem 1.5rem",
                        color: colors.textPrimary,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}>
                        <MessageCircle size={18} />
                        Open AI Assistant
                        <ArrowRight size={16} />
                    </button>
                    <div style={aiDisclaimerStyle}>
                        <Shield size={14} color={colors.accentGreen} />
                        <span>Responses are limited to verified public information.</span>
                    </div>
                </div>

                {/* SECTION 7 - EMERGENCY NOTICE */}
                <div style={emergencyStyle}>
                    <div style={emergencyTitleStyle}>
                        <AlertCircle size={16} style={{ display: "inline", marginRight: "6px", color: colors.accentAmber }} />
                        Important
                    </div>
                    <div style={emergencyTextStyle}>
                        For emergencies, follow instructions from authorized local authorities and official emergency channels.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;