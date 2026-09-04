// frontend/src/pages/AI_Assistant.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  Shield,
  Mic,
  Paperclip,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { analyzeSituation, checkAIStatus } from "../../api/ai";

// ============================================================
// TYPES
// ============================================================
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  context?: any;
  error?: boolean;
  isThinking?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  category: "situation" | "threat" | "incident" | "analytics" | "history";
}

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// ============================================================
// COMPONENT
// ============================================================
const AI_Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState<"connected" | "offline" | "error" | "checking">("checking");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions: Suggestion[] = [
    { id: "s1", text: "Analyze current situation", category: "situation" },
    { id: "s2", text: "What is abnormal right now?", category: "situation" },
    { id: "s3", text: "Show current priority", category: "situation" },
    { id: "s4", text: "Show suspicious activity", category: "threat" },
    { id: "s5", text: "What is the highest-risk area?", category: "threat" },
    { id: "s6", text: "Analyze zone activity", category: "analytics" },
    { id: "s7", text: "Compare Sector A and Sector B", category: "analytics" },
    { id: "s8", text: "Show pattern deviations", category: "analytics" },
    { id: "s9", text: "Find similar historical cases", category: "history" },
  ];

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

  // ---- Initialize Speech Recognition ----
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputValue(finalTranscript);
          setIsListening(false);
        } else if (interimTranscript) {
          setInputValue(interimTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          // User denied permission
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  // ---- Check AI Status on mount ----
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkAIStatus();
        setAiStatus(status.status);
      } catch {
        setAiStatus("offline");
      }
    };
    checkStatus();

    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // ---- KEYFRAMES ----
  useEffect(() => {
    const style = document.createElement("style");

    style.textContent = `
    @keyframes thinking-dot {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-8px);
        opacity: 1;
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    .animate-pulse {
      animation: pulse 1.5s ease-in-out infinite;
    }
  `;

    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // ---- SCROLL TO BOTTOM ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- Handle Send ----
  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isThinking || aiStatus === "offline") return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsThinking(true);

    try {
      const response = await analyzeSituation(trimmedInput);

      if (!response.success) {
        throw new Error(response.error || "Analysis failed");
      }

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response.response,
        timestamp: new Date().toLocaleTimeString(),
        sources: response.sources || ["AI Analysis"],
        context: response.context,
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: error.message || "I encountered an error while analyzing the situation. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  // ---- Handle Key Down ----
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---- Handle Suggestion ----
  const handleSuggestion = (text: string) => {
    setInputValue(text);
    inputRef.current?.focus();
  };

  // ---- Handle Copy ----
  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ---- Handle Voice Input ----
  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.abort();
      setIsListening(false);
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
    }
  };

  // ---- Handle Text-to-Speech ----
  const toggleSpeech = (content: string, messageId: string) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    if (isSpeaking && speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    // Clean markdown for speech
    const cleanContent = content
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/•/g, "")
      .replace(/_/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanContent);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setSpeakingMessageId(messageId);
  };

  // ---- Render Context ----
  const renderContext = (context: any) => {
    if (!context) return null;

    const sections = [];

    // Priority
    if (context.priority) {
      sections.push(
        <div key="priority" style={{ marginBottom: "0.5rem" }}>
          <span style={{ fontWeight: 600, color: colors.textSecondary }}>Priority: </span>
          <span style={{
            color: context.priority === "HIGH" ? colors.accentRed :
              context.priority === "MEDIUM" ? colors.accentAmber :
                colors.accentGreen,
            fontWeight: 700,
          }}>
            {context.priority}
          </span>
        </div>
      );
    }

    // Pattern Analysis
    if (context.pattern_analysis) {
      const pa = context.pattern_analysis;
      sections.push(
        <div key="pattern" style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 600, color: colors.textSecondary, marginBottom: "0.25rem" }}>Pattern Analysis</div>
          <div style={{ fontSize: "11px", color: colors.textSecondary, lineHeight: 1.6 }}>
            {pa.status && <div>Status: <span style={{ color: colors.textPrimary }}>{pa.status}</span></div>}
            {pa.baseline !== undefined && <div>Baseline: <span style={{ color: colors.textPrimary }}>{pa.baseline}</span></div>}
            {pa.current !== undefined && <div>Current: <span style={{ color: colors.textPrimary }}>{pa.current}</span></div>}
            {pa.deviation !== undefined && <div>Deviation: <span style={{ color: colors.textPrimary }}>{pa.deviation}</span></div>}
            {pa.percentage !== undefined && <div>Change: <span style={{ color: colors.textPrimary }}>{pa.percentage.toFixed(1)}%</span></div>}
          </div>
        </div>
      );
    }

    // Correlation
    if (context.correlation_analysis) {
      const ca = context.correlation_analysis;
      sections.push(
        <div key="correlation" style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 600, color: colors.textSecondary, marginBottom: "0.25rem" }}>Correlation</div>
          <div style={{ fontSize: "11px", color: colors.textSecondary, lineHeight: 1.6 }}>
            {ca.zone_correlation && (
              <div>
                Zone: {ca.zone_correlation.zone_a} → {ca.zone_correlation.zone_b}
                <span style={{ color: colors.textPrimary }}> (Ratio: {ca.zone_correlation.ratio}x)</span>
                <div>Status: <span style={{ color: colors.textPrimary }}>{ca.zone_correlation.status}</span></div>
              </div>
            )}
            {ca.event_correlation && (
              <div>
                Events: {ca.event_correlation.event_count}
                <span style={{ color: colors.textPrimary }}> in {ca.event_correlation.busiest_zone}</span>
                <div>Status: <span style={{ color: colors.textPrimary }}>{ca.event_correlation.status}</span></div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Hypotheses
    if (context.hypotheses && context.hypotheses.length > 0) {
      sections.push(
        <div key="hypotheses" style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 600, color: colors.textSecondary, marginBottom: "0.25rem" }}>Hypotheses</div>
          {context.hypotheses.slice(0, 3).map((h: any, idx: number) => (
            <div key={idx} style={{ fontSize: "11px", color: colors.textSecondary, lineHeight: 1.6, paddingLeft: "0.5rem" }}>
              • {h.message}
              {h.confidence && <span style={{ color: colors.textPrimary }}> ({h.confidence.toFixed(0)}% confidence)</span>}
            </div>
          ))}
        </div>
      );
    }

    // Recommendations
    if (context.recommendations && context.recommendations.length > 0) {
      sections.push(
        <div key="recommendations" style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 600, color: colors.textSecondary, marginBottom: "0.25rem" }}>Recommendations</div>
          {context.recommendations.slice(0, 3).map((r: string, idx: number) => (
            <div key={idx} style={{ fontSize: "11px", color: colors.textSecondary, lineHeight: 1.6, paddingLeft: "0.5rem" }}>
              • {r}
            </div>
          ))}
        </div>
      );
    }

    // Historical Matches
    if (context.historical_matches && context.historical_matches.length > 0) {
      sections.push(
        <div key="historical" style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 600, color: colors.textSecondary, marginBottom: "0.25rem" }}>Historical Matches</div>
          {context.historical_matches.slice(0, 2).map((h: any, idx: number) => (
            <div key={idx} style={{ fontSize: "11px", color: colors.textSecondary, lineHeight: 1.6, paddingLeft: "0.5rem" }}>
              • {h.case_id} <span style={{ color: colors.textPrimary }}>({h.score}% similarity)</span>
            </div>
          ))}
        </div>
      );
    }

    if (sections.length === 0) return null;

    return (
      <div style={{
        marginTop: "0.75rem",
        paddingTop: "0.75rem",
        borderTop: `1px solid ${colors.border}`,
      }}>
        {sections}
      </div>
    );
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

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: "0.75rem",
    flexWrap: "wrap",
    gap: "0.5rem",
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

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    let color = colors.accentGreen;
    let bg = `${colors.accentGreen}15`;
    if (status === "offline") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
    else if (status === "error") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
    return {
      display: "flex",
      alignItems: "center",
      gap: "0.4rem",
      fontSize: "10px",
      color,
      padding: "0.25rem 0.6rem",
      border: `1px solid ${color}33`,
      borderRadius: "4px",
      background: bg,
    };
  };

  const mainLayoutStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "1rem",
    flex: 1,
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

  const bubbleStyle = (role: "user" | "assistant", error?: boolean): React.CSSProperties => ({
    maxWidth: "75%",
    padding: "0.6rem 0.9rem",
    borderRadius: "8px",
    background: error ? `${colors.accentRed}15` : role === "user" ? colors.accentBlue : colors.surfaceLighter,
    border: error ? `1px solid ${colors.accentRed}` : role === "user" ? `1px solid ${colors.accentBlue}44` : `1px solid ${colors.border}`,
    fontSize: "13px",
    lineHeight: 1.6,
    color: error ? colors.accentRed : colors.textPrimary,
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

  const offlineBannerStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    background: `${colors.accentRed}15`,
    border: `1px solid ${colors.accentRed}`,
    borderRadius: "4px",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
    flexWrap: "wrap",
  };

  const listeningIndicatorStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "11px",
    color: colors.accentRed,
    fontWeight: 600,
    padding: "0.2rem 0.6rem",
    borderRadius: "4px",
    background: `${colors.accentRed}15`,
    border: `1px solid ${colors.accentRed}`,
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>AI Situation Assistant</div>
          <div style={headerSubtitleStyle}>
            <Bot size={14} style={{ display: "inline", marginRight: "6px" }} />
            AI-powered situation analysis & decision support
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={statusBadgeStyle(aiStatus)}>
            {aiStatus === "connected" ? (
              <Wifi size={12} />
            ) : aiStatus === "checking" ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <WifiOff size={12} />
            )}
            <span>
              {aiStatus === "connected" ? "AI ACTIVE" :
                aiStatus === "checking" ? "CHECKING..." :
                  aiStatus === "offline" ? "OFFLINE" :
                    "ERROR"}
            </span>
          </div>
          <div style={{ ...statusBadgeStyle("connected"), color: colors.accentPurple, borderColor: `${colors.accentPurple}33`, background: `${colors.accentPurple}15` }}>
            <Sparkles size={12} />
            <span>v2.1</span>
          </div>
        </div>
      </div>

      {/* OFFLINE BANNER */}
      {aiStatus === "offline" && (
        <div style={offlineBannerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: colors.accentRed }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 600 }}>AI Backend Offline</span>
            <span style={{ fontWeight: 400, fontSize: "12px" }}>Unable to connect to situation analysis service</span>
          </div>
          <button
            style={{
              background: colors.accentGreen,
              border: "none",
              borderRadius: "4px",
              padding: "0.2rem 0.75rem",
              color: colors.textPrimary,
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onClick={async () => {
              setAiStatus("checking");
              try {
                const status = await checkAIStatus();
                setAiStatus(status.status);
              } catch {
                setAiStatus("offline");
              }
            }}
          >
            Retry
          </button>
        </div>
      )}

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
                {aiStatus === "connected" && (
                  <div style={{ fontSize: "10px", color: colors.accentGreen, marginTop: "0.25rem" }}>
                    ● Ready
                  </div>
                )}
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
                    <div style={bubbleStyle(message.role, message.error)}>
                      {message.content}
                      {message.sources && !message.error && (
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
                      {message.context && renderContext(message.context)}
                    </div>
                    <div style={timestampStyle}>
                      {message.timestamp}
                      {message.role === "assistant" && !message.error && (
                        <span style={{ marginLeft: "0.5rem", display: "inline-flex", gap: "0.3rem" }}>
                          <button
                            style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", padding: "0" }}
                            onClick={() => handleCopy(message.content, message.id)}
                          >
                            {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                          <button
                            style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", padding: "0" }}
                            onClick={() => toggleSpeech(message.content, message.id)}
                          >
                            {isSpeaking && speakingMessageId === message.id ? (
                              <VolumeX size={12} />
                            ) : (
                              <Volume2 size={12} />
                            )}
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
            <button
              style={{
                background: "transparent",
                border: "none",
                color: colors.textSecondary,
                cursor: "not-allowed",
                padding: "4px",
                opacity: 0.4,
              }}
              disabled
              title="Attachment not supported"
            >
              <Paperclip size={18} />
            </button>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: isListening ? colors.accentRed : colors.textSecondary,
                cursor: recognition ? "pointer" : "not-allowed",
                padding: "4px",
                opacity: recognition ? 1 : 0.4,
                position: "relative",
              }}
              onClick={toggleListening}
              disabled={!recognition}
              title={recognition ? (isListening ? "Stop listening" : "Start voice input") : "Voice input not supported"}
            >
              <Mic size={18} />
              {isListening && (
                <span style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: colors.accentRed,
                  animation: "pulse 1s ease-in-out infinite",
                }} />
              )}
            </button>
            <input
              ref={inputRef}
              style={inputStyle}
              placeholder={aiStatus === "offline" ? "AI offline - please reconnect" : "Ask about the situation..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={aiStatus === "offline"}
            />
            {isListening && (
              <span style={listeningIndicatorStyle}>
                <span style={{ animation: "pulse 1s ease-in-out infinite" }}>●</span>
                Listening...
              </span>
            )}
            <button
              style={sendButtonStyle(!inputValue.trim() || isThinking || aiStatus === "offline")}
              onClick={handleSend}
              disabled={!inputValue.trim() || isThinking || aiStatus === "offline"}
            >
              <Send size={16} />
              Send
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={sidebarStyle}>
          <div>
            <div style={sidebarTitleStyle}>Quick Actions</div>
            <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              {["ALL", "situation", "threat", "analytics", "history"].map((cat) => (
                <button
                  key={cat}
                  style={{
                    background: colors.surfaceLighter,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "3px",
                    padding: "0.15rem 0.5rem",
                    fontSize: "8px",
                    color: colors.textSecondary,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {suggestions.map((suggestion) => (
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
              <span>AI recommendations require human review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI_Assistant;