import express from "express";
import cors from "cors";
// import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";


dotenv.config();
import { fileURLToPath } from "url";

// Current directory nikalne ke liye (ES Modules mein zaroori hai)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dotenv ko batayein ke .env file ek level bahar (root mein) hai
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const API_KEY = String(process.env.GEMINI_API_KEY)

console.log("Checking Key:", process.env.GEMINI_API_KEY ? "Key Found! ✅" : "Key Not Found! ❌");

const app = express();
app.use(cors({
  origin: "*", // Sab origins allow karne ke liye
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

app.post("/api/analyze", async (req, res) => {
  const { resumeText } = req.body;

  const prompt = `Analyze this resume and give:
  1. Score/100
  2. Three Strengths
  3. Three Improvements

  Text: ${resumeText}`;


  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (response.ok && data.candidates) {
      res.json({
        result: data.candidates[0].content.parts[0].text
      });
    } else {
      res.status(500).json({
        error: data.error?.message || "AI error"
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default app;
