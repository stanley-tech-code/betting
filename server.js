require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
// connectDB(); // Removed for Supabase switch

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve static files

app.use("/api/track", require("./routes/track"));
app.use("/api/stats", require("./routes/stats"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
