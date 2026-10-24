# ResuGemma — ATS Resume Parser & Personalized Cover Letter Generator

A minimalist, high-precision **Applicant Tracking System (ATS) Resume Parser & Tailor** powered by **Google Gemma 4** via local **Ollama API**, styled in a distraction-free **Black & White editorial design** and formatting resumes to **Jake's Resume Template**.

---

## Features

- **Multi-Format Resume Ingestion**: Upload resumes in `.pdf`, `.docx`, `.doc`, or `.txt` formats with automatic text extraction.
- **Personalized Cover Letter Generator**: Generates a tailored executive cover letter aligning the candidate's quantified achievements with the target company and role.
- **Minimalist Black & White Design**: Replaces generic AI-style neon/purple gradients with a clean, editorial monochrome design system (Swiss typography, crisp 1px borders, solid black action buttons).
- **Target Job Description Tailoring**:
  - Aligns bullet points with strong action verbs and bolded metrics (`**15M requests/day**`).
  - Automatically incorporates keywords and core competencies from the target posting.
- **Jake's Resume Template (Gold Standard for ATS)**:
  - Single-column LaTeX layout optimized for screen readers and enterprise ATS parsers (Workday, Greenhouse, Lever).
  - Live interactive preview and downloadable `.tex` source code.
- **ATS Match Scorecard**:
  - Match percentage score.
  - Matched keywords vs. missing keywords breakdown.
- **Export & Inline Edit**:
  - **Cover Letter & Resume Switcher**: Switch between documents with one click.
  - **Inline Edit Mode**: Click any paragraph or bullet point to edit before printing.
  - **Print / PDF**: Clean print preview formatted via `@media print`.
  - **Export to LaTeX (.tex), Markdown (.md), and JSON**.

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
