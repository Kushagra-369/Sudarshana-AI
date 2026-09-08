"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSituation = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const analyzeSituation = async (req, res) => {
    try {
        const { query, zone, patternData, correlationData, historicalCases } = req.body;
        if (!query && !patternData && !correlationData) {
            return res.status(400).json({
                success: false,
                message: "Query or data required for analysis",
            });
        }
        // Check if Python AI API script exists
        const pythonScript = path_1.default.join(__dirname, "../../ai/situation_engine/api.py");
        if (!fs_1.default.existsSync(pythonScript)) {
            // Fallback: Use direct Python module execution
            return res.status(500).json({
                success: false,
                message: "AI service not available. Please ensure the Python backend is running.",
                response: "⚠️ AI service is currently unavailable. Please try again later.\n\n*The situation analysis engine is not responding.*",
            });
        }
        // Call Python AI service via child process
        const pythonProcess = (0, child_process_1.spawn)("python3", [
            pythonScript,
            JSON.stringify({
                query: query || "",
                zone: zone || null,
                patternData: patternData || null,
                correlationData: correlationData || null,
                historicalCases: historicalCases || [],
            }),
        ]);
        let result = "";
        let error = "";
        pythonProcess.stdout.on("data", (data) => {
            result += data.toString();
        });
        pythonProcess.stderr.on("data", (data) => {
            error += data.toString();
        });
        const timeout = setTimeout(() => {
            pythonProcess.kill();
            return res.status(504).json({
                success: false,
                message: "AI analysis timed out",
                response: "⏱️ The analysis took too long to complete. Please try again with a more specific query.\n\n*Timeout: 30 seconds*",
            });
        }, 30000);
        pythonProcess.on("close", (code) => {
            clearTimeout(timeout);
            if (code !== 0) {
                console.error("Python AI error:", error);
                // Check if it's a Python import error
                if (error.includes("ModuleNotFoundError") || error.includes("ImportError")) {
                    return res.status(500).json({
                        success: false,
                        message: "AI module not found. Please check Python dependencies.",
                        response: "⚠️ The AI engine is not properly configured. Please ensure all Python dependencies are installed.\n\n*Error: Missing modules*",
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: "AI analysis failed",
                    error: error || "Unknown error",
                    response: "❌ I encountered an error while analyzing the situation. Please try again.\n\n*Error: Analysis failed*",
                });
            }
            try {
                // Parse the JSON response from Python
                const data = JSON.parse(result);
                // If Python returned an error
                if (data.error) {
                    return res.status(500).json({
                        success: false,
                        message: data.error,
                        response: `⚠️ ${data.error}`,
                    });
                }
                return res.json({
                    success: true,
                    response: data.response || "Analysis complete.",
                    context: data.context || {},
                    sources: data.sources || ["AI Analysis"],
                });
            }
            catch (parseError) {
                console.error("Parse error:", parseError);
                console.error("Raw output:", result);
                // If we got a response but it's not JSON, use it as plain text
                if (result && result.trim()) {
                    return res.json({
                        success: true,
                        response: result.trim(),
                        sources: ["AI Analysis"],
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: "Invalid response from AI service",
                    response: "⚠️ The AI service returned an unexpected response. Please try again.",
                });
            }
        });
    }
    catch (error) {
        console.error("AI Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process request",
            response: "❌ Unable to connect to the AI service. Please check if the backend is running.",
        });
    }
};
exports.analyzeSituation = analyzeSituation;
//# sourceMappingURL=ai_controller.js.map