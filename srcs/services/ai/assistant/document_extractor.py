import io
import pandas as pd
from docx import Document
from pypdf import PdfReader

def extract_pdf(file_bytes):
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
        return "\n".join(pages)
    except Exception:
        return ""

def extract_docx(file_bytes):
    try:
        document = Document(io.BytesIO(file_bytes))
        paragraphs = []
        for paragraph in document.paragraphs:
            text = paragraph.text.strip()
            if text:
                paragraphs.append(text)
        return "\n".join(paragraphs)
    except Exception:
        return ""

def extract_txt(file_bytes):
    try:
        return file_bytes.decode("utf-8", errors="ignore")
    except Exception:
        return ""

def extract_csv(file_bytes):
    try:
        dataframe = pd.read_csv(io.BytesIO(file_bytes))
        return dataframe.to_csv(index=False)
    except Exception:
        return ""

def extract_xlsx(file_bytes):
    try:
        sheets = pd.read_excel(io.BytesIO(file_bytes), sheet_name=None)
        parts = []
        for sheet_name, dataframe in sheets.items():
            parts.append(f"Sheet: {sheet_name}")
            parts.append(dataframe.to_csv(index=False))
        return "\n".join(parts)
    except Exception:
        return ""

def extract_text(file_bytes, filename):
    if not file_bytes:
        return ""

    extension = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if extension == "pdf":
        return extract_pdf(file_bytes)

    if extension in ("docx", "doc"):
        return extract_docx(file_bytes)

    if extension in ("txt", "md", "json", "py", "c", "cpp", "h", "html", "css", "js", "ts", "yaml", "yml", "xml", "log", "sh"):
        return extract_txt(file_bytes)

    if extension == "csv":
        return extract_csv(file_bytes)

    if extension in ("xlsx", "xls"):
        return extract_xlsx(file_bytes)

    try:
        return file_bytes.decode("utf-8", errors="ignore")
    except Exception:
        return ""