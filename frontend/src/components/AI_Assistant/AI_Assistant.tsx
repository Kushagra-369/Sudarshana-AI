// components/AI_Assistant.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  Shield,

  Cpu,
  Mic,
  Paperclip,
  
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,

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
  suggestions?: string[];
  isThinking?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  category: "situation" | "threat" | "incident" | "analytics";
}

// ============================================================
// MOCK DATA
// ============================================================
const initialSuggestions: Suggestion[] = [
  { id: "s1", text: "Why was Sector B flagged?", category: "situation" },
  { id: "s2", text: "Summarize today's high-risk events", category: "threat" },
  { id: "s3", text: "What caused the highest threat score?", category: "threat" },
  { id: "s4", text: "Show recent suspicious activity", category: "situation" },
  { id: "s5", text: "What are the most important active incidents?", category: "incident" },
  { id: "s6", text: "Analyze threat patterns in Sector B", category: "analytics" },
];

// Mock responses for different queries
const mockResponses: Record<string, string> = {
  "why was sector b flagged": "Sector B was flagged due to multiple indicators:\n\n1. **Restricted Zone Entry** (+40 points): A vehicle (ID: VEH-004) entered a designated restricted zone at 14:32:18.\n\n2. **Unusual Timestamp** (+20 points): The entry occurred outside normal operational hours (14:32), which is flagged as suspicious.\n\n3. **Abnormal Movement Pattern** (+12 points): The vehicle showed erratic movement patterns, including sudden stops and direction changes.\n\n**Total Threat Score: 82/100 (CRITICAL)**\n\nThis combination of factors triggered an automatic alert. The incident is currently under human review.",
  
  "summarize today's high-risk events": "Today's high-risk events summary:\n\n**Critical Threats (Score 80+):**\n- **14:32** - Vehicle #04 entered restricted zone in Sector B (Score: 82)\n- **13:42** - Unauthorized vehicle at East Gate, Sector B (Score: 72)\n\n**High Priority Threats (Score 60-79):**\n- **14:28** - Person #12 showing unusual movement near Sector A checkpoint (Score: 67)\n\n**Key Observations:**\n- 8 total threats detected today\n- 2 critical, 3 high priority, 2 medium, 1 low\n- Sector B shows highest activity (5 threats)\n- 3 incidents currently require human review\n- Anomaly detection rate: 12 anomalies, 67% resolution rate\n\n**Recommendation:** Immediate review of critical threats in Sector B recommended.",
  
  "what caused the highest threat score": "The highest threat score (82/100) was caused by Vehicle #04 in Sector B with the following breakdown:\n\n**1. Restricted Zone Entry** (+40)\n- Vehicle entered a designated restricted zone\n- Zone marked as sensitive area\n- Unauthorized entry triggered primary alert\n\n**2. Unusual Timestamp** (+20)\n- Entry occurred at 14:32:18\n- Outside standard operational window (06:00-18:00)\n- Automated pattern matching flagged as suspicious\n\n**3. Abnormal Movement** (+12)\n- Erratic driving pattern detected\n- Multiple sudden stops\n- Direction changes inconsistent with normal traffic\n\n**4. Vehicle Type** (+10)\n- Suspicious vehicle classification\n- Previous incidents with similar vehicle type\n\n**TOTAL: 82/100 (CRITICAL)**\n\nThis threat is currently active and requires immediate human review.",
  
  "show recent suspicious activity": "Recent suspicious activity detected:\n\n**Last 30 Minutes:**\n1. **14:32** - Vehicle #04, Sector B\n   - Restricted zone entry\n   - Score: 82/100 (CRITICAL)\n   - Status: ACTIVE\n\n2. **14:28** - Person #12, Sector A\n   - Unusual movement pattern\n   - Score: 67/100 (HIGH)\n   - Status: UNDER REVIEW\n\n3. **14:18** - Vehicle #05, Sector B\n   - Unauthorized presence\n   - Score: 72/100 (HIGH)\n   - Status: ACTIVE\n\n**Last Hour:**\n4. **14:15** - Vehicle #03, Sector C\n   - Abnormal speed detected\n   - Score: 48/100 (MEDIUM)\n   - Status: ACTIVE\n\n**Pattern Analysis:**\n- Concentration in Sector B (3 events)\n- All events involve vehicles (3/4)\n- Most events occurred between 14:15-14:32\n- 2 events require human review\n\n**Alert:** Critical threat currently active in Sector B.",
  
  "what are the most important active incidents": "Active incidents requiring attention:\n\n**1. INC-001 | CRITICAL**\n- Vehicle #04 in Sector B\n- Score: 82/100\n- Status: ACTIVE\n- Requires immediate review\n- Restricted zone entry + unusual timing\n- Assigned to: Captain Singh\n\n**2. INC-005 | HIGH**\n- Vehicle #05 at East Gate\n- Score: 72/100\n- Status: ACTIVE\n- Unauthorized presence detected\n- Assigned to: Captain Singh\n\n**3. INC-003 | MEDIUM**\n- Vehicle #03 in Sector C\n- Score: 48/100\n- Status: ACTIVE\n- Abnormal speed pattern\n- Unassigned\n\n**Summary:**\n- 3 active incidents\n- 1 requires immediate review\n- 2 high-risk incidents in Sector B\n- Captain Singh assigned to 2 incidents\n\n**Recommendation:**\n- Immediate review of INC-001\n- Consider reassigning INC-003\n- Increase patrol in Sector B",
  
  "analyze threat patterns in sector b": "Sector B Threat Analysis:\n\n**Overview:**\n- Total Threats: 5\n- Critical: 2\n- High: 2\n- Medium: 1\n- Active: 4\n\n**Patterns:**\n1. **Time Pattern:**\n   - Peak activity: 14:00-15:00 (3 events)\n   - Suspicious timing violations (2 events)\n\n2. **Location Pattern:**\n   - Main Road: 2 events\n   - East Gate: 2 events\n   - Restricted Zone: 1 event\n\n3. **Object Pattern:**\n   - Vehicles: 4 events\n   - Persons: 1 event\n   - High confidence detections: 85%+\n\n4. **Threat Score Distribution:**\n   - 80+ : 2 events\n   - 60-79 : 2 events\n   - 40-59 : 1 event\n\n**Risk Assessment:**\n- HIGH risk level\n- Increasing activity trend (+12%)\n- Restricted zone violations concerning\n- Multiple active threats require review\n\n**Recommendations:**\n- Increase surveillance in Sector B\n- Review restricted zone access protocols\n- Assign additional patrol units\n- Prioritize INC-001 review",
};

// ============================================================
// COMPONENT
// ============================================================
const AI_Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions] = useState<Suggestion[]>(initialSuggestions);
  const [suggestionCategory, setSuggestionCategory] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- COLORS ----
  const colors = {
    bg: "#080D0C",
    surface: "#111A16",
    surfaceLighter: "#1A2A24",
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

  // ---- STYLES ----
  const containerStyle: React.CSSProperties = {
    background: colors.bg,
    padding: "1.5rem",
    minHeight: "calc(100vh - 82px)",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.textPrimary,
    display: "flex",
    flexDirection: "column",
  };

  // ---- HEADER ----
  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: "0.75rem",
  };

  const headerLeftStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: colors.textPrimary,
  };

  const headerSubtitleStyle: React.CSSProperties = {
    fontSize: "12px",
    color: colors.textSecondary,
    letterSpacing: "0.5px",
  };

  const headerRightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  const statusBadgeStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "10px",
    color: colors.accentGreen,
    padding: "0.25rem 0.6rem",
    border: `1px solid ${colors.accentGreen}33`,
    borderRadius: "4px",
  };

  // ---- MAIN LAYOUT ----
  const mainLayoutStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "1rem",
    flex: 1,
    minHeight: "500px",
  };

  // ---- CHAT AREA ----
  const chatAreaStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    overflow: "hidden",
  };

  // ---- MESSAGES ----
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

  // ---- INPUT AREA ----
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
    fontSize: "12px",
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

  // ---- SIDEBAR ----
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
    fontSize: "11px",
    color: colors.textSecondary,
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    lineHeight: 1.3,
  };

  // ---- THINKING ANIMATION ----
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

  // ---- KEYFRAMES ----
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

  // ---- SCROLL TO BOTTOM ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- HANDLE SEND ----
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

    // Simulate AI thinking
    setTimeout(() => {
      const query = inputValue.trim().toLowerCase();
      let response = "I understand you're asking about the operational situation. Could you please provide more specific details about what you'd like to know?";

      // Find matching response
      for (const [key, value] of Object.entries(mockResponses)) {
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
        sources: ["AI Analysis", "Threat Intelligence", "Incident Database"],
        suggestions: [
          "Show more details about Sector B",
          "What about Sector A?",
          "Update threat assessment",
        ],
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1500 + Math.random() * 1000);
  };

  // ---- HANDLE SUGGESTION ----
  const handleSuggestion = (text: string) => {
    setInputValue(text);
    inputRef.current?.focus();
  };

  // ---- HANDLE COPY ----
  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ---- GET SUGGESTION CATEGORIES ----
  const filteredSuggestions = suggestionCategory === "ALL"
    ? suggestions
    : suggestions.filter(s => s.category === suggestionCategory);

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>AI Assistant</div>
          <div style={headerSubtitleStyle}>
            <Bot size={14} style={{ display: "inline", marginRight: "6px" }} />
            AI-powered situation analysis & decision support
          </div>
        </div>
        <div style={headerRightStyle}>
          <div style={statusBadgeStyle}>
            <Cpu size={12} />
            <span>AI Active</span>
          </div>
          <div style={statusBadgeStyle}>
            <Sparkles size={12} />
            <span>v2.1</span>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={mainLayoutStyle}>
        {/* CHAT AREA */}
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
                gap: "0.5rem",
              }}>
                <Bot size={48} color={colors.textSecondary} opacity={0.3} />
                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textPrimary }}>
                  AI Situation Assistant
                </div>
                <div style={{ fontSize: "12px", textAlign: "center", maxWidth: "300px" }}>
                  Ask me about threats, incidents, or the current operational situation.
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
                        }}>
                          <span>Sources:</span>
                          {message.sources.map((source, idx) => (
                            <span key={idx} style={{ background: colors.surface, padding: "0.1rem 0.4rem", borderRadius: "2px" }}>
                              {source}
                            </span>
                          ))}
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

          {/* INPUT AREA */}
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
              placeholder="Ask about the situation..."
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

        {/* SIDEBAR */}
        <div style={sidebarStyle}>
          <div>
            <div style={sidebarTitleStyle}>Suggested Questions</div>
            <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              {["ALL", "situation", "threat", "incident", "analytics"].map((cat) => (
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
                <Lightbulb size={12} color={colors.accentAmber} />
                <span>{suggestion.text}</span>
              </div>
            ))}
          </div>

          <div style={{
            padding: "0.5rem",
            background: colors.surfaceLighter,
            border: `1px solid ${colors.border}`,
            borderRadius: "4px",
          }}>
            <div style={{ fontSize: "9px", color: colors.textSecondary, display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Shield size={12} color={colors.accentGreen} />
              <span>AI decisions require human review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI_Assistant;