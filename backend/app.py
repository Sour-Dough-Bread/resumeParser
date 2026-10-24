import os
import sys
import io
from typing import Optional, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add current folder to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from document_parser import extract_text, clean_extracted_text
from ollama_service import (
    get_installed_models, 
    is_ollama_alive, 
    parse_and_tailor_resume,
    generate_cover_letter
)
from jake_template import generate_jake_latex, generate_jake_markdown
from sample_data import SAMPLE_RESUME_TEXT, SAMPLE_JOB_DESCRIPTIONS

app = FastAPI(
    title="Gemma 4 ATS Resume Tailor & Jake's Resume Generator",
    description="Intelligent ATS Resume Parser & Optimizer powered by local Gemma 4 via Ollama",
    version="1.0.0"
)

# Enable CORS for flexible local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProcessResumeRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = ""
    model: Optional[str] = "gemma4:latest"
    temperature: Optional[float] = 0.2

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = ""
    model: Optional[str] = "gemma4:latest"
    candidate_data: Optional[Dict[str, Any]] = None

class ExportLatexRequest(BaseModel):
    resume_data: Dict[str, Any]

@app.get("/api/health")
def health_check():
    ollama_ok = is_ollama_alive()
    return {
        "status": "healthy",
        "ollama_connected": ollama_ok,
        "default_model": "gemma4:latest"
    }

@app.get("/api/models")
def list_models():
    """Fetch installed Ollama models and find Gemma 4."""
    models = get_installed_models()
    has_gemma4 = any("gemma4" in m.get("name", "").lower() for m in models)
    return {
        "models": models,
        "recommended": "gemma4:latest" if has_gemma4 else (models[0]["name"] if models else "gemma4:latest"),
        "has_gemma4": has_gemma4,
        "ollama_online": is_ollama_alive()
    }

@app.get("/api/samples")
def get_sample_inputs():
    """Provide pre-loaded sample resume and target job descriptions for instant 1-click test."""
    return {
        "sample_resume": SAMPLE_RESUME_TEXT.strip(),
        "job_descriptions": SAMPLE_JOB_DESCRIPTIONS
    }

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload resume document (PDF or DOCX), extract and return clean text."""
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
            
        extracted_text, metadata = extract_text(content, file.filename)
        
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text from document. Ensure it is not an image-only scan."
            )
            
        return {
            "filename": file.filename,
            "metadata": metadata,
            "raw_text": extracted_text,
            "preview": extracted_text[:300] + ("..." if len(extracted_text) > 300 else "")
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document parsing failed: {str(e)}")

@app.post("/api/process")
async def process_resume_and_jd(payload: ProcessResumeRequest):
    """
    Core AI Pipeline:
    Uses Gemma 4 via Ollama to parse resume sections, tailor against target job description,
    compute ATS score, match keywords, and generate Jake's Resume structure.
    """
    if not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required.")

    if not is_ollama_alive():
        raise HTTPException(
            status_code=503, 
            detail="Ollama daemon is not reachable at http://localhost:11434. Please ensure Ollama is running."
        )

    try:
        parsed_resume = parse_and_tailor_resume(
            resume_text=payload.resume_text,
            job_description=payload.job_description or "",
            model_name=payload.model or "gemma4:latest",
            temperature=payload.temperature or 0.2
        )
        
        # Generate Jake's LaTeX and Markdown outputs
        latex_code = generate_jake_latex(parsed_resume)
        markdown_text = generate_jake_markdown(parsed_resume)
        
        # Generate initial tailored cover letter
        cover_letter_data = generate_cover_letter(
            resume_text=payload.resume_text,
            job_description=payload.job_description or "",
            model_name=payload.model or "gemma4:latest",
            candidate_data=parsed_resume
        )

        return {
            "success": True,
            "resume": parsed_resume,
            "latex": latex_code,
            "markdown": markdown_text,
            "cover_letter": cover_letter_data,
            "ats_analysis": parsed_resume.get("ats_analysis", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemma 4 processing error: {str(e)}")

@app.post("/api/cover-letter")
async def generate_standalone_cover_letter(payload: CoverLetterRequest):
    """Generate or regenerate tailored cover letter based on resume and JD."""
    try:
        data = generate_cover_letter(
            resume_text=payload.resume_text,
            job_description=payload.job_description or "",
            model_name=payload.model or "gemma4:latest",
            candidate_data=payload.candidate_data
        )
        return {"success": True, **data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")

@app.post("/api/export/latex")
def export_latex(payload: ExportLatexRequest):
    """Export the current resume data as a downloadable Jake's Resume .tex file."""
    latex_code = generate_jake_latex(payload.resume_data)
    candidate_name = payload.resume_data.get("contact", {}).get("name", "resume")
    safe_name = "".join(c for c in candidate_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
    filename = f"{safe_name}_jakes_resume.tex"
    
    return Response(
        content=latex_code,
        media_type="application/x-tex",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.post("/api/export/markdown")
def export_markdown(payload: ExportLatexRequest):
    """Export the current resume data as a downloadable Markdown file."""
    md_content = generate_jake_markdown(payload.resume_data)
    candidate_name = payload.resume_data.get("contact", {}).get("name", "resume")
    safe_name = "".join(c for c in candidate_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
    filename = f"{safe_name}_jakes_resume.md"
    
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# Frontend static files mounting
frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
