// src/components/BaseHead/BaseSetup.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {

  AlertCircle,
  CheckCircle,
  Clock,

  Save,
} from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

interface BaseSetupForm {
  name: string;
  baseCode: string;
  type: string;
  location: string;
  address: string;
  contactNumber: string;
  officialEmail: string;
  establishedDate: string;
  personnelCount: number;
  personnelCapacity: number;
  emergencyContact: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  baseId?: string;
}

const BaseSetup: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<BaseSetupForm>({
    name: "",
    baseCode: "",
    type: "DISTRICT",
    location: "",
    address: "",
    contactNumber: "",
    officialEmail: "",
    establishedDate: "",
    personnelCount: 0,
    personnelCapacity: 0,
    emergencyContact: "",
    description: "",
  });

  const baseTypes = [
    "HEADQUARTERS",
    "REGIONAL",
    "DISTRICT",
    "FIELD",
    "TRAINING",
  ];

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
    const authUser = sessionStorage.getItem("authUser");
    const token = sessionStorage.getItem("authToken");

    if (!authUser || !token) {
      navigate("/signin");
      return;
    }

    try {
      const parsedUser = JSON.parse(authUser);
      setUser(parsedUser);

      // Check if user already has a base
      checkExistingBase(token);
    } catch (err) {
      navigate("/signin");
    }
  }, [navigate]);

  const checkExistingBase = async (token: string) => {
    try {
      const response = await fetch(`${APIURL}/base/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        // User already has a base, redirect to waiting page
        navigate("/waiting-for-approval");
      }
      // 404 means no base yet, which is fine
    } catch (err) {
      // Network error, but we'll still show the form
      console.error("Failed to check existing base:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "personnelCount" || name === "personnelCapacity"
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      // Validate required fields
      if (!formData.name.trim()) {
        setError("Base name is required");
        setLoading(false);
        return;
      }
      if (!formData.baseCode.trim()) {
        setError("Base code is required");
        setLoading(false);
        return;
      }
      if (!formData.type) {
        setError("Base type is required");
        setLoading(false);
        return;
      }
      if (!formData.location.trim()) {
        setError("Location is required");
        setLoading(false);
        return;
      }
      if (!formData.address.trim()) {
        setError("Address is required");
        setLoading(false);
        return;
      }

      const response = await fetch(`${APIURL}/base/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          personnelCount: formData.personnelCount || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit base information");
      }

      setSuccess(true);
      
      // Update user info if needed
      if (data.user) {
        sessionStorage.setItem("authUser", JSON.stringify(data.user));
      }

      setTimeout(() => {
        navigate("/waiting-for-approval");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    background: colors.bg,
    minHeight: "calc(100vh - 64px)",
    padding: "2rem 1.5rem",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.textPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const formContainerStyle: React.CSSProperties = {
    maxWidth: "800px",
    width: "100%",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "2rem",
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

  const statusBannerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    background: `${colors.accentAmber}15`,
    border: `1px solid ${colors.accentAmber}`,
    borderRadius: "4px",
    marginBottom: "1.5rem",
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  };

  const fullWidthStyle: React.CSSProperties = {
    gridColumn: "1 / -1",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 500,
    color: colors.textSecondary,
    letterSpacing: "0.3px",
    textTransform: "uppercase",
    marginBottom: "0.25rem",
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    color: colors.textPrimary,
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: "80px",
    resize: "vertical",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
  };

  const errorStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    background: `${colors.accentRed}15`,
    border: `1px solid ${colors.accentRed}`,
    borderRadius: "4px",
    color: colors.accentRed,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const successStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    background: `${colors.accentGreen}15`,
    border: `1px solid ${colors.accentGreen}`,
    borderRadius: "4px",
    color: colors.accentGreen,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0.6rem 1.5rem",
    background: colors.accentGreen,
    border: "none",
    borderRadius: "4px",
    color: colors.textPrimary,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    justifyContent: "center",
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.6,
    cursor: "not-allowed",
  };

  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={formContainerStyle}>
          <div style={{ textAlign: "center", color: colors.textSecondary }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={headerTitleStyle}>Base Registration</div>
          <div style={headerSubtitleStyle}>
            Submit your base information for administrator review.
          </div>
        </div>

        {/* Status Banner */}
        <div style={statusBannerStyle}>
          <Clock size={18} color={colors.accentAmber} />
          <div>
            <span style={{ fontWeight: 600, color: colors.accentAmber }}>
              ADMINISTRATOR APPROVAL REQUIRED
            </span>
            <span style={{ color: colors.textSecondary, marginLeft: "0.5rem" }}>
              Your base information must be reviewed by an administrator.
            </span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={errorStyle}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        {success && (
          <div style={successStyle}>
            <CheckCircle size={18} />
            Base information submitted successfully! Redirecting...
          </div>
        )}

        {/* Form */}
        <form style={formStyle} onSubmit={handleSubmit}>
          <div style={gridStyle}>
            {/* Base Name */}
            <div style={fullWidthStyle}>
              <label style={labelStyle}>
                Base Name <span style={{ color: colors.accentRed }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Enter base name"
                required
                disabled={loading || success}
              />
            </div>

            {/* Base Code */}
            <div>
              <label style={labelStyle}>
                Base Code <span style={{ color: colors.accentRed }}>*</span>
              </label>
              <input
                type="text"
                name="baseCode"
                value={formData.baseCode}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., BC-001"
                required
                disabled={loading || success}
              />
            </div>

            {/* Base Type */}
            <div>
              <label style={labelStyle}>
                Base Type <span style={{ color: colors.accentRed }}>*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={selectStyle}
                required
                disabled={loading || success}
              >
                {baseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label style={labelStyle}>
                Location <span style={{ color: colors.accentRed }}>*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={inputStyle}
                placeholder="City, State"
                required
                disabled={loading || success}
              />
            </div>

            {/* Address */}
            <div style={fullWidthStyle}>
              <label style={labelStyle}>
                Address <span style={{ color: colors.accentRed }}>*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={textareaStyle}
                placeholder="Full address"
                required
                disabled={loading || success}
              />
            </div>

            {/* Contact Number */}
            <div>
              <label style={labelStyle}>
                Contact Number
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                style={inputStyle}
                placeholder="+91 12345 67890"
                disabled={loading || success}
              />
            </div>

            {/* Official Email */}
            <div>
              <label style={labelStyle}>
                Official Email
              </label>
              <input
                type="email"
                name="officialEmail"
                value={formData.officialEmail}
                onChange={handleChange}
                style={inputStyle}
                placeholder="base@example.com"
                disabled={loading || success}
              />
            </div>

            {/* Established Date */}
            <div>
              <label style={labelStyle}>
                Established Date
              </label>
              <input
                type="date"
                name="establishedDate"
                value={formData.establishedDate}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading || success}
              />
            </div>

            {/* Personnel Count */}
            <div>
              <label style={labelStyle}>
                Personnel Count
              </label>
              <input
                type="number"
                name="personnelCount"
                value={formData.personnelCount}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0"
                min="0"
                disabled={loading || success}
              />
            </div>

            {/* Personnel Capacity */}
            <div>
              <label style={labelStyle}>
                Personnel Capacity
              </label>
              <input
                type="number"
                name="personnelCapacity"
                value={formData.personnelCapacity}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0"
                min="0"
                disabled={loading || success}
              />
            </div>

            {/* Emergency Contact */}
            <div style={fullWidthStyle}>
              <label style={labelStyle}>
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Emergency contact number"
                disabled={loading || success}
              />
            </div>

            {/* Description */}
            <div style={fullWidthStyle}>
              <label style={labelStyle}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={textareaStyle}
                placeholder="Brief description of the base"
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={loading || success ? buttonDisabledStyle : buttonStyle}
            disabled={loading || success}
          >
            {loading ? (
              <>
                <Clock size={18} className="animate-spin" />
                SUBMITTING...
              </>
            ) : success ? (
              <>
                <CheckCircle size={18} />
                SUBMITTED ✓
              </>
            ) : (
              <>
                <Save size={18} />
                SUBMIT BASE INFORMATION
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BaseSetup;