// src/components/Admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  UserPlus,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Shield,

} from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

interface DashboardStats {
  totalBases: number;
  activeBases: number;
  pendingRequests: number;
  totalBaseHeads: number;
}

interface RecentActivity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  status: "success" | "error" | "warning" | "info";
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalBases: 0,
    activeBases: 0,
    pendingRequests: 0,
    totalBaseHeads: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("authToken");
      
      if (!token) {
        navigate("/signin");
        return;
      }

      // Mock data for now - replace with actual API calls
      // In production, use:
      // const response = await fetch(`${APIURL}/admin/dashboard`, {
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      
      // Simulate API response
      setTimeout(() => {
        setStats({
          totalBases: 12,
          activeBases: 8,
          pendingRequests: 3,
          totalBaseHeads: 10,
        });
        setRecentActivities([
          {
            id: "1",
            action: "Base Head Approved",
            details: "Kushagra Chaudhary - Delhi Central Base",
            timestamp: new Date().toISOString(),
            status: "success",
          },
          {
            id: "2",
            action: "New Base Head Request",
            details: "Rahul Sharma - North Base",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: "warning",
          },
          {
            id: "3",
            action: "Base Head Rejected",
            details: "Priya Patel - West Base",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: "error",
          },
          {
            id: "4",
            action: "Admin Login",
            details: "Successful authentication",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            status: "info",
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Failed to load dashboard data");
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

  const statsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "2rem",
  };

  const statCardStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "1rem",
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: 700,
    color: colors.textPrimary,
    lineHeight: 1.2,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 500,
    color: colors.textSecondary,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginTop: "0.25rem",
  };

  const sectionStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "1.25rem",
    marginBottom: "1.5rem",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
    borderBottom: `1px solid ${colors.border}`,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 600,
    color: colors.textPrimary,
  };

  const requestItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem",
    borderBottom: `1px solid ${colors.border}`,
    cursor: "pointer",
    transition: "background 0.15s",
  };

  const requestInfoStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  };

  const requestNameStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    color: colors.textPrimary,
  };

  const requestDetailStyle: React.CSSProperties = {
    fontSize: "12px",
    color: colors.textSecondary,
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    let color = colors.textSecondary;
    let bg = colors.surfaceLighter;
    if (status === "success") { color = colors.accentGreen; bg = `${colors.accentGreen}15`; }
    else if (status === "warning") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
    else if (status === "error") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
    else if (status === "info") { color = colors.accentBlue; bg = `${colors.accentBlue}15`; }
    return {
      fontSize: "10px",
      fontWeight: 600,
      color,
      background: bg,
      padding: "0.15rem 0.5rem",
      borderRadius: "3px",
      letterSpacing: "0.3px",
    };
  };

  const actionButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    padding: "0.3rem 0.75rem",
    color: colors.textSecondary,
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  };

  const viewAllButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: colors.textSecondary,
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  };

  const activityItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem 0",
    borderBottom: `1px solid ${colors.border}`,
  };

  const activityIconStyle = (status: string): React.CSSProperties => {
    let color = colors.textSecondary;
    if (status === "success") color = colors.accentGreen;
    else if (status === "warning") color = colors.accentAmber;
    else if (status === "error") color = colors.accentRed;
    return {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: `${color}15`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    };
  };

  const getActivityIcon = (status: string): React.ReactNode => {
    if (status === "success") return <CheckCircle size={16} color={colors.accentGreen} />;
    if (status === "error") return <XCircle size={16} color={colors.accentRed} />;
    if (status === "warning") return <AlertCircle size={16} color={colors.accentAmber} />;
    return <Clock size={16} color={colors.textSecondary} />;
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
            <Shield size={28} style={{ display: "inline", marginRight: "12px", color: colors.accentGreen }} />
            Administrator Control Center
          </div>
          <div style={headerSubtitleStyle}>
            System-wide oversight and Base Head management
          </div>
        </div>

        {/* Stats */}
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.totalBases}</div>
            <div style={statLabelStyle}>
              <Building2 size={14} style={{ display: "inline", marginRight: "4px" }} />
              Total Bases
            </div>
          </div>
          <div style={{ ...statCardStyle, borderColor: colors.accentGreen }}>
            <div style={{ ...statValueStyle, color: colors.accentGreen }}>{stats.activeBases}</div>
            <div style={statLabelStyle}>
              <Activity size={14} style={{ display: "inline", marginRight: "4px" }} />
              Active Bases
            </div>
          </div>
          <div style={{ ...statCardStyle, borderColor: colors.accentAmber }}>
            <div style={{ ...statValueStyle, color: colors.accentAmber }}>{stats.pendingRequests}</div>
            <div style={statLabelStyle}>
              <UserPlus size={14} style={{ display: "inline", marginRight: "4px" }} />
              Pending Requests
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.totalBaseHeads}</div>
            <div style={statLabelStyle}>
              <Users size={14} style={{ display: "inline", marginRight: "4px" }} />
              Total Base Heads
            </div>
          </div>
        </div>

        {/* Base Head Approvals */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionTitleStyle}>
              <UserPlus size={18} style={{ display: "inline", marginRight: "8px" }} />
              Base Head Approvals
            </div>
            <button 
              style={viewAllButtonStyle}
              onClick={() => navigate("/admin/head-requests")}
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          {stats.pendingRequests > 0 ? (
            <>
              <div style={requestItemStyle}>
                <div style={requestInfoStyle}>
                  <div style={requestNameStyle}>Kushagra Chaudhary</div>
                  <div style={requestDetailStyle}>Delhi Central Base • kushagra@example.com</div>
                  <div style={{ fontSize: "11px", color: colors.textSecondary }}>
                    Requested: 2 hours ago
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={statusBadgeStyle("warning")}>PENDING</span>
                  <button style={actionButtonStyle}>View</button>
                </div>
              </div>
              <div style={requestItemStyle}>
                <div style={requestInfoStyle}>
                  <div style={requestNameStyle}>Rahul Sharma</div>
                  <div style={requestDetailStyle}>North Base • rahul@example.com</div>
                  <div style={{ fontSize: "11px", color: colors.textSecondary }}>
                    Requested: 4 hours ago
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={statusBadgeStyle("warning")}>PENDING</span>
                  <button style={actionButtonStyle}>View</button>
                </div>
              </div>
              <div style={requestItemStyle}>
                <div style={requestInfoStyle}>
                  <div style={requestNameStyle}>Priya Patel</div>
                  <div style={requestDetailStyle}>West Base • priya@example.com</div>
                  <div style={{ fontSize: "11px", color: colors.textSecondary }}>
                    Requested: 6 hours ago
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={statusBadgeStyle("warning")}>PENDING</span>
                  <button style={actionButtonStyle}>View</button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0", color: colors.textSecondary }}>
              <CheckCircle size={32} style={{ marginBottom: "0.5rem" }} />
              <div>No pending Base Head requests</div>
            </div>
          )}
        </div>

        {/* Base Overview */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionTitleStyle}>
              <Building2 size={18} style={{ display: "inline", marginRight: "8px" }} />
              Base Overview
            </div>
            <button 
              style={viewAllButtonStyle}
              onClick={() => navigate("/admin/bases")}
            >
              View All Bases <ChevronRight size={16} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <div style={{ padding: "0.75rem", background: colors.surfaceLighter, border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>Delhi Central Base</div>
              <div style={{ fontSize: "11px", color: colors.textSecondary }}>Head: Kushagra C.</div>
              <div style={{ fontSize: "11px", color: colors.textSecondary }}>Status: <span style={{ color: colors.accentGreen }}>ACTIVE</span></div>
            </div>
            <div style={{ padding: "0.75rem", background: colors.surfaceLighter, border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>North Base</div>
              <div style={{ fontSize: "11px", color: colors.textSecondary }}>Head: Rahul S.</div>
              <div style={{ fontSize: "11px", color: colors.textSecondary }}>Status: <span style={{ color: colors.accentGreen }}>ACTIVE</span></div>
            </div>
            <div style={{ padding: "0.75rem", background: colors.surfaceLighter, border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>West Base</div>
              <div style={{ fontSize: "11px", color: colors.textSecondary }}>Head: Priya P.</div>
              <div style={{ fontSize: "11px", color: colors.textSecondary }}>Status: <span style={{ color: colors.accentAmber }}>PENDING</span></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionTitleStyle}>
              <Clock size={18} style={{ display: "inline", marginRight: "8px" }} />
              Recent Administrative Activity
            </div>
          </div>
          <div>
            {recentActivities.map((activity) => (
              <div key={activity.id} style={activityItemStyle}>
                <div style={activityIconStyle(activity.status)}>
                  {getActivityIcon(activity.status)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500 }}>{activity.action}</div>
                  <div style={{ fontSize: "12px", color: colors.textSecondary }}>{activity.details}</div>
                </div>
                <div style={{ fontSize: "11px", color: colors.textSecondary }}>
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;