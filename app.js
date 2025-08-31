const express = require("express");
const mongoose = require("mongoose");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MongoDB Atlas connection =====
const mongoUrl = process.env.MONGO_URL || "PASTE_YOUR_MONGO_ATLAS_CONNECTION_STRING";

// Define schema & model
const recordSchema = new mongoose.Schema({
  message: String,
  timestamp: Date
});
const Record = mongoose.model("Record", recordSchema);

// Connect to MongoDB
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ===== CPU spike simulation =====
function randomCpuSpike() {
  const shouldSpike = Math.random() < 0.3; // ~30% chance
  if (shouldSpike) {
    console.log("⚡ Simulating CPU spike...");
    const end = Date.now() + 5000; // 5 seconds
    while (Date.now() < end) {
      Math.sqrt(Math.random() * Math.random()); // waste CPU
    }
  }
}

// ===== Routes =====
app.get("/", (req, res) => {
  res.send("Hello from AWS Elastic Beanstalk + MongoDB Atlas!");
});

app.get("/write", async (req, res) => {
  randomCpuSpike();

  try {
    const record = new Record({
      message: "Hello MongoDB Atlas!",
      timestamp: new Date()
    });
    await record.save();
    res.send("✅ Record written to MongoDB");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to write to MongoDB");
  }
});

app.get("/read", async (req, res) => {
  randomCpuSpike();

  try {
    const record = await Record.findOne().sort({ timestamp: -1 });
    if (record) {
      res.json({ message: "✅ Read success", record });
    } else {
      res.send("⚠️ No records found in MongoDB");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to read from MongoDB");
  }
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
