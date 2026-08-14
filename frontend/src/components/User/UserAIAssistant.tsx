// components/UserAIAssistant.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Shield,
  Clock,

  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Info,
  AlertCircle,
  Eye,
  Calendar,

  Mic,
  Paperclip,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  isThinking?: boolean;
  disclaimer?: string;
}

interface Suggestion {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: "alert" | "safety" | "information" | "general";
}

// ============================================================
// MOCK DATA
// ============================================================
const initialSuggestions: Suggestion[] = [
  { 
    id: "s1", 
    text: "What alerts are active?", 
    icon: <AlertCircle size={14} />,
    category: "alert" 
  },
  { 
    id: "s2", 
    text: "What should I do during an emergency?", 
    icon: <Shield size={14} />,
    category: "safety" 
  },
  { 
    id: "s3", 
    text: "Are there any public safety advisories?", 
    icon: <Info size={14} />,
    category: "information" 
  },
  { 
    id: "s4", 
    text: "What does the current security status mean?", 
    icon: <Eye size={14} />,
    category: "general" 
  },
  { 
    id: "s5", 
    text: "How can I stay safe in restricted areas?", 
    icon: <Shield size={14} />,
    category: "safety" 
  },
  { 
    id: "s6", 
    text: "Latest public safety updates", 
    icon: <Info size={14} />,
    category: "information" 
  },
];

// Mock responses for public queries
const mockPublicResponses: Record<string, string> = {
  "what alerts are active": "**Active Public Alerts:**\n\n1. **Restricted Area Advisory** (HIGH)\n   - Sector B - Designated Zone\n   - Public access is temporarily restricted\n   - Status: ACTIVE\n   - Updated: 14:35\n\n2. **Movement Advisory** (MEDIUM)\n   - Sector A Perimeter\n   - Non-essential movement should be avoided\n   - Status: ACTIVE\n   - Updated: 14:30\n\n3. **Routine Safety Notice** (INFORMATION)\n   - All Sectors\n   - Follow official safety guidance\n   - Status: UPDATED\n   - Updated: 13:20\n\n**Summary:**\n- 2 active alerts requiring attention\n- 1 informational notice\n- All alerts are verified by Public Safety Authority\n\n*For detailed information, please visit the Alerts page.*",

  "what should i do during an emergency": "**Emergency Response Guidelines:**\n\n1. **Stay Calm**\n   - Remain calm and composed\n   - Assess the situation carefully\n\n2. **Follow Official Instructions**\n   - Listen to authorized personnel\n   - Follow official communications\n   - Do not spread unverified information\n\n3. **Evacuate if Instructed**\n   - Use designated evacuation routes\n   - Follow signage and directions\n   - Do not use elevators in emergencies\n\n4. **Seek Shelter**\n   - Move to designated safe areas\n   - Stay away from affected zones\n   - Keep emergency supplies ready\n\n5. **Monitor Official Channels**\n   - Stay tuned to official communications\n   - Verify information from trusted sources\n   - Avoid rumors and speculation\n\n**Important:**\n- Emergency services are available for assistance\n- Follow instructions from local authorities\n- Keep emergency contacts accessible",

  "are there any public safety advisories": "**Current Public Safety Advisories:**\n\n1. **Restricted Area Advisory** (Active)\n   - Sector B - Designated Zone\n   - Public access is temporarily restricted\n   - Follow official guidance\n\n2. **Movement Advisory** (Active)\n   - Sector A Perimeter\n   - Residents advised to follow official instructions\n   - Non-essential movement should be avoided\n\n3. **Safety Infrastructure Update** (Published)\n   - Routine security preparedness completed\n   - All systems operational\n\n**Guidance:**\n- Stay informed through official channels\n- Follow all posted signage and instructions\n- Report concerns to appropriate authorities\n- Keep emergency contacts accessible\n\n*Advisories are updated in real-time as situations evolve.*",

  "what does the current security status mean": "**Current Security Status: NORMAL**\n\n**What this means:**\n- No active public safety emergencies\n- Normal security operations in effect\n- Routine safety measures are active\n- Public can proceed with normal activities\n\n**Status Levels:**\n\n1. **NORMAL** (Current)\n   - Routine operations\n   - No immediate concerns\n   - Standard safety measures in place\n\n2. **ELEVATED**\n   - Heightened awareness\n   - Additional safety measures\n   - Follow official guidance\n\n3. **ALERT**\n   - Emergency situation\n   - Follow all instructions\n   - Seek official information\n\n**Actions for Public:**\n- Stay informed about your surroundings\n- Follow official safety guidelines\n- Report concerns to authorities\n- Keep emergency contacts accessible\n\n*Status is monitored and updated regularly by Public Safety Authority.*",

  "how can i stay safe in restricted areas": "**Safety Guidelines for Restricted Areas:**\n\n1. **Know the Boundaries**\n   - Identify restricted zones in your area\n   - Look for signage and markings\n   - Understand the restrictions in place\n\n2. **Follow All Signage**\n   - Obey posted instructions\n   - Do not enter marked restricted zones\n   - Report damaged or missing signage\n\n3. **Stay Aware**\n   - Maintain situational awareness\n   - Be alert to changing conditions\n   - Watch for official announcements\n\n4. **Report Concerns**\n   - Report suspicious activity to authorities\n   - Contact official channels for information\n   - Do not approach restricted areas\n\n5. **Stay Informed**\n   - Monitor official communications\n   - Follow updates from authorities\n   - Understand evacuation procedures\n\n**Key Points:**\n- Restricted areas are marked for public safety\n- Unauthorized entry is prohibited\n- Follow all official instructions\n- Your safety is the priority",

  "latest public safety updates": "**Latest Public Safety Updates:**\n\n**14:35 - Restricted Area Advisory Updated**\n- Sector B - Designated Zone\n- Additional restrictions implemented\n- Public access remains restricted\n- Status: ACTIVE\n\n**14:30 - Movement Advisory Issued**\n- Sector A Perimeter\n- Residents advised to follow instructions\n- Non-essential movement should be avoided\n- Status: ACTIVE\n\n**13:20 - Safety Notice Updated**\n- All Sectors\n- Follow official safety guidance\n- Verified information available\n- Status: UPDATED\n\n**12:00 - Emergency Preparedness Guidance**\n- Published for public reference\n- Comprehensive safety guidelines\n- Available on Safety page\n- Status: NEW\n\n**Important:**\n- All updates are verified by authorities\n- Stay informed through official channels\n- Follow all safety instructions",
};

// ============================================================
// COMPONENT
// ============================================================
const UserAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions] = useState<Suggestion[]>(initialSuggestions);
  const [suggestionCategory, setSuggestionCategory] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const statusBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "11px",
    color: colors.accentGreen,
    padding: "0.25rem 0.75rem",
    border: `1px solid ${colors.accentGreen}33`,
    borderRadius: "4px",
  };

  const mainLayoutStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "1.5rem",
    minHeight: "500px",
  };

  const chatAreaStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    overflow: "hidden",
  };

  const messagesContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
    minHeight: "400px",
    maxHeight: "500px",
  };

  const messageStyle = (role: "user" | "assistant"): React.CSSProperties => ({
    marginBottom: "1rem",
    display: "flex",
    gap: "0.75rem",
    justifyContent: role === "user" ? "flex-end" : "flex-start",
  });

  const avatarStyle = (role: "user" | "assistant"): React.CSSProperties => ({
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: role === "user" ? colors.accentBlue : colors.accentPurple,
    border: `1px solid ${colors.border}`,
    flexShrink: 0,
  });

  const bubbleStyle = (role: "user" | "assistant"): React.CSSProperties => ({
    maxWidth: "75%",
    padding: "0.6rem 0.9rem",
    borderRadius: "8px",
    background: role === "user" ? colors.accentBlue : colors.surfaceLighter,
    border: role === "user" ? `1px solid ${colors.accentBlue}44` : `1px solid ${colors.border}`,
    fontSize: "13px",
    lineHeight: 1.6,
    color: colors.textPrimary,
    whiteSpace: "pre-wrap",
  });

  const timestampStyle: React.CSSProperties = {
    fontSize: "9px",
    color: colors.textSecondary,
    marginTop: "0.25rem",
  };

  const inputAreaStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    borderTop: `1px solid ${colors.border}`,
    background: colors.surfaceLighter,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    padding: "0.5rem 0.75rem",
    color: colors.textPrimary,
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
  };

  const sendButtonStyle = (disabled: boolean): React.CSSProperties => ({
    background: disabled ? colors.border : colors.accentGreen,
    border: "none",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    color: colors.textPrimary,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "12px",
    fontWeight: 500,
    fontFamily: "inherit",
    transition: "background 0.15s",
  });

  const sidebarStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const sidebarTitleStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  };

  const suggestionItemStyle: React.CSSProperties = {
    padding: "0.4rem 0.6rem",
    background: colors.surfaceLighter,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    fontSize: "12px",
    color: colors.textSecondary,
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    lineHeight: 1.3,
  };

  const thinkingDotsStyle: React.CSSProperties = {
    display: "flex",
    gap: "4px",
    padding: "0.25rem 0",
  };

  const dotStyle = (delay: string): React.CSSProperties => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: colors.textSecondary,
    animation: "thinking-dot 1.4s infinite",
    animationDelay: delay,
  });

  const disclaimerStyle: React.CSSProperties = {
    fontSize: "10px",
    color: colors.textSecondary,
    padding: "0.4rem 0.6rem",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes thinking-dot {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-8px); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {document.head.removeChild(style)};
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsThinking(true);

    setTimeout(() => {
      const query = inputValue.trim().toLowerCase();
      let response = "I understand you're asking about public safety information. Could you please clarify your question? I can help with active alerts, safety guidance, and public information.";

      for (const [key, value] of Object.entries(mockPublicResponses)) {
        if (query.includes(key)) {
          response = value;
          break;
        }
      }

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString(),
        sources: ["Public Safety Database", "Verified Information"],
        disclaimer: "Responses are limited to verified public information.",
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleSuggestion = (text: string) => {
    setInputValue(text);
    inputRef.current?.focus();
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSuggestions = suggestionCategory === "ALL"
    ? suggestions
    : suggestions.filter(s => s.category === suggestionCategory);

  return (
    <div style={containerStyle}>
      <div style={innerContainerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={headerTitleStyle}>
                <Bot size={28} style={{ display: "inline", marginRight: "12px", color: colors.accentPurple }} />
                AI Assistant
              </div>
              <div style={headerSubtitleStyle}>
                Ask about public alerts, safety guidance and verified information
              </div>
            </div>
            <div style={statusBadgeStyle}>
              <Sparkles size={14} />
              <span>Public Mode</span>
            </div>
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
              {new Date().toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Main Layout */}
        <div style={mainLayoutStyle}>
          {/* Chat Area */}
          <div style={chatAreaStyle}>
            <div style={messagesContainerStyle}>
              {messages.length === 0 ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: colors.textSecondary,
                  gap: "0.75rem",
                }}>
                  <Bot size={56} color={colors.textSecondary} opacity={0.3} />
                  <div style={{ fontSize: "16px", fontWeight: 600, color: colors.textPrimary }}>
                    Public Safety Assistant
                  </div>
                  <div style={{ fontSize: "13px", textAlign: "center", maxWidth: "350px" }}>
                    Ask me about active alerts, safety guidance, or general public information.
                  </div>
                  <div style={disclaimerStyle}>
                    <Shield size={12} color={colors.accentGreen} />
                    <span>Responses are limited to verified public information</span>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} style={messageStyle(message.role)}>
                    {message.role === "assistant" && (
                      <div style={avatarStyle("assistant")}>
                        <Bot size={16} color={colors.textPrimary} />
                      </div>
                    )}
                    <div style={{ maxWidth: message.role === "user" ? "75%" : "85%" }}>
                      <div style={bubbleStyle(message.role)}>
                        {message.content}
                        {message.sources && (
                          <div style={{
                            marginTop: "0.5rem",
                            paddingTop: "0.5rem",
                            borderTop: `1px solid ${colors.border}`,
                            fontSize: "9px",
                            color: colors.textSecondary,
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}>
                            <span>Sources:</span>
                            {message.sources.map((source, idx) => (
                              <span key={idx} style={{ background: colors.surface, padding: "0.1rem 0.4rem", borderRadius: "2px" }}>
                                {source}
                              </span>
                            ))}
                          </div>
                        )}
                        {message.disclaimer && (
                          <div style={{
                            marginTop: "0.5rem",
                            paddingTop: "0.5rem",
                            borderTop: `1px solid ${colors.border}`,
                            fontSize: "9px",
                            color: colors.textSecondary,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}>
                            <Shield size={10} color={colors.accentGreen} />
                            <span>{message.disclaimer}</span>
                          </div>
                        )}
                      </div>
                      <div style={timestampStyle}>
                        {message.timestamp}
                        {message.role === "assistant" && (
                          <span style={{ marginLeft: "0.5rem", display: "inline-flex", gap: "0.3rem" }}>
                            <button
                              style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", padding: "0" }}
                              onClick={() => handleCopy(message.content, message.id)}
                            >
                              {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                            <button style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", padding: "0" }}>
                              <ThumbsUp size={12} />
                            </button>
                            <button style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", padding: "0" }}>
                              <ThumbsDown size={12} />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div style={avatarStyle("user")}>
                        <User size={16} color={colors.textPrimary} />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isThinking && (
                <div style={messageStyle("assistant")}>
                  <div style={avatarStyle("assistant")}>
                    <Bot size={16} color={colors.textPrimary} />
                  </div>
                  <div style={bubbleStyle("assistant")}>
                    <div style={thinkingDotsStyle}>
                      <span style={dotStyle("0s")} />
                      <span style={dotStyle("0.2s")} />
                      <span style={dotStyle("0.4s")} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={inputAreaStyle}>
              <button style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", padding: "4px" }}>
                <Paperclip size={18} />
              </button>
              <button style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", padding: "4px" }}>
                <Mic size={18} />
              </button>
              <input
                ref={inputRef}
                style={inputStyle}
                placeholder="Ask about public safety..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                style={sendButtonStyle(!inputValue.trim() || isThinking)}
                onClick={handleSend}
                disabled={!inputValue.trim() || isThinking}
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={sidebarStyle}>
            <div>
              <div style={sidebarTitleStyle}>Suggested Questions</div>
              <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {["ALL", "alert", "safety", "information", "general"].map((cat) => (
                  <button
                    key={cat}
                    style={{
                      background: suggestionCategory === cat ? colors.accentGreen : colors.surfaceLighter,
                      border: `1px solid ${suggestionCategory === cat ? colors.accentGreen : colors.border}`,
                      borderRadius: "3px",
                      padding: "0.15rem 0.5rem",
                      fontSize: "8px",
                      color: suggestionCategory === cat ? colors.textPrimary : colors.textSecondary,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}
                    onClick={() => setSuggestionCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  style={suggestionItemStyle}
                  onClick={() => handleSuggestion(suggestion.text)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.surface;
                    e.currentTarget.style.borderColor = colors.accentGreen;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.surfaceLighter;
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <span style={{ color: colors.accentGreen }}>{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </div>
              ))}
            </div>

            <div style={disclaimerStyle}>
              <Shield size={12} color={colors.accentGreen} />
              <span>Verified public information only</span>
            </div>

            <div style={{
              padding: "0.5rem",
              background: colors.surfaceLighter,
              border: `1px solid ${colors.border}`,
              borderRadius: "4px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "10px", color: colors.textSecondary }}>
                <Info size={12} color={colors.accentBlue} />
                <span>This assistant provides verified public information only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAIAssistant;