import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Gauge,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromPDF } from './utils/pdfParser';
import Markdown from 'react-markdown';

function App() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const analyzeWithAI = async (resumeText) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });

      const data = await response.json();
      if (response.ok) return data.result;
      throw new Error(data.error || 'AI analysis failed.');
    } catch (error) {
      console.error('Analysis Error:', error);
      throw error;
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF resume.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Your PDF is larger than 10 MB. Please choose a smaller file.');
      return;
    }

    setFileName(file.name);
    setError('');
    setAnalysis(null);
    setLoading(true);

    try {
      const text = await extractTextFromPDF(file);
      if (!text?.trim()) throw new Error('No readable text was found in this PDF.');
      const result = await analyzeWithAI(text);
      setAnalysis(result);
    } catch (err) {
      setError(err.message || 'Something went wrong while analyzing your resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setLoading(false);
    setFileName('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={handleReset} aria-label="ResumeAI home">
            <span className="brand-icon"><WandSparkles size={19} /></span>
            <span>
              <strong>ResumeAI</strong>
              <small>Smart career insights</small>
            </span>
          </button>
          <div className="header-pill"><ShieldCheck size={15} /> Private & secure</div>
        </div>
      </header>

      <main className="main-content">
        {!analysis && !loading ? (
          <motion.section
            className="hero"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="eyebrow"><Sparkles size={14} /> AI-POWERED RESUME REVIEW</div>
            <h1>Turn your resume into your <span>career advantage.</span></h1>
            <p className="hero-copy">
              Upload your resume and let AI review its clarity, impact, skills, and job-readiness — with practical feedback you can act on.
            </p>

            <div className="upload-card">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFile}
                className="sr-only"
                id="pdf-input"
              />
              <label htmlFor="pdf-input" className="dropzone">
                <span className="upload-icon"><Upload size={25} /></span>
                <span className="upload-title">Drop your resume here</span>
                <span className="upload-subtitle">or click to browse your files</span>
                <span className="upload-meta">PDF only · Maximum 10 MB</span>
                <span className="upload-action">Choose PDF <ArrowRight size={16} /></span>
              </label>

              {error && (
                <div className="error-box" role="alert">
                  <X size={17} /> {error}
                </div>
              )}
            </div>

            <div className="trust-row">
              <span><CheckCircle2 size={16} /> Instant AI analysis</span>
              <span><ShieldCheck size={16} /> Your resume stays private</span>
              <span><Gauge size={16} /> Actionable recommendations</span>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <span><Gauge size={18} /></span>
                <div><strong>Clarity score</strong><p>Spot weak or unclear sections.</p></div>
              </div>
              <div className="feature-card">
                <span><FileText size={18} /></span>
                <div><strong>Content review</strong><p>Improve your resume's impact.</p></div>
              </div>
              <div className="feature-card">
                <span><WandSparkles size={18} /></span>
                <div><strong>AI recommendations</strong><p>Get specific next steps.</p></div>
              </div>
            </div>
          </motion.section>
        ) : loading ? (
          <motion.section className="loading-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="loader-orb"><Loader2 size={30} className="spin" /></div>
            <div className="eyebrow"><Sparkles size={14} /> AI ANALYSIS IN PROGRESS</div>
            <h2>Reading your resume<span>...</span></h2>
            <p>We're reviewing your experience, skills, structure, and overall presentation.</p>
            {fileName && <div className="file-chip"><FileText size={15} /> {fileName}</div>}
            <div className="progress-track"><span /></div>
          </motion.section>
        ) : (
          <motion.section className="results-section" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="results-topbar">
              <div>
                <div className="eyebrow"><CheckCircle2 size={14} /> ANALYSIS COMPLETE</div>
                <h2>Your resume review</h2>
                {fileName && <p className="result-file"><FileText size={14} /> {fileName}</p>}
              </div>
              <button className="reset-button" onClick={handleReset}><RotateCcw size={16} /> Analyze another</button>
            </div>

            <div className="report-card">
              <div className="report-heading">
                <div className="report-icon"><Sparkles size={20} /></div>
                <div><strong>AI Resume Report</strong><span>Personalized insights generated for your resume</span></div>
              </div>
              <div className="report-content">
                <Markdown>{analysis}</Markdown>
              </div>
              <button className="primary-button" onClick={handleReset}>Improve another resume <ArrowRight size={17} /></button>
            </div>
          </motion.section>
        )}
      </main>

      <footer className="site-footer">
        <span>ResumeAI</span><span>Built for better applications · AI can make mistakes, so verify important information.</span>
      </footer>
    </div>
  );
}

export default App;
