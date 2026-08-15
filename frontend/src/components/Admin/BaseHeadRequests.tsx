// src/components/Admin/BaseHeadRequests.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  Building2,

} from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

interface BaseHeadRequest {
  id: string;
  name: string;
  email: string;
  baseId?: string;
  baseName?: string;
  registrationDate: string;
  status: "pending" | "approved" | "rejected";
  authProvider: string;
}

const BaseHeadRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BaseHeadRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    id: string;
    action: "approve" | "reject";
  } | null>(null);

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
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("authToken");
      
      if (!token) {
        navigate("/signin");
        return;
      }

      // Mock data - replace with actual API call
      // const response = await fetch(`${APIURL}/admin/head-requests`, {
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      // const data = await response.json();
      
      setTimeout(() => {
        setRequests([
          {
            id: "req-001",
            name: "Kushagra Chaudhary",
            email: "kushagra@example.com",
            baseId: "base-001",
            baseName: "Delhi Central Base",
            registrationDate: "2025-04-13T10:30:00Z",
            status: "pending",
            authProvider: "google",
          },
          {
            id: "req-002",
            name: "Rahul Sharma",
            email: "rahul@example.com",
            baseId: "base-002",
            baseName: "North Base",
            registrationDate: "2025-04-13T08:15:00Z",
            status: "pending",
            authProvider: "google",
          },
          {
            id: "req-003",
            name: "Priya Patel",
            email: "priya@example.com",
            baseId: "base-003",
            baseName: "West Base",
            registrationDate: "2025-04-12T16:45:00Z",
            status: "pending",
            authProvider: "google",
          },
          {
            id: "req-004",
            name: "Amit Kumar",
            email: "amit@example.com",
            baseId: "base-004",
            baseName: "East Base",
            registrationDate: "2025-04-12T14:20:00Z",
            status: "approved",
            authProvider: "google",
          },
          {
            id: "req-005",
            name: "Sneha Reddy",
            email: "sneha@example.com",
            baseId: "base-005",
            baseName: "South Base",
            registrationDate: "2025-04-11T11:00:00Z",
            status: "rejected",
            authProvider: "google",
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Failed to load requests");
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      const token = sessionStorage.getItem("authToken");
      
      // const response = await fetch(`${APIURL}/admin/head-requests/${id}/approve`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      
      // if (response.ok) {
        setRequests(prev => 
          prev.map(req => 
            req.id === id ? { ...req, status: "approved" } : req
          )
        );
        setShowConfirmDialog(null);
        setSelectedRequest(null);
      // }
    } catch (err) {
      console.error("Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);
      const token = sessionStorage.getItem("authToken");
      
      // const response = await fetch(`${APIURL}/admin/head-requests/${id}/reject`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      
      // if (response.ok) {
        setRequests(prev => 
          prev.map(req => 
            req.id === id ? { ...req, status: "rejected" } : req
          )
        );
        setShowConfirmDialog(null);
        setSelectedRequest(null);
      // }
    } catch (err) {
      console.error("Failed to reject request");
    } finally {
      setProcessingId(null);
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

  const requestListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  };

  const requestCardStyle = (status: string): React.CSSProperties => {
    let borderColor = colors.border;
    if (status === "pending") borderColor = colors.accentAmber;
    else if (status === "approved") borderColor = colors.accentGreen;
    else if (status === "rejected") borderColor = colors.accentRed;
    return {
      background: colors.surface,
      border: `1px solid ${borderColor}`,
      borderLeft: `4px solid ${borderColor}`,
      padding: "1rem",
    };
  };

  const requestHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  };

  const requestNameStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 600,
    color: colors.textPrimary,
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    let color = colors.textSecondary;
    let bg = colors.surfaceLighter;
    if (status === "pending") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
    else if (status === "approved") { color = colors.accentGreen; bg = `${colors.accentGreen}15`; }
    else if (status === "rejected") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
    return {
      fontSize: "10px",
      fontWeight: 600,
      color,
      background: bg,
      padding: "0.15rem 0.6rem",
      borderRadius: "3px",
      letterSpacing: "0.3px",
    };
  };

  const requestDetailsStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const detailItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "12px",
    color: colors.textSecondary,
  };

  const actionButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.75rem",
    paddingTop: "0.75rem",
    borderTop: `1px solid ${colors.border}`,
  };

  const actionButtonStyle = (variant: "approve" | "reject" | "view"): React.CSSProperties => {
    let bg = colors.surfaceLighter;
    let color = colors.textSecondary;
    let border = colors.border;
    if (variant === "approve") { bg = `${colors.accentGreen}15`; color = colors.accentGreen; border = colors.accentGreen; }
    if (variant === "reject") { bg = `${colors.accentRed}15`; color = colors.accentRed; border = colors.accentRed; }
    return {
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: "4px",
      padding: "0.3rem 0.75rem",
      color,
      fontSize: "12px",
      cursor: "pointer",
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      gap: "0.3rem",
      transition: "all 0.15s",
    };
  };

  // Confirm Dialog
  const confirmDialogStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  };

  const confirmDialogContentStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "2rem",
    maxWidth: "400px",
    width: "100%",
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (req.baseName && req.baseName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "ALL" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;

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
            <UserPlus size={28} style={{ display: "inline", marginRight: "12px", color: colors.accentAmber }} />
            Base Head Requests
          </div>
          <div style={headerSubtitleStyle}>
            Manage and approve Base Head applications
          </div>
        </div>

        {/* Stats */}
        <div style={statsStyle}>
          <div style={statItemStyle}>
            <Users size={16} color={colors.textSecondary} />
            <span>Total: <strong>{requests.length}</strong></span>
          </div>
          <div style={statItemStyle}>
            <Clock size={16} color={colors.accentAmber} />
            <span>Pending: <strong style={{ color: colors.accentAmber }}>{pendingCount}</strong></span>
          </div>
          <div style={statItemStyle}>
            <CheckCircle size={16} color={colors.accentGreen} />
            <span>Approved: <strong style={{ color: colors.accentGreen }}>{requests.filter(r => r.status === "approved").length}</strong></span>
          </div>
          <div style={statItemStyle}>
            <XCircle size={16} color={colors.accentRed} />
            <span>Rejected: <strong style={{ color: colors.accentRed }}>{requests.filter(r => r.status === "rejected").length}</strong></span>
          </div>
        </div>

        {/* Filters */}
        <div style={filterBarStyle}>
          <div style={searchContainerStyle}>
            <Search size={16} color={colors.textSecondary} />
            <input
              style={searchInputStyle}
              placeholder="Search requests..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <div style={{ fontSize: "12px", color: colors.textSecondary }}>
            <Filter size={14} style={{ display: "inline", marginRight: "4px" }} />
            {filteredRequests.length} results
          </div>
        </div>

        {/* Request List */}
        <div style={requestListStyle}>
          {filteredRequests.map((request) => (
            <div key={request.id} style={requestCardStyle(request.status)}>
              <div style={requestHeaderStyle}>
                <div>
                  <div style={requestNameStyle}>{request.name}</div>
                  <div style={{ fontSize: "12px", color: colors.textSecondary }}>
                    {request.email}
                  </div>
                </div>
                <span style={statusBadgeStyle(request.status)}>
                  {request.status.toUpperCase()}
                </span>
              </div>

              <div style={requestDetailsStyle}>
                <div style={detailItemStyle}>
                  <Building2 size={14} />
                  <span>{request.baseName || "No base assigned"}</span>
                </div>
                <div style={detailItemStyle}>
                  <Mail size={14} />
                  <span>{request.authProvider}</span>
                </div>
                <div style={detailItemStyle}>
                  <Calendar size={14} />
                  <span>{new Date(request.registrationDate).toLocaleString()}</span>
                </div>
              </div>

              {request.status === "pending" && (
                <div style={actionButtonsStyle}>
                  <button
                    style={actionButtonStyle("view")}
                    onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                  <button
                    style={actionButtonStyle("approve")}
                    onClick={() => setShowConfirmDialog({ id: request.id, action: "approve" })}
                    disabled={processingId === request.id}
                  >
                    <CheckCircle size={14} />
                    Approve
                  </button>
                  <button
                    style={actionButtonStyle("reject")}
                    onClick={() => setShowConfirmDialog({ id: request.id, action: "reject" })}
                    disabled={processingId === request.id}
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                </div>
              )}

              {selectedRequest === request.id && request.status === "pending" && (
                <div style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem",
                  background: colors.surfaceLighter,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                }}>
                  <div style={{ fontSize: "12px", color: colors.textSecondary }}>
                    <strong>Additional Details:</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: colors.textSecondary, marginTop: "0.25rem" }}>
                    <div>Base ID: {request.baseId || "Not assigned"}</div>
                    <div>Registration: {new Date(request.registrationDate).toLocaleString()}</div>
                    <div>Auth Provider: {request.authProvider}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Confirm Dialog */}
        {showConfirmDialog && (
          <div style={confirmDialogStyle}>
            <div style={confirmDialogContentStyle}>
              <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "0.5rem" }}>
                {showConfirmDialog.action === "approve" ? "Approve Request" : "Reject Request"}
              </div>
              <div style={{ fontSize: "14px", color: colors.textSecondary, marginBottom: "1.5rem" }}>
                {showConfirmDialog.action === "approve" 
                  ? "Are you sure you want to approve this Base Head request?" 
                  : "Are you sure you want to reject this Base Head request?"}
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  style={actionButtonStyle("view")}
                  onClick={() => setShowConfirmDialog(null)}
                >
                  Cancel
                </button>
                <button
                  style={showConfirmDialog.action === "approve" ? actionButtonStyle("approve") : actionButtonStyle("reject")}
                  onClick={() => {
                    if (showConfirmDialog.action === "approve") {
                      handleApprove(showConfirmDialog.id);
                    } else {
                      handleReject(showConfirmDialog.id);
                    }
                  }}
                  disabled={processingId === showConfirmDialog.id}
                >
                  {processingId === showConfirmDialog.id ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseHeadRequests;