const hostname = window.location.hostname;

export const APIURL =
  hostname === "localhost" ||
  hostname === "127.0.0.1"
    ? "http://localhost:4321"
    : "http://192.168.1.13:4321";