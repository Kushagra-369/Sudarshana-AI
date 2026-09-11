// backend/src/controller/ai_controller.ts

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

    // Python AI service deployed separately on Render
    const pythonApiUrl =
      process.env.PYTHON_API_URL ||
      "https://sudarshana-ai-python.onrender.com";

    console.log("🤖 Sending AI request to:", pythonApiUrl);

    const pythonResponse = await fetch(
      `${pythonApiUrl}/api/situation`,
      {
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
      }
    );

    const data = await pythonResponse.json();

    console.log(
      "🤖 Python AI response:",
      pythonResponse.status,
      data
    );

    if (!pythonResponse.ok) {
      return res.status(pythonResponse.status).json({
        success: false,
        message: data.detail || data.message || "Python AI service failed",
        response:
          data.response ||
          "⚠️ AI service returned an error.",
      });
    }

    return res.json({
      success: true,
      response: data.response || "Analysis complete.",
      context: data.context || {},
      sources: data.sources || ["AI Analysis"],
    });

  } catch (error) {
    console.error("❌ AI Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to connect to Python AI service",
      response:
        "❌ Unable to connect to the AI service. Please check the Python backend.",
    });
  }
};