// components/UserAlerts.tsx
import React, { useState } from "react";
import {
    Bell,

    Clock,
    Filter,
    Search,
    ChevronRight,

    Info,
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
    source: string;
    lastUpdated: string;
}

const UserAlerts: React.FC = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

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

    const mockAlerts: PublicAlert[] = [
        {
            id: "ALERT-001",
            severity: "HIGH",
            title: "Restricted Area Advisory",
            description: "Public access is temporarily restricted in the designated area. Follow official guidance from authorities.",
            area: "Sector B - Designated Zone",
            timestamp: "2025-04-13 14:32:18",
            status: "ACTIVE",
            source: "Public Safety Authority",
            lastUpdated: "2025-04-13 14:35:22",
        },
        {
            id: "ALERT-002",
            severity: "MEDIUM",
            title: "Movement Advisory",
            description: "Residents are advised to follow official instructions in the affected area. Non-essential movement should be avoided.",
            area: "Sector A Perimeter",
            timestamp: "2025-04-13 14:28:45",
            status: "ACTIVE",
            source: "Local Administration",
            lastUpdated: "2025-04-13 14:30:12",
        },
        {
            id: "ALERT-003",
            severity: "INFORMATION",
            title: "Routine Safety Notice",
            description: "Follow official safety guidance and verified announcements from authorized sources.",
            area: "All Sectors",
            timestamp: "2025-04-13 13:15:22",
            status: "UPDATED",
            source: "Public Safety Authority",
            lastUpdated: "2025-04-13 13:20:45",
        },
        {
            id: "ALERT-004",
            severity: "HIGH",
            title: "Emergency Preparedness Advisory",
            description: "Emergency preparedness measures are in effect. Stay informed through official channels.",
            area: "Sector C - Highway Area",
            timestamp: "2025-04-13 12:45:10",
            status: "RESOLVED",
            source: "Emergency Services",
            lastUpdated: "2025-04-13 13:00:00",
        },
        {
            id: "ALERT-005",
            severity: "MEDIUM",
            title: "Public Safety Advisory",
            description: "Heightened awareness is advised in certain areas. Follow local guidelines.",
            area: "Sector D - Perimeter",
            timestamp: "2025-04-13 11:30:55",
            status: "ACTIVE",
            source: "Public Safety Authority",
            lastUpdated: "2025-04-13 11:45:33",
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

    const headerStyle: React.CSSProperties = {
        marginBottom: "2rem",
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: "1rem",
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

    const filterBarStyle: React.CSSProperties = {
        display: "flex",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
        alignItems: "center",
    };

    const searchContainerStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        padding: "0.3rem 0.75rem",
        borderRadius: "4px",
        flex: 1,
        minWidth: "200px",
    };

    const searchInputStyle: React.CSSProperties = {
        background: "transparent",
        border: "none",
        color: colors.textPrimary,
        fontSize: "13px",
        padding: "0.25rem 0.5rem",
        outline: "none",
        width: "100%",
        fontFamily: "inherit",
    };

    const filterSelectStyle: React.CSSProperties = {
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        color: colors.textSecondary,
        padding: "0.3rem 0.75rem",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "inherit",
        outline: "none",
        cursor: "pointer",
    };

    const statsGridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "0.75rem",
        marginBottom: "1.5rem",
    };

    const statCardStyle: React.CSSProperties = {
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        padding: "0.75rem",
    };

    const statValueStyle: React.CSSProperties = {
        fontSize: "22px",
        fontWeight: 700,
        color: colors.textPrimary,
        lineHeight: 1.2,
    };

    const statLabelStyle: React.CSSProperties = {
        fontSize: "10px",
        fontWeight: 500,
        color: colors.textSecondary,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
    };

    const alertListStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    };

    const alertItemStyle = (severity: string, expanded: boolean): React.CSSProperties => {
        let borderColor = colors.border;
        if (severity === "HIGH") borderColor = colors.accentRed;
        else if (severity === "MEDIUM") borderColor = colors.accentAmber;
        else if (severity === "INFORMATION") borderColor = colors.accentBlue;
        return {
            background: colors.surface,
            border: `1px solid ${expanded ? borderColor : colors.border}`,
            borderLeft: `4px solid ${borderColor}`,
            padding: expanded ? "1rem" : "0.75rem 1rem",
            cursor: "pointer",
            transition: "all 0.2s",
        };
    };

    const alertHeaderStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    };

    const severityBadgeStyle = (severity: string): React.CSSProperties => {
        let color = colors.textSecondary;
        let bg = colors.surfaceLighter;
        if (severity === "HIGH") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
        else if (severity === "MEDIUM") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
        else if (severity === "INFORMATION") { color = colors.accentBlue; bg = `${colors.accentBlue}15`; }
        return {
            fontSize: "10px",
            fontWeight: 700,
            color,
            background: bg,
            padding: "0.15rem 0.6rem",
            borderRadius: "3px",
            letterSpacing: "0.5px",
        };
    };

    const statusBadgeStyle = (status: string): React.CSSProperties => {
        let color = colors.textSecondary;
        if (status === "ACTIVE") color = colors.accentRed;
        else if (status === "UPDATED") color = colors.accentAmber;
        else if (status === "RESOLVED") color = colors.accentGreen;
        return {
            fontSize: "9px",
            fontWeight: 600,
            color,
            padding: "0.15rem 0.5rem",
            border: `1px solid ${color}33`,
            borderRadius: "3px",
        };
    };

    const detailsStyle: React.CSSProperties = {
        marginTop: "0.75rem",
        paddingTop: "0.75rem",
        borderTop: `1px solid ${colors.border}`,
    };

    const detailRowStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        padding: "0.25rem 0",
        fontSize: "12px",
        color: colors.textSecondary,
    };

    const filteredAlerts = mockAlerts.filter(alert => {
        const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = filterSeverity === "ALL" || alert.severity === filterSeverity;
        const matchesStatus = filterStatus === "ALL" || alert.status === filterStatus;
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const stats = {
        total: mockAlerts.length,
        active: mockAlerts.filter(a => a.status === "ACTIVE").length,
        high: mockAlerts.filter(a => a.severity === "HIGH").length,
        resolved: mockAlerts.filter(a => a.status === "RESOLVED").length,
    };

    return (
        <div style={containerStyle}>
            <div style={innerContainerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={headerTitleStyle}>
                        <Bell size={28} style={{ display: "inline", marginRight: "12px", color: colors.accentGreen }} />
                        Public Alerts
                    </div>
                    <div style={headerSubtitleStyle}>
                        Verified public safety alerts and advisories
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

                {/* Stats */}
                <div style={statsGridStyle}>
                    <div style={statCardStyle}>
                        <span style={statValueStyle}>{stats.total}</span>
                        <span style={statLabelStyle}>Total Alerts</span>
                    </div>
                    <div style={{ ...statCardStyle, borderColor: colors.accentRed }}>
                        <span style={{ ...statValueStyle, color: colors.accentRed }}>{stats.active}</span>
                        <span style={statLabelStyle}>Active</span>
                    </div>
                    <div style={{ ...statCardStyle, borderColor: colors.accentAmber }}>
                        <span style={{ ...statValueStyle, color: colors.accentAmber }}>{stats.high}</span>
                        <span style={statLabelStyle}>High Severity</span>
                    </div>
                    <div style={{ ...statCardStyle, borderColor: colors.accentGreen }}>
                        <span style={{ ...statValueStyle, color: colors.accentGreen }}>{stats.resolved}</span>
                        <span style={statLabelStyle}>Resolved</span>
                    </div>
                </div>

                {/* Filters */}
                <div style={filterBarStyle}>
                    <div style={searchContainerStyle}>
                        <Search size={16} color={colors.textSecondary} />
                        <input
                            style={searchInputStyle}
                            placeholder="Search alerts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        style={filterSelectStyle}
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                    >
                        <option value="ALL">All Severity</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="INFORMATION">Information</option>
                    </select>

                    <select
                        style={filterSelectStyle}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="UPDATED">Updated</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>

                    <div style={{ fontSize: "12px", color: colors.textSecondary }}>
                        <Filter size={14} style={{ display: "inline", marginRight: "4px" }} />
                        {filteredAlerts.length} results
                    </div>
                </div>

                {/* Alert List */}
                <div style={alertListStyle}>
                    {filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            style={alertItemStyle(alert.severity, expandedAlert === alert.id)}
                            onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                        >
                            <div style={alertHeaderStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                                    <span style={severityBadgeStyle(alert.severity)}>{alert.severity}</span>
                                    <span style={{ fontSize: "15px", fontWeight: 600 }}>{alert.title}</span>
                                    <span style={{ fontSize: "12px", color: colors.textSecondary }}>
                                        {alert.area}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={statusBadgeStyle(alert.status)}>{alert.status}</span>
                                    <span style={{ fontSize: "11px", color: colors.textSecondary }}>
                                        {alert.timestamp.split(" ")[1]}
                                    </span>
                                    <ChevronRight
                                        size={18}
                                        style={{
                                            transform: expandedAlert === alert.id ? "rotate(90deg)" : "none",
                                            transition: "transform 0.2s",
                                            color: colors.textSecondary,
                                        }}
                                    />
                                </div>
                            </div>

                            {expandedAlert === alert.id && (
                                <div style={detailsStyle}>
                                    <div style={{ fontSize: "13px", color: colors.textPrimary, marginBottom: "0.5rem" }}>
                                        {alert.description}
                                    </div>
                                    <div style={detailRowStyle}>
                                        <span>Source</span>
                                        <span style={{ color: colors.textPrimary }}>{alert.source}</span>
                                    </div>
                                    <div style={detailRowStyle}>
                                        <span>Location</span>
                                        <span style={{ color: colors.textPrimary }}>{alert.area}</span>
                                    </div>
                                    <div style={detailRowStyle}>
                                        <span>Published</span>
                                        <span style={{ color: colors.textPrimary }}>{alert.timestamp}</span>
                                    </div>
                                    <div style={detailRowStyle}>
                                        <span>Last Updated</span>
                                        <span style={{ color: colors.textPrimary }}>{alert.lastUpdated}</span>
                                    </div>
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <button style={{
                                            background: colors.surfaceLighter,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: "4px",
                                            padding: "0.3rem 0.75rem",
                                            color: colors.textPrimary,
                                            fontSize: "11px",
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                        }}>
                                            <Info size={12} style={{ display: "inline", marginRight: "4px" }} />
                                            View Full Details
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserAlerts;