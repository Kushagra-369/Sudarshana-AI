"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const routes_1 = __importDefault(require("./routes/routes"));
dotenv_1.default.config({ quiet: true });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const mongoURL = process.env.MONGO_URI;
const PORT = process.env.PORT;
if (!mongoURL) {
    console.error("❌ MONGO_URI not found in environment variables");
    process.exit(1);
}
mongoose_1.default
    .connect(mongoURL)
    .then(() => {
    console.log("🌐 MongoDB connected");
    console.log("🔥 Mongo Host:", mongoose_1.default.connection.host);
    console.log("🔥 Mongo Database:", mongoose_1.default.connection.name);
})
    .catch((err) => {
    console.error("MongoDB error:", err);
    process.exit(1);
});
// ✅ health check
app.get("/", (req, res) => {
    res.send("Server is running");
});
app.use("/", routes_1.default);
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map