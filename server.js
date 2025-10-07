// ====================== server.js ======================
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// File to store registrations
const dataFile = path.join(__dirname, "registrations.json");

// Helper function: read registrations
function readRegs() {
  if (!fs.existsSync(dataFile)) return [];
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// Helper function: save registrations
function saveRegs(regs) {
  fs.writeFileSync(dataFile, JSON.stringify(regs, null, 2));
}

// ========== Public API ==========

// POST /register
app.post("/register", (req, res) => {
  const { name, email, affiliation, category, presenting, paperTitle } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, msg: "Name and Email are required." });
  }

  const regs = readRegs();
  const newReg = {
    id: Date.now().toString(),
    name,
    email,
    affiliation: affiliation || "",
    category: category || "",
    presenting: presenting || "No",
    paperTitle: paperTitle || ""
  };

  regs.push(newReg);
  saveRegs(regs);

  res.json({ success: true, msg: "✅ Registration successful!", reg: newReg });
});

// ========== Admin API ==========

// GET /admin/registrations
app.get("/admin/registrations", (req, res) => {
  const regs = readRegs();
  res.json(regs);
});

// DELETE /admin/registrations/:id
app.delete("/admin/registrations/:id", (req, res) => {
  const { id } = req.params;
  let regs = readRegs();

  const idx = regs.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, msg: "❌ Registration not found." });
  }

  regs.splice(idx, 1);
  saveRegs(regs);

  res.json({ success: true, msg: "✅ Registration deleted." });
});

// ========== Start Server ==========
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

