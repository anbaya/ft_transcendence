import os
import hashlib
from google import genai

def get_api_key():
    return os.environ.get("GEMINI_API_KEY", "").strip()

def generate_fallback_embedding(text, dimension=128):
    tokens = text.lower().split()
    vector = [0.0] * dimension
    if not tokens:
        return vector

    for token in tokens:
        h = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
        index = h % dimension
        vector[index] += 1.0

    magnitude = sum(x * x for x in vector) ** 0.5
    if magnitude > 0:
        vector = [x / magnitude for x in vector]

    return vector

def generate_answer(prompt):
    api_key = get_api_key()

    if not api_key:
        return "Gemini API key (GEMINI_API_KEY) is not configured yet. Please provide your GEMINI_API_KEY in the .env file."

    client = genai.Client(api_key=api_key)
    models_to_try = [
        os.environ.get("GEMINI_MODEL", "gemini-3.8-flash"),
        "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
    ]

    last_error = None
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response and response.text:
                return response.text
        except Exception as e:
            last_error = e

    return f"Error generating answer with Gemini: {last_error}"

def generate_embedding(text):
    api_key = get_api_key()

    if not api_key:
        return None

    client = genai.Client(api_key=api_key)
    models_to_try = [
        os.environ.get("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001"),
        "gemini-embedding-001",
        "gemini-embedding-2",
        "text-embedding-004",
    ]

    for model_name in models_to_try:
        try:
            response = client.models.embed_content(
                model=model_name,
                contents=text,
            )
            if response and response.embeddings:
                return response.embeddings[0].values
        except Exception:
            pass

    return None

def classify_question(question):
    api_key = get_api_key()
    if not api_key:
        return "PROJECT"

    prompt = f"""Classify the following question. Return exactly one word:
PROJECT - if the question asks about the specific project, its tasks, documents, status, deadlines, members, or requirements.
GENERAL - if it is a general programming, technical, conceptual, or general knowledge question.

Question: {question}"""

    try:
        result = generate_answer(prompt).strip().upper()
        if "PROJECT" in result:
            return "PROJECT"
        if "GENERAL" in result:
            return "GENERAL"
    except Exception:
        pass

    return "PROJECT"