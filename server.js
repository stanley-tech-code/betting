
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Route Adapters for Consolidated API Files
const trackHandler = require("./api/track");
const statsHandler = require("./api/stats");
const trafficHandler = require("./api/traffic");
const engineHandler = require("./api/engine");

// Helper to simulate Vercel query params from URL path
// In Vercel, rewrites map /api/track/visit -> /api/track.js?action=visit
// Here we just use the handler and rely on the frontend sending ?action=... OR custom routing
// User's frontend sends: /api/stats/dashboard-summary -> which maps to ?action=dashboard-summary in Vercel config
// BUT the Vercel config rewrites: "source": "/api/stats/dashboard-summary", "destination": "/api/stats.js?action=dashboard-summary"

// We can implement these specific routes manually to match Vercel:

// TRACK
app.get("/api/track/visit", (req, res) => { req.query.action = 'visit'; trackHandler(req, res); });
app.get("/api/track/click", (req, res) => { req.query.action = 'click'; trackHandler(req, res); });
app.post("/api/track/lead", (req, res) => { req.query.action = 'lead'; trackHandler(req, res); });

// STATS
app.get("/api/stats/dashboard-summary", (req, res) => { req.query.action = 'dashboard-summary'; statsHandler(req, res); });
app.get("/api/stats/history", (req, res) => { req.query.action = 'history'; statsHandler(req, res); });
app.get("/api/stats/download-leads", (req, res) => { req.query.action = 'download-leads'; statsHandler(req, res); });

// TRAFFIC
app.get("/api/traffic/go", (req, res) => { req.query.action = 'go'; trafficHandler(req, res); });
app.get("/api/traffic/monitor", (req, res) => { req.query.action = 'monitor'; trafficHandler(req, res); });

// ENGINE (VARIANT/AI)
app.post("/api/variant/propose", (req, res) => { req.query.action = 'propose'; engineHandler(req, res); });
app.get("/api/variant/list", (req, res) => { req.query.action = 'list'; engineHandler(req, res); });
app.get("/api/variant/get", (req, res) => { req.query.action = 'get'; engineHandler(req, res); });
app.post("/api/variant/status", (req, res) => { req.query.action = 'status'; engineHandler(req, res); });
app.get("/api/variant/analyze", (req, res) => { req.query.action = 'analyze'; engineHandler(req, res); });
app.post("/api/variant/apply-weights", (req, res) => { req.query.action = 'apply-weights'; engineHandler(req, res); });
app.post("/api/variant/apply-manual", (req, res) => { req.query.action = 'apply-manual'; engineHandler(req, res); }); // New endpoint
app.post("/api/ai/forecast", (req, res) => { req.query.action = 'forecast'; engineHandler(req, res); });
app.get("/api/ai/analyze", (req, res) => { req.query.action = 'ai-analyze'; engineHandler(req, res); });

// Generic Fallback for query-based (e.g. /api/engine?action=...)
app.all("/api/engine", engineHandler);
app.all("/api/stats", statsHandler);
app.all("/api/traffic", trafficHandler);
app.all("/api/track", trackHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
