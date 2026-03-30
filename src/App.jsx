import React, { useState } from 'react';
import { Upload, Cpu, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { extractTextFromPDF } from './utils/pdfParser';
import Markdown from 'react-markdown';

function App() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeWithAI = async (resumeText) => {
    const API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

    const prompt = `Analyze this resume and give: 1. Score/100, 2. Three Strengths, 3. Three Improvements. Text: ${resumeText}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();

      // 2. Mazeed behtar error handling taake exact pata chale masla kya hai
      if (response.ok && data.candidates && data.candidates[0]) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error("Gemini Error Details:", data);
        // Agar model not found ho toh dusra model try karein ya message dikhayein
        return `AI Error: ${data.error?.message || "Model not responding. Please check your API key permissions in Google AI Studio."}`;
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      return "Network error. Please try again.";
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      const result = await analyzeWithAI(text);
      setAnalysis(result);
    } catch (err) {
      alert("Error reading PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setLoading(false);
    // Input field ko reset karne ke liye hum file input ki value bhi clear kar sakte hain
    const fileInput = document.getElementById('pdf-input');
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
          AI Resume <span className="text-blue-500">Scanner</span>
        </h1>
        <p className="text-slate-400">Upload your PDF and get instant feedback</p>
      </header>

      {/* Upload Box */}
      <div className="w-full max-w-2xl border-2 border-dashed border-slate-800 rounded-3xl p-12 bg-slate-900/50 hover:border-blue-500/50 transition-all text-center">
        <input type="file" accept=".pdf" onChange={handleFile} className="hidden" id="pdf-input" />
        <label htmlFor="pdf-input" className="cursor-pointer flex flex-col items-center">
          <Upload className="w-12 h-12 text-blue-500 mb-4" />
          <span className="text-lg font-medium">Click to upload your resume</span>
          <span className="text-sm text-slate-500 mt-1">(PDF only)</span>
        </label>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-10 flex items-center gap-3 text-blue-400 animate-pulse">
          <Loader2 className="animate-spin" />
          <span>Analyzing with Gemini AI...</span>
        </div>
      )}

      {/* Results Display */}
      {analysis && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-6 text-emerald-400">
            <CheckCircle size={24} />
            <h2 className="text-xl font-bold uppercase tracking-wider">Analysis Report</h2>
          </div>

          <div className="prose prose-invert max-w-none whitespace-pre-line text-slate-300 text-left mb-8">
            <Markdown>
              {analysis}
            </Markdown>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Upload size={18} />
            Analyze Another Resume
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default App;