import io
import re
from typing import Tuple

def clean_extracted_text(text: str) -> str:
    """Normalize whitespace and remove unprintable characters while preserving structure."""
    if not text:
        return ""
    # Normalize carriage returns and tabs
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Replace non-breaking spaces and unusual whitespace
    text = text.replace('\xa0', ' ').replace('\u200b', '')
    # Condense 3+ newlines into 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Strip trailing whitespace on lines
    lines = [line.strip() for line in text.split('\n')]
    return '\n'.join(lines).strip()

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """Extract text from a PDF file using pypdf. Returns (text, page_count)."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        page_count = len(reader.pages)
        pages_text = []
        for i, page in enumerate(reader.pages):
            p_text = page.extract_text() or ""
            if p_text.strip():
                pages_text.append(p_text.strip())
        full_text = clean_extracted_text("\n\n".join(pages_text))
        return full_text, page_count
    except Exception as e:
        raise ValueError(f"Failed to parse PDF document: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, int]:
    """Extract text from a DOCX file using python-docx. Returns (text, paragraph_count)."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = []
        
        # Extract main paragraphs
        for p in doc.paragraphs:
            if p.text.strip():
                paragraphs.append(p.text.strip())
                
        # Extract text from tables if any
        for table in doc.tables:
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if cells:
                    paragraphs.append(" | ".join(cells))
                    
        full_text = clean_extracted_text("\n".join(paragraphs))
        return full_text, len(paragraphs)
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX document: {str(e)}")

def extract_text(file_bytes: bytes, filename: str) -> Tuple[str, dict]:
    """Auto-detect format by filename extension and extract text."""
    lower_name = filename.lower()
    if lower_name.endswith('.pdf'):
        text, count = extract_text_from_pdf(file_bytes)
        return text, {"type": "pdf", "pages": count, "char_count": len(text)}
    elif lower_name.endswith('.docx') or lower_name.endswith('.doc'):
        text, count = extract_text_from_docx(file_bytes)
        return text, {"type": "docx", "elements": count, "char_count": len(text)}
    elif lower_name.endswith('.txt'):
        text = clean_extracted_text(file_bytes.decode('utf-8', errors='ignore'))
        return text, {"type": "txt", "char_count": len(text)}
    else:
        raise ValueError(f"Unsupported file format '{filename}'. Please upload a PDF or DOCX file.")
