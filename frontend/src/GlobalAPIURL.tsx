const hostname = window.location.hostname;

export const APIURL =
  hostname === "localhost" ||
  hostname === "127.0.0.1"
    ? "http://localhost:4321"
    : "https://sudarshana-ai.onrender.com";