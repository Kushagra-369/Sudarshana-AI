import { Request, Response } from "express";

interface AnalysisRequest {
  query: string;
  zone?: string;
  patternData?: {
    baseline: number;
    current: number;
    zone: string;
  };
  correlationData?: {
    zone_a?: { zone: string; activity: number };
    zone_b?: { zone: string; activity: number };
    events?: Array<{ zone: string; activity: number }>;
  };
  historicalCases?: Array<{
    case_id: string;
    zone: string;
    status: string;
    activity_level: string;
    description: string;
  }>;
}

export const analyzeSituation = async (req: Request, res: Response) => {
  try {
    const {
      query,
      zone,
      patternData,
      correlationData,
      historicalCases,
    }: AnalysisRequest = req.body;

    if (!query && !patternData && !correlationData) {
      return res.status(400).json({
        success: false,
        message: "Query or data required for analysis",
      });
    }

    // Python AI backend
    const pythonApiUrl =
      process.env.PYTHON_API_URL ||
      "https://sudarshana-ai-python.onrender.com";

    console.log("🤖 Calling Python AI:", pythonApiUrl);

    const response = await fetch(`${pythonApiUrl}/api/situation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query || "",
        zone: zone || null,
        patternData: patternData || null,
        correlationData: correlationData || null,
        historicalCases: historicalCases || [],
      }),
    });

    const data = await response.json().catch(() => null);

    console.log("🤖 Python AI response:", response.status, data);

    if (!response.ok) {
      console.error("❌ Python AI error:", data);

      return res.status(response.status).json({
        success: false,
        message:
          data?.detail ||
          data?.message ||
          "Python AI service unavailable",
        response:
          data?.response ||
          "⚠️ AI service is currently unavailable. Please try again later.",
      });
    }

    return res.json({
      success: true,
      response: data?.response || "Analysis complete.",
      context: data?.context || {},
      sources: data?.sources || ["AI Analysis"],
    });
  } catch (error: any) {
    console.error("❌ AI Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to connect to Python AI service",
      response:
        "❌ Unable to connect to the AI service. Please check the Python backend.",
      error: error?.message || "Unknown error",
    });
  }
};