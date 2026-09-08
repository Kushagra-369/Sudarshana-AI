const hostname = window.location.hostname;

export const APIURL =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "http://localhost:4321"
    : hostname === "sudarshana-ai.vercel.app"
    ? "https://sudarshana-ai.onrender.com"
    : "http://192.168.1.13:4321";

export const PYTHON_API_URL =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : hostname === "sudarshana-ai.vercel.app"
    ? "https://sudarshana-ai-python.onrender.com"
    : "http://192.168.1.13:8000";