import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  const { resumeText } = req.body;

  const prompt = `Analyze this resume and give:
  1. Score/100
  2. Three Strengths
  3. Three Improvements

  Text: ${resumeText}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
