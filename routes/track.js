const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const supabase = require("../config/supabase");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const hashIP = (ip) =>
  crypto.createHash("sha256").update(ip).digest("hex");

router.post("/visit", async (req, res) => {
  try {
    const sessionId = uuidv4();
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;

    const { error } = await supabase.from("visits").insert({
      session_id: sessionId,
      landing_id: req.body.landingId,
      source: req.body.source || "propeller",
      user_agent: req.headers["user-agent"],
      ip_hash: hashIP(ip)
    });

    if (error) {
      console.error("Supabase Error (Visit):", error);
      throw error;
    }

    res.json({ sessionId });
  } catch (err) {
    console.error("Visit tracking error:", err);
    res.status(500).json({ error: "Visit tracking failed" });
  }
});

router.post("/click", async (req, res) => {
  try {
    const { error } = await supabase.from("clicks").insert({
      session_id: req.body.sessionId,
      landing_id: req.body.landingId
    });

    if (error) {
      console.error("Supabase Error (Click):", error);
      throw error;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Click tracking error:", err);
    res.status(500).json({ error: "Click tracking failed" });
  }
});

router.post("/lead", async (req, res) => {
  try {
    const { error } = await supabase.from("leads").insert({
      session_id: req.body.sessionId,
      landing_id: req.body.landingId,
      phone: req.body.phone
    });

    if (error) {
      console.error("Supabase Error (Lead):", error);
      throw error;
    }

    // AUTO-SAVE: Append to leads.csv locally
    const csvPath = path.join(__dirname, "../leads.csv");
    const timestamp = new Date().toISOString();
    const csvLine = `${timestamp},${req.body.phone},${req.body.landingId}\n`;

    // Check if file exists, if not write header
    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, "Timestamp,Phone,LandingID\n");
    }

    fs.appendFile(csvPath, csvLine, (err) => {
      if (err) console.error("Failed to auto-save CSV:", err);
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Lead tracking error:", err);
    res.status(500).json({ error: "Lead tracking failed" });
  }
});

module.exports = router;
