// components/UserSafety.tsx
import React, { useState } from "react";
import {
  Shield,
  AlertTriangle,
  Info,
  BookOpen,
  Clock,
  ChevronRight,
  ExternalLink,

  MapPin,
  HelpCircle,
  Heart,
  Eye,
  Calendar,
} from "lucide-react";

interface SafetyGuidance {
  id: string;
  title: string;
  category: "PREPAREDNESS" | "AWARENESS" | "RESPONSE" | "GENERAL";
  description: string;
  steps: string[];
  date: string;
  status: "NEW" | "UPDATED" | "ARCHIVED";
  icon: React.ReactNode;
}

const UserSafety: React.FC = () => {
  const [selectedGuidance, setSelectedGuidance] = useState<string | null>(null);

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

  const mockGuidance: SafetyGuidance[] = [
    {
      id: "guidance-001",
      title: "Emergency Preparedness Guidelines",
      category: "PREPAREDNESS",
      description: "Comprehensive guidance on how to prepare for emergencies and stay safe.",
      steps: [
        "Stay informed through official channels",
        "Know your evacuation routes and safe zones",
        "Prepare an emergency kit with essential supplies",
        "Follow instructions from authorized personnel",
        "Keep emergency contact numbers accessible",
      ],
      date: "2025-04-13 12:00:00",
      status: "NEW",
      icon: <Shield size={20} />,
    },
    {
      id: "guidance-002",
      title: "Restricted Area Awareness",
      category: "AWARENESS",
      description: "Important information about restricted areas and how to stay safe.",
      steps: [
        "Identify restricted zones in your area",
        "Follow all posted signage and instructions",
        "Report suspicious activity to authorities",
        "Avoid entering designated restricted areas",
        "Stay updated on changing restrictions",
      ],
      date: "2025-04-12 10:30:00",
      status: "UPDATED",
      icon: <MapPin size={20} />,
    },
    {
      id: "guidance-003",
      title: "Public Emergency Response Protocol",
      category: "RESPONSE",
      description: "What to do during a public emergency situation.",
      steps: [
        "Remain calm and follow official instructions",
        "Evacuate if instructed to do so",
        "Use designated emergency shelters",
        "Stay away from affected areas",
        "Monitor official channels for updates",
      ],
      date: "2025-04-11 08:15:00",
      status: "UPDATED",
      icon: <AlertTriangle size={20} />,
    },
    {
      id: "guidance-004",
      title: "General Safety Awareness",
      category: "GENERAL",
      description: "Key safety awareness tips for everyday situations.",
      steps: [
        "Stay aware of your surroundings",
        "Follow safety guidelines from authorities",
        "Keep emergency contacts handy",
        "Participate in safety drills when possible",
        "Report concerns to appropriate authorities",
      ],
      date: "2025-04-10 14:45:00",
      status: "ARCHIVED",
      icon: <Heart size={20} />,
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

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1.5rem",
  };

  const cardStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "1.25rem",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const cardHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    marginBottom: "0.5rem",
  };

  const cardIconStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: colors.surfaceLighter,
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const cardContentStyle: React.CSSProperties = {
    flex: 1,
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: "4px",
  };

  const cardCategoryStyle = (category: string): React.CSSProperties => {
    const colors_map: Record<string, string> = {
      PREPAREDNESS: colors.accentGreen,
      AWARENESS: colors.accentBlue,
      RESPONSE: colors.accentAmber,
      GENERAL: colors.accentPurple,
    };
    return {
      fontSize: "10px",
      fontWeight: 600,
      color: colors_map[category] || colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: "0.3px",
    };
  };

  const cardDescriptionStyle: React.CSSProperties = {
    fontSize: "13px",
    color: colors.textSecondary,
    marginTop: "0.25rem",
  };

  const cardMetaStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.75rem",
    paddingTop: "0.5rem",
    borderTop: `1px solid ${colors.border}`,
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    let color = colors.textSecondary;
    if (status === "NEW") color = colors.accentGreen;
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

  const expandedDetailsStyle: React.CSSProperties = {
    marginTop: "1rem",
    paddingTop: "0.75rem",
    borderTop: `1px solid ${colors.border}`,
  };

  const stepItemStyle: React.CSSProperties = {
    padding: "0.3rem 0",
    fontSize: "13px",
    color: colors.textSecondary,
    display: "flex",
    gap: "0.5rem",
    alignItems: "flex-start",
  };

  const stepNumberStyle: React.CSSProperties = {
    color: colors.accentGreen,
    fontWeight: 600,
    fontSize: "12px",
    minWidth: "20px",
  };

  const emergencyBannerStyle: React.CSSProperties = {
    background: colors.surfaceLighter,
    border: `1px solid ${colors.border}`,
    padding: "1.5rem",
    marginTop: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const getCategoryIcon = (category: string): React.ReactNode => {
    switch(category) {
      case "PREPAREDNESS": return <Shield size={20} color={colors.accentGreen} />;
      case "AWARENESS": return <Eye size={20} color={colors.accentBlue} />;
      case "RESPONSE": return <AlertTriangle size={20} color={colors.accentAmber} />;
      case "GENERAL": return <Heart size={20} color={colors.accentPurple} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={innerContainerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={headerTitleStyle}>
            <Shield size={28} style={{ display: "inline", marginRight: "12px", color: colors.accentGreen }} />
            Safety Guidance
          </div>
          <div style={headerSubtitleStyle}>
            Public safety information and preparedness resources
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

        {/* Guidance Cards */}
        <div style={gridStyle}>
          {mockGuidance.map((guidance) => (
            <div
              key={guidance.id}
              style={cardStyle}
              onClick={() => setSelectedGuidance(selectedGuidance === guidance.id ? null : guidance.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.accentGreen;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <div style={cardHeaderStyle}>
                <div style={cardIconStyle}>
                  {getCategoryIcon(guidance.category)}
                </div>
                <div style={cardContentStyle}>
                  <div style={cardTitleStyle}>{guidance.title}</div>
                  <div style={cardCategoryStyle(guidance.category)}>{guidance.category}</div>
                </div>
              </div>
              <div style={cardDescriptionStyle}>{guidance.description}</div>
              <div style={cardMetaStyle}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <Clock size={12} color={colors.textSecondary} />
                  <span style={{ fontSize: "11px", color: colors.textSecondary }}>
                    {guidance.date.split(" ")[0]}
                  </span>
                  <span style={statusBadgeStyle(guidance.status)}>{guidance.status}</span>
                </div>
                <ChevronRight
                  size={18}
                  style={{
                    transform: selectedGuidance === guidance.id ? "rotate(90deg)" : "none",
                    transition: "transform 0.2s",
                    color: colors.textSecondary,
                  }}
                />
              </div>

              {selectedGuidance === guidance.id && (
                <div style={expandedDetailsStyle}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.5rem" }}>
                    Key Steps
                  </div>
                  {guidance.steps.map((step, idx) => (
                    <div key={idx} style={stepItemStyle}>
                      <span style={stepNumberStyle}>{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                  <button style={{
                    marginTop: "0.75rem",
                    background: colors.surfaceLighter,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "4px",
                    padding: "0.4rem 1rem",
                    color: colors.textPrimary,
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}>
                    <BookOpen size={14} />
                    View Full Guidance
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emergency Banner */}
        <div style={emergencyBannerStyle}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: `${colors.accentRed}22`,
            border: `2px solid ${colors.accentRed}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <AlertTriangle size={24} color={colors.accentRed} />
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: colors.textPrimary }}>
              Emergency Preparedness
            </div>
            <div style={{ fontSize: "13px", color: colors.textSecondary, marginTop: "4px" }}>
              In case of emergency, follow instructions from authorized local authorities and official emergency channels.
            </div>
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "1rem" }}>
              <button style={{
                background: "transparent",
                border: `1px solid ${colors.border}`,
                borderRadius: "4px",
                padding: "0.3rem 0.75rem",
                color: colors.textPrimary,
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}>
                <HelpCircle size={14} />
                Learn More
              </button>
              <button style={{
                background: colors.accentGreen,
                border: "none",
                borderRadius: "4px",
                padding: "0.3rem 0.75rem",
                color: colors.textPrimary,
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}>
                <ExternalLink size={14} />
                View Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSafety;