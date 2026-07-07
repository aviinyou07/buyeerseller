import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes.js";
import pool from "./db.js";

// ─── Config ───────────────────────────────────────────────────────────────────
dotenv.config();

const app = express();
// When running behind a proxy (e.g. a reverse proxy or cloud load balancer),
// trust the proxy so that `req.protocol`, `req.ip`, and other proxy-aware
// values are populated correctly for uploads and feature flags that depend
// on the request origin. Can be overridden by setting TRUST_PROXY env var.
app.set('trust proxy', process.env.TRUST_PROXY ?? true);
const PORT = process.env.PORT || 4000;
const defaultAllowedOrigins = [
  "https://lmdkp9hf-5173.inc1.devtunnels.ms/",
  "https://lmdkp9hf-5174.inc1.devtunnels.ms/",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
const configuredAllowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...configuredAllowedOrigins,
]);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "BuySell API is running.",
    ts: new Date().toISOString(),
  });
});

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const adminRoutes = require("./modules/admin/routes/index.js");

app.use("/api/admin", adminRoutes);
app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use((err, _req, res, _next) => {
  console.error("[UnhandledError]", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

(async () => {
  try {
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'listings' AND COLUMN_NAME = 'meta'`,
      [process.env.DB_NAME || "buysell"],
    );
    if (!cols || cols.length === 0) {
      console.log("listings.meta column missing — adding meta JSON column");
      await pool.query(
        `ALTER TABLE listings ADD COLUMN meta JSON DEFAULT NULL`,
      );
      console.log("listings.meta column added");
    }
  } catch (err) {
    console.error("Error ensuring DB schema:", err);
  }

  app.listen(PORT, () => {
    console.log(`✅  BuySell API listening on http://localhost:${PORT}`);
  });
})();
