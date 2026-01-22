const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Dashboard summary per landing
router.get("/dashboard-summary", async (req, res) => {
  try {
    // Fetch today's visits
    const { data: visitsData, error: visitsError } = await supabase
      .from("visits")
      .select("landing_id")
      .gte("created_at", new Date().toISOString().split("T")[0]);

    if (visitsError) throw visitsError;

    // Fetch today's clicks
    const { data: clicksData, error: clicksError } = await supabase
      .from("clicks")
      .select("landing_id")
      .gte("created_at", new Date().toISOString().split("T")[0]);

    if (clicksError) throw clicksError;

    // Fetch today's phone leads
    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select("landing_id, phone") // Select phone just in case, though not used in summary count
      .gte("created_at", new Date().toISOString().split("T")[0]);

    if (leadsError) throw leadsError;

    // Fetch recent leads (limit 50)
    const { data: recentLeads, error: recentLeadsError } = await supabase
      .from("leads")
      .select("phone, created_at, landing_id")
      .order("created_at", { ascending: false })
      .limit(50);

    if (recentLeadsError) throw recentLeadsError;

    // Build summary
    const summary = {};

    // Initialize helper
    const initLanding = (id) => {
      if (!summary[id]) summary[id] = { visits: 0, clicks: 0, leads: 0, ctr: 0 };
    }

    if (visitsData) {
      visitsData.forEach(v => {
        initLanding(v.landing_id);
        summary[v.landing_id].visits += 1;
      });
    }

    if (clicksData) {
      clicksData.forEach(c => {
        initLanding(c.landing_id);
        summary[c.landing_id].clicks += 1;
      });
    }

    if (leadsData) {
      leadsData.forEach(l => {
        initLanding(l.landing_id);
        summary[l.landing_id].leads += 1;
      });
    }

    // Calculate CTR
    Object.keys(summary).forEach(key => {
      summary[key].ctr = summary[key].visits > 0 ? ((summary[key].clicks / summary[key].visits) * 100).toFixed(2) : 0;
    });

    res.json({ stats: summary, recentLeads });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

// Bulk Download Endpoint (Backup)
router.get("/download-leads", async (req, res) => {
  try {
    const { data: leads, error } = await supabase
      .from("leads")
      .select("created_at, phone, landing_id")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Convert to CSV
    const csvHeader = "Timestamp,Phone,LandingID\n";
    const csvRows = leads.map(l => `${l.created_at},${l.phone},${l.landing_id}`).join("\n");
    const csvContent = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=all_leads_history.csv");
    res.send(csvContent);

  } catch (e) {
    console.error("Download failed:", e);
    res.status(500).send("Failed to download CSV");
  }
});

module.exports = router;
