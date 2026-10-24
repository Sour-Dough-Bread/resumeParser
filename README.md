# 🚀 ResuGemma 4 — ATS Resume Parser & Optimizer

An intelligent **Applicant Tracking System (ATS) Resume Parser & Tailor** powered by **Google Gemma 4** running locally via the **Ollama API**, formatted using the industry-standard **Jake's Resume Template**.

---

## ✨ Features

- **Multi-Format Resume Ingestion**: Upload resumes in `.pdf`, `.docx`, `.doc`, or `.txt` formats, with automatic text and structure extraction.
- **Powered by Local Gemma 4 via Ollama**: Runs zero-data-leak local inference using your local Ollama daemon (`gemma4:latest`).
- **Job Description (JD) Tailoring**:
  - Paste any target Job Description (or use built-in presets).
  - Gemma 4 rewrites bullet points with impactful action verbs and quantified metrics (e.g. `Spearheaded... resulting in 35% improvement`).
  - Seamlessly weaves target technical skills and keywords into experience and project bullets.
- **Jake's Resume Template (Gold Standard for ATS)**:
  - Emulates Jake Gutierrez's famous single-column LaTeX resume layout.
  - Live interactive preview with authentic Computer Modern typography.
  - Generates 100% compile-ready `.tex` code compatible with Overleaf and `pdflatex`.
- **ATS Match Scorecard & Analytics**:
  - Real-time ATS match rating (0–100%).
  - Matched keywords (highlighted in emerald checkmarks).
  - Missing keywords from JD with suggestions for incorporation.
  - Actionable ATS tips to pass employer screening algorithms (Workday, Greenhouse, Lever, Taleo).
- **Multiple Export Options**:
  - **Print / PDF**: Pixel-perfect printable document via `@media print`.
  - **LaTeX (.tex)**: Authentic Jake's resume source code download.
  - **Markdown (.md)**: Clean markdown export.
  - **JSON**: Structured candidate data.
  - **Inline Edit Mode**: Click directly on any text in the live resume to tweak wording before exporting.

---

## 🛠️ Project Architecture

```
resumeParser/
├── backend/
│   ├── app.py                 # FastAPI server with REST endpoints & static file mounting
│   ├── document_parser.py     # PDF (pypdf) and DOCX (python-docx) text extraction
│   ├── ollama_service.py      # Ollama API client (gemma4:latest) with JSON constraint & ATS calculator
│   ├── jake_template.py       # Jake's Resume LaTeX and Markdown generators
│   └── sample_data.py         # Sample candidates and target Job Descriptions
├── frontend/
│   ├── index.html             # Split-workspace responsive UI
│   ├── style.css              # Obsidian glassmorphic design system
│   ├── jake_resume.css        # LaTeX emulation and print styles for Jake's resume
│   └── app.js                 # Interactive client state, drag-and-drop, export handlers
├── examples/
│   ├── sample_resume.pdf      # Sample PDF resume for immediate testing
│   ├── sample_resume.docx     # Sample DOCX resume
│   └── sample_resume.txt      # Sample text resume
├── requirements.txt           # Python backend dependencies
└── run.py                     # Single-command application launcher
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+** (Python 3.13 supported)
- **Ollama** installed and running with `gemma4:latest`:
  ```bash
  ollama run gemma4:latest
  ```

### 2. Quick Launch
Run the launcher using the virtual environment:
```powershell
./venv/Scripts/python run.py
```

Open your browser and navigate to:
```
http://127.0.0.1:8000
```

---

## 💡 How to Use

1. **Upload Resume**: Drag and drop your `.pdf` or `.docx` resume into the drop zone (or click **"Load Sample Data"** in the top navigation).
2. **Add Target Job Description**: Paste the job posting into the target description field (or select a preset chip like *AI / Full-Stack* or *Backend Systems*).
3. **Parse & Tailor**: Click **"✨ Parse & Tailor with Gemma 4"**.
4. **Inspect ATS Scorecard**: Review your match score, matched keywords, missing keywords, and optimizations applied.
5. **Review & Export**:
   - Preview the resume in Jake's format.
   - Toggle **Edit Mode** to edit any text directly on the page.
   - Click **Print / PDF** to save as a clean PDF or **Download .tex** to get the LaTeX file.
