const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// ── Routes ──
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// ── Health check ──
app.get("/api/health", (_, res) => res.json({ status: "ok", service: "medivoice-backend" }));

// ── Global error handler ──
app.use((err, _req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));