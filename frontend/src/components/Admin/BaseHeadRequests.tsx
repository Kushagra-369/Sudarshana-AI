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
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  authProvider: string;
  createdAt: string;

  base?: {
    id: string;
    name: string;
    baseCode: string;
    type: string;
    location: string;
    address: string;
    status: string;
    contactNumber?: string;
    officialEmail?: string;
    establishedDate?: string;
    personnelCount?: number;
    personnelCapacity?: number;
    emergencyContact?: string;
    description?: string;
  };
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
      setError(null);

      const token = sessionStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(
        `${APIURL}/admin/head-requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError(
            data.message ||
            "You are not authorized to view Base Head requests."
          );
          return;
        }

        setError(
          data.message ||
          "Failed to load Base Head requests."
        );

        return;
      }

      const formattedRequests: BaseHeadRequest[] =
        (data.requests || []).map((request: any) => {

          // Backend may return user details nested
          // or directly inside request.
          const user = request.user || request.userDetails || request;

          return {
            id: String(
              user.id ||
              user._id ||
              request.id ||
              request._id ||
              ""
            ),

            name:
              user.name ||
              "Unknown",

            email:
              user.email ||
              "No email",

            status:
              user.status ||
              request.status ||
              "PENDING",

            authProvider:
              user.authProvider ||
              request.authProvider ||
              "UNKNOWN",

            createdAt:
              user.createdAt ||
              request.createdAt ||
              "",

            base: request.base
              ? {
                id: String(
                  request.base.id ||
                  request.base._id ||
                  ""
                ),

                name:
                  request.base.name ||
                  "",

                baseCode:
                  request.base.baseCode ||
                  "",

                type:
                  request.base.type ||
                  "",

                location:
                  request.base.location ||
                  "",

                address:
                  request.base.address ||
                  "",

                status:
                  request.base.status ||
                  "",

                contactNumber:
                  request.base.contactNumber,

                officialEmail:
                  request.base.officialEmail,

                establishedDate:
                  request.base.establishedDate,

                personnelCount:
                  request.base.personnelCount,

                personnelCapacity:
                  request.base.personnelCapacity,

                emergencyContact:
                  request.base.emergencyContact,

                description:
                  request.base.description,
              }
              : undefined,
          };
        });

      setRequests(formattedRequests);

    } catch (err) {
      console.error(
        "Fetch Base Head Requests Error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);

      const token =
        sessionStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(
        `${APIURL}/admin/head-requests/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
          "Failed to approve Base Head request."
        );
        return;
      }

      // Remove request from current pending list
      setRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? {
              ...request,
              status: "APPROVED",
            }
            : request
        )
      );

      setShowConfirmDialog(null);
      setSelectedRequest(null);

      // Refresh from database
      await fetchRequests();

    } catch (err) {
      console.error(
        "Approve Base Head Error:",
        err
      );

      setError(
        "Unable to approve Base Head request."
      );

    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);

      const token =
        sessionStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(
        `${APIURL}/admin/head-requests/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
          "Failed to reject Base Head request."
        );
        return;
      }

      setRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? {
              ...request,
              status: "REJECTED",
            }
            : request
        )
      );

      setShowConfirmDialog(null);
      setSelectedRequest(null);

      await fetchRequests();

    } catch (err) {
      console.error(
        "Reject Base Head Error:",
        err
      );

      setError(
        "Unable to reject Base Head request."
      );

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
    if (status === "PENDING") borderColor = colors.accentAmber;
    else if (status === "APPROVED") borderColor = colors.accentGreen;
    else if (status === "REJECTED") borderColor = colors.accentRed;
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
    if (status === "PENDING") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
    else if (status === "APPROVED") { color = colors.accentGreen; bg = `${colors.accentGreen}15`; }
    else if (status === "REJECTED") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
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

  const filteredRequests = requests.filter((req) => {
    const search = searchTerm.trim().toLowerCase();

    const name = String(req.name ?? "").toLowerCase();
    const email = String(req.email ?? "").toLowerCase();

    const baseName = String(
      req.base?.name ?? ""
    ).toLowerCase();

    const baseCode = String(
      req.base?.baseCode ?? ""
    ).toLowerCase();

    const location = String(
      req.base?.location ?? ""
    ).toLowerCase();

    const matchesSearch =
      name.includes(search) ||
      email.includes(search) ||
      baseName.includes(search) ||
      baseCode.includes(search) ||
      location.includes(search);

    const matchesStatus =
      filterStatus === "ALL" ||
      req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const pendingCount =
    requests.filter(
      r => r.status === "PENDING"
    ).length;

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
            <CheckCircle
              size={16}
              color={colors.accentGreen}
            />
            <span>Approved:{" "}<strong style={{ color: colors.accentGreen, }}>{requests.filter(r => r.status === "APPROVED").length}</strong>
            </span>
          </div>
          <div style={statItemStyle}>
            <XCircle
              size={16}
              color={colors.accentRed}
            />

            <span>
              Rejected:{" "}
              <strong
                style={{
                  color: colors.accentRed,
                }}
              >
                {
                  requests.filter(
                    r => r.status === "REJECTED"
                  ).length
                }
              </strong>
            </span>
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
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
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
                <span style={statusBadgeStyle(request.status || "PENDING")}>
                  {(request.status || "PENDING").toUpperCase()}
                </span>
              </div>

              <div style={requestDetailsStyle}>
                <div style={detailItemStyle}>
                  <Building2 size={14} />
                  <span>
                    {request.base?.name || "Base details not submitted"}
                  </span>
                </div>

                <div style={detailItemStyle}>
                  <Mail size={14} />
                  <span>
                    {request.authProvider}
                  </span>
                </div>

                <div style={detailItemStyle}>
                  <Calendar size={14} />
                  <span>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              {request.status === "PENDING" && (
                <div style={actionButtonsStyle}>
                  <button
                    style={actionButtonStyle("view")}
                    onClick={() =>
                      setSelectedRequest(
                        selectedRequest === request.id
                          ? null
                          : request.id
                      )
                    }
                  >
                    <Eye size={14} />
                    View Details
                  </button>

                  <button
                    style={actionButtonStyle("approve")}
                    onClick={() =>
                      setShowConfirmDialog({
                        id: request.id,
                        action: "approve",
                      })
                    }
                    disabled={processingId === request.id}
                  >
                    <CheckCircle size={14} />
                    {processingId === request.id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    style={actionButtonStyle("reject")}
                    onClick={() =>
                      setShowConfirmDialog({
                        id: request.id,
                        action: "reject",
                      })
                    }
                    disabled={processingId === request.id}
                  >
                    <XCircle size={14} />
                    {processingId === request.id
                      ? "Processing..."
                      : "Reject"}
                  </button>
                </div>
              )}

              {selectedRequest === request.id &&
                request.status === "PENDING" && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.75rem",
                      background: colors.surfaceLighter,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: colors.textSecondary,
                      }}
                    >
                      <strong>Base Details:</strong>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: colors.textSecondary,
                        marginTop: "0.5rem",
                        lineHeight: 1.8,
                      }}
                    >
                      <div>
                        <strong>Base Name:</strong>{" "}
                        {request.base?.name || "N/A"}
                      </div>

                      <div>
                        <strong>Base Code:</strong>{" "}
                        {request.base?.baseCode || "N/A"}
                      </div>

                      <div>
                        <strong>Type:</strong>{" "}
                        {request.base?.type || "N/A"}
                      </div>

                      <div>
                        <strong>Location:</strong>{" "}
                        {request.base?.location || "N/A"}
                      </div>

                      <div>
                        <strong>Address:</strong>{" "}
                        {request.base?.address || "N/A"}
                      </div>

                      <div>
                        <strong>Contact:</strong>{" "}
                        {request.base?.contactNumber || "N/A"}
                      </div>

                      <div>
                        <strong>Official Email:</strong>{" "}
                        {request.base?.officialEmail || "N/A"}
                      </div>

                      <div>
                        <strong>Personnel:</strong>{" "}
                        {request.base?.personnelCount ?? 0}
                        {request.base?.personnelCapacity
                          ? ` / ${request.base.personnelCapacity}`
                          : ""}
                      </div>

                      <div>
                        <strong>Emergency Contact:</strong>{" "}
                        {request.base?.emergencyContact || "N/A"}
                      </div>

                      <div>
                        <strong>Registration:</strong>{" "}
                        {request.createdAt
                          ? new Date(
                            request.createdAt
                          ).toLocaleString()
                          : "N/A"}
                      </div>

                      <div>
                        <strong>Auth Provider:</strong>{" "}
                        {request.authProvider}
                      </div>

                      {request.base?.description && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <strong>Description:</strong>{" "}
                          {request.base.description}
                        </div>
                      )}
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