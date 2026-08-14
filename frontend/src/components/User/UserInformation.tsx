// components/UserInformation.tsx
import React, { useState } from "react";
import {
    Info,
    Calendar,
    Clock,
    ChevronRight,
    Search,
    Filter,
    ExternalLink,

    Link,

    Eye,
} from "lucide-react";

interface InformationItem {
    id: string;
    title: string;
    category: "ADVISORY" | "INFRASTRUCTURE" | "COMMUNICATION" | "GENERAL";
    description: string;
    date: string;
    status: "PUBLISHED" | "UPDATED" | "ARCHIVED";
    source: string;
    url?: string;
    content?: string;
}

const UserInformation: React.FC = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("ALL");
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

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
        accentPurple: "#8A6EB0",
    };

    const mockInformation: InformationItem[] = [
        {
            id: "info-001",
            title: "Public Area Advisory",
            category: "ADVISORY",
            description: "Authorities have issued a temporary movement advisory for the affected region.",
            date: "2025-04-13 11:45:00",
            status: "PUBLISHED",
            source: "Public Safety Authority",
            url: "#",
            content: "Full advisory details: Movement restrictions are in place for the designated area. Residents are advised to follow official instructions and avoid non-essential travel in the affected zones.",
        },
        {
            id: "info-002",
            title: "Safety Infrastructure Update",
            category: "INFRASTRUCTURE",
            description: "Routine security preparedness activity has been completed.",
            date: "2025-04-12 09:20:00",
            status: "PUBLISHED",
            source: "Infrastructure Department",
            url: "#",
            content: "The routine security infrastructure maintenance has been successfully completed. All systems are operational and functioning within normal parameters.",
        },
        {
            id: "info-003",
            title: "Public Safety Communication",
            category: "COMMUNICATION",
            description: "Official public safety channels are active. Ensure you are subscribed to notifications.",
            date: "2025-04-11 16:30:00",
            status: "UPDATED",
            source: "Public Communications Office",
            url: "#",
            content: "All official public safety communication channels are now active. Residents are encouraged to subscribe to notifications for real-time updates on safety advisories.",
        },
        {
            id: "info-004",
            title: "Community Safety Initiative",
            category: "GENERAL",
            description: "Community safety awareness program launched to promote public safety.",
            date: "2025-04-10 14:00:00",
            status: "PUBLISHED",
            source: "Community Affairs",
            url: "#",
            content: "A new community safety awareness initiative has been launched. The program aims to educate residents about safety measures and emergency preparedness.",
        },
        {
            id: "info-005",
            title: "Emergency Communication Systems",
            category: "INFRASTRUCTURE",
            description: "Emergency communication systems testing completed successfully.",
            date: "2025-04-09 11:15:00",
            status: "UPDATED",
            source: "Emergency Services",
            url: "#",
            content: "The emergency communication systems have been tested and are fully operational. All systems are ready for immediate deployment if needed.",
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

    const infoListStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    };

    const infoItemStyle = (expanded: boolean): React.CSSProperties => ({
        background: colors.surface,
        border: `1px solid ${expanded ? colors.accentBlue : colors.border}`,
        padding: expanded ? "1rem" : "0.75rem 1rem",
        cursor: "pointer",
        transition: "all 0.2s",
    });

    const infoHeaderStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    };

    const categoryBadgeStyle = (category: string): React.CSSProperties => {
        let color = colors.textSecondary;
        let bg = colors.surfaceLighter;
        if (category === "ADVISORY") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
        else if (category === "INFRASTRUCTURE") { color = colors.accentGreen; bg = `${colors.accentGreen}15`; }
        else if (category === "COMMUNICATION") { color = colors.accentBlue; bg = `${colors.accentBlue}15`; }
        else if (category === "GENERAL") { color = colors.accentPurple; bg = `${colors.accentPurple}15`; }
        return {
            fontSize: "10px",
            fontWeight: 700,
            color,
            background: bg,
            padding: "0.15rem 0.6rem",
            borderRadius: "3px",
            letterSpacing: "0.3px",
        };
    };

    const statusBadgeStyle = (status: string): React.CSSProperties => {
        let color = colors.textSecondary;
        if (status === "PUBLISHED") color = colors.accentGreen;
        else if (status === "UPDATED") color = colors.accentAmber;
        else if (status === "ARCHIVED") color = colors.textSecondary;
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

    const contentBoxStyle: React.CSSProperties = {
        background: colors.surfaceLighter,
        padding: "0.75rem",
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        marginTop: "0.5rem",
        fontSize: "13px",
        color: colors.textSecondary,
        lineHeight: 1.6,
    };

    const actionButtonsStyle: React.CSSProperties = {
        display: "flex",
        gap: "0.5rem",
        marginTop: "0.75rem",
    };

    const filteredInfo = mockInformation.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "ALL" || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const stats = {
        total: mockInformation.length,
        published: mockInformation.filter(i => i.status === "PUBLISHED").length,
        updated: mockInformation.filter(i => i.status === "UPDATED").length,
        archived: mockInformation.filter(i => i.status === "ARCHIVED").length,
    };

    return (
        <div style={containerStyle}>
            <div style={innerContainerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={headerTitleStyle}>
                        <Info size={28} style={{ display: "inline", marginRight: "12px", color: colors.accentBlue }} />
                        Public Information
                    </div>
                    <div style={headerSubtitleStyle}>
                        Verified public announcements and official information
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
                        <span style={statLabelStyle}>Total Items</span>
                    </div>
                    <div style={{ ...statCardStyle, borderColor: colors.accentGreen }}>
                        <span style={{ ...statValueStyle, color: colors.accentGreen }}>{stats.published}</span>
                        <span style={statLabelStyle}>Published</span>
                    </div>
                    <div style={{ ...statCardStyle, borderColor: colors.accentAmber }}>
                        <span style={{ ...statValueStyle, color: colors.accentAmber }}>{stats.updated}</span>
                        <span style={statLabelStyle}>Updated</span>
                    </div>
                    <div style={{ ...statCardStyle, borderColor: colors.textSecondary }}>
                        <span style={{ ...statValueStyle, color: colors.textSecondary }}>{stats.archived}</span>
                        <span style={statLabelStyle}>Archived</span>
                    </div>
                </div>

                {/* Filters */}
                <div style={filterBarStyle}>
                    <div style={searchContainerStyle}>
                        <Search size={16} color={colors.textSecondary} />
                        <input
                            style={searchInputStyle}
                            placeholder="Search information..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        style={filterSelectStyle}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="ALL">All Categories</option>
                        <option value="ADVISORY">Advisory</option>
                        <option value="INFRASTRUCTURE">Infrastructure</option>
                        <option value="COMMUNICATION">Communication</option>
                        <option value="GENERAL">General</option>
                    </select>

                    <div style={{ fontSize: "12px", color: colors.textSecondary }}>
                        <Filter size={14} style={{ display: "inline", marginRight: "4px" }} />
                        {filteredInfo.length} results
                    </div>
                </div>

                {/* Info List */}
                <div style={infoListStyle}>
                    {filteredInfo.map((item) => (
                        <div
                            key={item.id}
                            style={infoItemStyle(expandedItem === item.id)}
                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        >
                            <div style={infoHeaderStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                                    <span style={categoryBadgeStyle(item.category)}>{item.category}</span>
                                    <span style={{ fontSize: "15px", fontWeight: 600 }}>{item.title}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={statusBadgeStyle(item.status)}>{item.status}</span>
                                    <span style={{ fontSize: "11px", color: colors.textSecondary }}>
                                        {item.date.split(" ")[0]}
                                    </span>
                                    <ChevronRight
                                        size={18}
                                        style={{
                                            transform: expandedItem === item.id ? "rotate(90deg)" : "none",
                                            transition: "transform 0.2s",
                                            color: colors.textSecondary,
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ fontSize: "13px", color: colors.textSecondary, marginTop: "4px" }}>
                                {item.description}
                            </div>

                            {expandedItem === item.id && (
                                <div style={detailsStyle}>
                                    <div style={detailRowStyle}>
                                        <span>Source</span>
                                        <span style={{ color: colors.textPrimary }}>{item.source}</span>
                                    </div>
                                    <div style={detailRowStyle}>
                                        <span>Published</span>
                                        <span style={{ color: colors.textPrimary }}>{item.date}</span>
                                    </div>
                                    {item.url && (
                                        <div style={detailRowStyle}>
                                            <span>Link</span>
                                            <span style={{ color: colors.accentBlue, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                <Link size={14} />
                                                <a href="#" style={{ color: colors.accentBlue, textDecoration: "none" }}>View Source</a>
                                            </span>
                                        </div>
                                    )}
                                    {item.content && (
                                        <div style={contentBoxStyle}>
                                            {item.content}
                                        </div>
                                    )}
                                    <div style={actionButtonsStyle}>
                                        <button style={{
                                            background: colors.surfaceLighter,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: "4px",
                                            padding: "0.3rem 0.75rem",
                                            color: colors.textPrimary,
                                            fontSize: "11px",
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "0.3rem",
                                        }}>
                                            <Eye size={14} />
                                            View Details
                                        </button>
                                        <button style={{
                                            background: colors.surfaceLighter,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: "4px",
                                            padding: "0.3rem 0.75rem",
                                            color: colors.textPrimary,
                                            fontSize: "11px",
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "0.3rem",
                                        }}>
                                            <ExternalLink size={14} />
                                            Share
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

export default UserInformation;