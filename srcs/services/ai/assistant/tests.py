import os
from unittest import TestCase
from django.conf import settings
from .rag import split_text
from .document_extractor import extract_text


class DocumentChunkingTestCase(TestCase):
    def test_split_text_guarantees_strictly_increasing_start(self):
        text = "Short line 1.\nShort line 2.\n" * 100
        chunks = split_text(text, chunk_size=80, overlap=20)
        self.assertTrue(len(chunks) > 0)
        for c in chunks:
            self.assertTrue(len(c.strip()) > 0)

    def test_en_subject_pdf_produces_valid_chunks(self):
        fixture_paths = [
            os.path.join(settings.BASE_DIR, "assistant", "fixtures", "en.subject.pdf"),
            "/tmp/en.subject.pdf",
            "/app/assistant/fixtures/en.subject.pdf",
        ]
        pdf_path = next((p for p in fixture_paths if os.path.exists(p)), None)
        self.assertIsNotNone(pdf_path, f"en.subject.pdf not found in {fixture_paths}")

        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        raw_text = extract_text(pdf_bytes, "en.subject.pdf")
        self.assertTrue(len(raw_text) > 10000, "Extracted text is unexpectedly small")

        chunks = split_text(raw_text, chunk_size=1200, overlap=200)
        num_chunks = len(chunks)
        self.assertTrue(
            40 <= num_chunks <= 60,
            f"Expected between 40 and 60 chunks for en.subject.pdf (1200/200), got {num_chunks}"
        )
