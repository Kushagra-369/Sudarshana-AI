// frontend/src/api/ai.ts
import { APIURL } from "../GlobalAPIURL";

export interface SituationContext {
  pattern_analysis?: {
    baseline: number;
    current: number;
    deviation: number;
    percentage: number;
    status: "MAJOR_DEVIATION" | "MODERATE_DEVIATION" | "NORMAL" | "NO_BASELINE";
  };
  correlation_analysis?: {
    zone_correlation?: {
      zone_a: string;
      zone_b: string;
      activity_a: number;
      activity_b: number;
      ratio: number;
      status: "SIGNIFICANT_SHIFT" | "MODERATE_SHIFT" | "NORMAL" | "NO_ACTIVITY";
    };
    event_correlation?: {
      event_count: number;
      zones: Record<string, number>;
      busiest_zone: string;
      status: "CLUSTERED" | "DISTRIBUTED" | "NO_EVENTS";
    };
  };
  historical_matches: Array<{
    case_id: string;
    score: number;
    description: string;
  }>;
  hypotheses: Array<{
    type: string;
    message: string;
    confidence: number;
  }>;
  recommendations: string[];
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface AIResponse {
  success: boolean;
  response: string;
  context: SituationContext;
  sources: string[];
  error?: string;
}

export interface AIStatus {
  status: "connected" | "offline" | "error";
  message: string;
}

export const analyzeSituation = async (
  query: string,
  options?: {
    zone?: string;
    patternData?: any;
    correlationData?: any;
    historicalCases?: any[];
  }
): Promise<AIResponse> => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${APIURL}/situation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      zone: options?.zone,
      patternData: options?.patternData,
      correlationData: options?.correlationData,
      historicalCases: options?.historicalCases,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to analyze situation");
  }

  return response.json();
};

export const checkAIStatus = async (): Promise<AIStatus> => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    
    if (!token) {
      return { status: "offline", message: "Authentication required" };
    }

    const response = await fetch(`${APIURL}/status`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { status: "error", message: "AI service unavailable" };
    }

    return response.json();
  } catch (error) {
    return { status: "offline", message: "Cannot connect to AI service" };
  }
};