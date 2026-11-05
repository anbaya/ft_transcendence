import io
import re
import unicodedata


def clean_text(text: str) -> str:
    """
    Cleans, sanitizes, and normalizes raw extracted document text.
    - Normalizes Unicode characters (NFKC)
    - Removes null control characters (\x00) and other non-printable chars
    - Normalizes non-breaking and invisible whitespace
    - Standardizes quotes and dashes
    - Strips recurrent page numbers and headers/footers
    - Collapses excessive blank lines and whitespace
    """
    if not text:
        return ""

    text = unicodedata.normalize("NFKC", text)

    text = text.replace("\x00", "")
    text = "".join(
        ch for ch in text
        if ch in ("\n", "\t") or unicodedata.category(ch)[0] != "C"
    )

    text = re.sub(r"[\xa0\u200b\u200c\u200d\u2060\ufeff]+", " ", text)

    text = re.sub(r'[""«»]', '"', text)
    text = re.sub(r"[''`]", "'", text)
    text = re.sub(r"[—–―]", "-", text)

    text = re.sub(r"(?i)\bpage\s+\d+\s*(?:/|of|-)\s*\d+\b", "", text)
    text = re.sub(r"(?i)\bpage\s+\d+\b", "", text)
    text = re.sub(r"^\s*-\s*\d+\s*-\s*$", "", text, flags=re.MULTILINE)

    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]
    text = "\n".join(lines)

    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def extract_pdf(file_bytes):
    """
    Extracts text from PDF bytes.
    First attempts standard extraction via PyPDF.
    If the extracted text is empty or too short (scanned PDF / image-only),
    falls back to Gemini Multimodal OCR.
    """
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
        extracted = "\n\n".join(pages)
        cleaned = clean_text(extracted)

        if len(cleaned) >= 50:
            return cleaned

        from .gemini_service import ocr_pdf_multimodal
        ocr_text = ocr_pdf_multimodal(file_bytes)
        if ocr_text:
            return clean_text(ocr_text)

        return cleaned
    except Exception:
        try:
            from .gemini_service import ocr_pdf_multimodal
            ocr_text = ocr_pdf_multimodal(file_bytes)
            return clean_text(ocr_text)
        except Exception:
            return ""


def extract_docx(file_bytes):
    try:
        from docx import Document
        document = Document(io.BytesIO(file_bytes))
        parts = []
        for paragraph in document.paragraphs:
            text = paragraph.text.strip()
            if text:
                parts.append(text)

        for table in document.tables:
            table_lines = []
            for row in table.rows:
                row_cells = []
                for cell in row.cells:
                    cell_text = cell.text.strip().replace("\n", " ")
                    if not row_cells or cell_text != row_cells[-1]:
                        row_cells.append(cell_text)
                if any(row_cells):
                    table_lines.append(" | ".join(row_cells))
            if table_lines:
                parts.append("\n[Table]\n" + "\n".join(table_lines) + "\n")

        return clean_text("\n\n".join(parts))
    except Exception:
        return ""


def extract_txt(file_bytes):
    try:
        decoded = file_bytes.decode("utf-8", errors="ignore")
        return clean_text(decoded)
    except Exception:
        return ""


def extract_csv(file_bytes):
    try:
        import pandas as pd
        dataframe = pd.read_csv(io.BytesIO(file_bytes))
        return clean_text(dataframe.to_csv(index=False))
    except Exception:
        try:
            return clean_text(file_bytes.decode("utf-8", errors="ignore"))
        except Exception:
            return ""


def extract_xlsx(file_bytes):
    try:
        import pandas as pd
        sheets = pd.read_excel(io.BytesIO(file_bytes), sheet_name=None)
        parts = []
        for sheet_name, dataframe in sheets.items():
            parts.append(f"Sheet: {sheet_name}")
            parts.append(dataframe.to_csv(index=False))
        return clean_text("\n\n".join(parts))
    except Exception:
        return ""


# correction: extracteur de texte pour images (png, jpg, jpeg, webp) via OCR multimodal
def extract_image(file_bytes, extension):
    """
    Extracts text from image files (png, jpg, jpeg, webp) using Gemini Multimodal OCR.
    """
    mime_map = {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "webp": "image/webp",
    }
    mime_type = mime_map.get(extension.lower(), "image/png")
    try:
        from .gemini_service import ocr_file_multimodal
        text = ocr_file_multimodal(file_bytes, mime_type=mime_type)
        if text:
            return clean_text(text)
    except Exception:
        pass
    return ""


def extract_text(file_bytes, filename):
    if not file_bytes:
        return ""

    extension = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    # correction: support de l'OCR pour les formats d'images (PNG, JPG, JPEG, WEBP)
    if extension in ("png", "jpg", "jpeg", "webp"):
        return extract_image(file_bytes, extension)

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
        return clean_text(file_bytes.decode("utf-8", errors="ignore"))
    except Exception:
        return ""
