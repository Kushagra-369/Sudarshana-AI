// src/components/Admin/BasesOverview.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    Search,
    Filter,
    MapPin,
    Users,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,

    Eye,
    User,
    Mail,
} from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

interface Base {
    id: string;
    name: string;
    baseId: string;
    headName: string;
    headEmail: string;
    location: string;
    status: "active" | "inactive" | "pending";
    personnelCount: number;
    createdAt: string;
    updatedAt: string;
}

const BasesOverview: React.FC = () => {
    const navigate = useNavigate();
    const [bases, setBases] = useState<Base[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [selectedBase, setSelectedBase] = useState<string | null>(null);

    const colors = {
        bg: "#080D0C",
        surface: "#111A16",
        surfaceLighter: "#1A2622",
        border: "#26352D",
        borderLight: "#354A40",
        textPrimary: "#E6E8E3",
        textSecondary: "#8C9890",
        accentGreen: "#6FAF72",
        accentAmber: "#D6A84F",
        accentRed: "#D9534F",
        accentBlue: "#4A8C9E",
    };

    useEffect(() => {
        fetchBases();
    }, []);

    const fetchBases = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("authToken");

            if (!token) {
                navigate("/signin");
                return;
            }

            // Mock data - replace with actual API call
            // const response = await fetch(`${APIURL}/admin/bases`, {
            //   headers: {
            //     "Authorization": `Bearer ${token}`,
            //     "Content-Type": "application/json"
            //   }
            // });
            // const data = await response.json();

            setTimeout(() => {
                setBases([
                    {
                        id: "base-001",
                        name: "Delhi Central Base",
                        baseId: "BC-001",
                        headName: "Kushagra Chaudhary",
                        headEmail: "kushagra@example.com",
                        location: "Delhi, India",
                        status: "active",
                        personnelCount: 15,
                        createdAt: "2025-01-15T10:30:00Z",
                        updatedAt: "2025-04-13T14:32:00Z",
                    },
                    {
                        id: "base-002",
                        name: "North Base",
                        baseId: "BC-002",
                        headName: "Rahul Sharma",
                        headEmail: "rahul@example.com",
                        location: "Chandigarh, India",
                        status: "active",
                        personnelCount: 12,
                        createdAt: "2025-02-01T09:15:00Z",
                        updatedAt: "2025-04-12T11:20:00Z",
                    },
                    {
                        id: "base-003",
                        name: "West Base",
                        baseId: "BC-003",
                        headName: "Priya Patel",
                        headEmail: "priya@example.com",
                        location: "Mumbai, India",
                        status: "pending",
                        personnelCount: 8,
                        createdAt: "2025-03-10T14:45:00Z",
                        updatedAt: "2025-04-11T16:30:00Z",
                    },
                    {
                        id: "base-004",
                        name: "East Base",
                        baseId: "BC-004",
                        headName: "Amit Kumar",
                        headEmail: "amit@example.com",
                        location: "Kolkata, India",
                        status: "active",
                        personnelCount: 10,
                        createdAt: "2025-02-20T11:00:00Z",
                        updatedAt: "2025-04-10T09:45:00Z",
                    },
                    {
                        id: "base-005",
                        name: "South Base",
                        baseId: "BC-005",
                        headName: "Sneha Reddy",
                        headEmail: "sneha@example.com",
                        location: "Hyderabad, India",
                        status: "inactive",
                        personnelCount: 6,
                        createdAt: "2025-03-25T08:20:00Z",
                        updatedAt: "2025-04-09T10:15:00Z",
                    },
                ]);
                setLoading(false);
            }, 500);
        } catch (err) {
            setError("Failed to load bases");
            setLoading(false);
        }
    };

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

    const statsStyle: React.CSSProperties = {
        display: "flex",
        gap: "1.5rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
    };

    const statItemStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "13px",
    };

    const detailItemStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.65rem",
        background: colors.surfaceLighter,
        border: `1px solid ${colors.border}`,
        borderRadius: "6px",
        color: colors.textSecondary,
        fontSize: "12px",
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

    const tableContainerStyle: React.CSSProperties = {
        overflowX: "auto",
        border: `1px solid ${colors.border}`,
    };

    const tableStyle: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13px",
    };

    const thStyle: React.CSSProperties = {
        padding: "0.75rem 1rem",
        textAlign: "left",
        fontWeight: 600,
        color: colors.textSecondary,
        borderBottom: `2px solid ${colors.border}`,
        background: colors.surface,
        fontSize: "11px",
        letterSpacing: "0.3px",
        textTransform: "uppercase",
    };

    const tdStyle: React.CSSProperties = {
        padding: "0.75rem 1rem",
        borderBottom: `1px solid ${colors.border}`,
        color: colors.textSecondary,
    };

    const baseNameStyle: React.CSSProperties = {
        fontWeight: 600,
        color: colors.textPrimary,
    };

    const statusBadgeStyle = (status: string): React.CSSProperties => {
        let color = colors.textSecondary;
        let bg = colors.surfaceLighter;
        if (status === "active") { color = colors.accentGreen; bg = `${colors.accentGreen}15`; }
        else if (status === "pending") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
        else if (status === "inactive") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
        return {
            fontSize: "10px",
            fontWeight: 600,
            color,
            background: bg,
            padding: "0.15rem 0.6rem",
            borderRadius: "3px",
            letterSpacing: "0.3px",
            display: "inline-block",
        };
    };

    const viewButtonStyle: React.CSSProperties = {
        background: "transparent",
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        padding: "0.2rem 0.6rem",
        color: colors.textSecondary,
        fontSize: "11px",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
    };

    const filteredBases = bases.filter(base => {
        const matchesSearch = base.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            base.baseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            base.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            base.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "ALL" || base.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: bases.length,
        active: bases.filter(b => b.status === "active").length,
        pending: bases.filter(b => b.status === "pending").length,
        inactive: bases.filter(b => b.status === "inactive").length,
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={innerContainerStyle}>
                    <div style={{ textAlign: "center", padding: "4rem 0", color: colors.textSecondary }}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={innerContainerStyle}>
                    <div style={{ textAlign: "center", padding: "4rem 0", color: colors.accentRed }}>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={innerContainerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={headerTitleStyle}>
                        <Building2 size={28} style={{ display: "inline", marginRight: "12px", color: colors.accentBlue }} />
                        Bases Overview
                    </div>
                    <div style={headerSubtitleStyle}>
                        System-wide base information and status
                    </div>
                </div>

                {/* Stats */}
                <div style={statsStyle}>
                    <div style={statItemStyle}>
                        <Building2 size={16} color={colors.textSecondary} />
                        <span>Total: <strong>{stats.total}</strong></span>
                    </div>
                    <div style={statItemStyle}>
                        <CheckCircle size={16} color={colors.accentGreen} />
                        <span>Active: <strong style={{ color: colors.accentGreen }}>{stats.active}</strong></span>
                    </div>
                    <div style={statItemStyle}>
                        <Clock size={16} color={colors.accentAmber} />
                        <span>Pending: <strong style={{ color: colors.accentAmber }}>{stats.pending}</strong></span>
                    </div>
                    <div style={statItemStyle}>
                        <XCircle size={16} color={colors.accentRed} />
                        <span>Inactive: <strong style={{ color: colors.accentRed }}>{stats.inactive}</strong></span>
                    </div>
                </div>

                {/* Filters */}
                <div style={filterBarStyle}>
                    <div style={searchContainerStyle}>
                        <Search size={16} color={colors.textSecondary} />
                        <input
                            style={searchInputStyle}
                            placeholder="Search bases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        style={filterSelectStyle}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <div style={{ fontSize: "12px", color: colors.textSecondary }}>
                        <Filter size={14} style={{ display: "inline", marginRight: "4px" }} />
                        {filteredBases.length} results
                    </div>
                </div>

                {/* Table */}
                <div style={tableContainerStyle}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Base</th>
                                <th style={thStyle}>Base ID</th>
                                <th style={thStyle}>Head</th>
                                <th style={thStyle}>Location</th>
                                <th style={thStyle}>Personnel</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Created</th>
                                <th style={thStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBases.map((base) => (
                                <tr key={base.id}>
                                    <td style={tdStyle}>
                                        <span style={baseNameStyle}>{base.name}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontSize: "12px", color: colors.textSecondary }}>{base.baseId}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span style={{ color: colors.textPrimary, fontSize: "12px" }}>{base.headName}</span>
                                            <span style={{ fontSize: "10px", color: colors.textSecondary }}>{base.headEmail}</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "12px" }}>
                                            <MapPin size={12} />
                                            {base.location}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "12px" }}>
                                            <Users size={12} />
                                            {base.personnelCount}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={statusBadgeStyle(base.status)}>
                                            {base.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontSize: "11px", color: colors.textSecondary }}>
                                            {new Date(base.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            style={viewButtonStyle}
                                            onClick={() => setSelectedBase(selectedBase === base.id ? null : base.id)}
                                        >
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Expanded Details */}
                {selectedBase && (
                    <div style={{
                        marginTop: "1.5rem",
                        padding: "1rem",
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                    }}>
                        <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "0.5rem" }}>
                            {bases.find(b => b.id === selectedBase)?.name} - Details
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
                            <div style={detailItemStyle}>
                                <Building2 size={14} />
                                <span>Base ID: {bases.find(b => b.id === selectedBase)?.baseId}</span>
                            </div>
                            <div style={detailItemStyle}>
                                <User size={14} />
                                <span>Head: {bases.find(b => b.id === selectedBase)?.headName}</span>
                            </div>
                            <div style={detailItemStyle}>
                                <Mail size={14} />
                                <span>Email: {bases.find(b => b.id === selectedBase)?.headEmail}</span>
                            </div>
                            <div style={detailItemStyle}>
                                <MapPin size={14} />
                                <span>Location: {bases.find(b => b.id === selectedBase)?.location}</span>
                            </div>
                            <div style={detailItemStyle}>
                                <Users size={14} />
                                <span>Personnel: {bases.find(b => b.id === selectedBase)?.personnelCount}</span>
                            </div>
                            <div style={detailItemStyle}>
                                <Calendar size={14} />
                                <span>Created: {new Date(bases.find(b => b.id === selectedBase)?.createdAt || "").toLocaleString()}</span>
                            </div>
                            <div style={detailItemStyle}>
                                <Calendar size={14} />
                                <span>Updated: {new Date(bases.find(b => b.id === selectedBase)?.updatedAt || "").toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BasesOverview;