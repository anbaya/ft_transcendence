import math
from .models import DocumentChunk
from .document_extractor import extract_text
from .gemini_service import generate_embedding, generate_answer
from .document_service import get_project_documents, download_document
from .project_service import get_project, get_project_tasks, get_project_members

def split_text(text, chunk_size=1000, overlap=200):
    text = text.strip()
    if not text:
        return []

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        if end >= len(text):
            break
        start = end - overlap

    return chunks

def index_document(project_id, document_id, filename, file_bytes):
    text = extract_text(file_bytes, filename)
    if not text:
        return

    chunks = split_text(text)
    DocumentChunk.objects.filter(document_id=document_id).delete()

    for chunk in chunks:
        embedding = generate_embedding(chunk)
        DocumentChunk.objects.create(
            project_id=project_id,
            document_id=document_id,
            content=chunk,
            embedding=embedding,
        )

def index_project_documents(project_id, authorization_header):
    try:
        documents = get_project_documents(project_id, authorization_header)
    except Exception:
        return

    if not isinstance(documents, list):
        return

    current_document_ids = [
        doc["id"] for doc in documents if isinstance(doc, dict) and "id" in doc
    ]

    DocumentChunk.objects.filter(project_id=project_id).exclude(
        document_id__in=current_document_ids
    ).delete()

    for document in documents:
        if not isinstance(document, dict):
            continue
        document_id = document.get("id")
        filename = document.get("filename") or document.get("name") or "document"

        if not document_id:
            continue

        if DocumentChunk.objects.filter(document_id=document_id).exists():
            continue

        try:
            file_bytes = download_document(document_id, authorization_header)
            if file_bytes:
                index_document(
                    project_id=project_id,
                    document_id=document_id,
                    filename=filename,
                    file_bytes=file_bytes,
                )
        except Exception:
            pass

def cosine_similarity(vector_a, vector_b):
    if not vector_a or not vector_b:
        return 0.0

    length = min(len(vector_a), len(vector_b))
    dot_product = sum(vector_a[i] * vector_b[i] for i in range(length))

    norm_a = math.sqrt(sum(a * a for a in vector_a))
    norm_b = math.sqrt(sum(b * b for b in vector_b))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot_product / (norm_a * norm_b)

def retrieve_relevant_chunks(project_id, question, top_k=5):
    chunks = list(DocumentChunk.objects.filter(project_id=project_id))
    if not chunks:
        return []

    question_embedding = generate_embedding(question)
    scored_chunks = []

    for chunk in chunks:
        score = cosine_similarity(question_embedding, chunk.embedding)
        scored_chunks.append((score, chunk))

    scored_chunks.sort(key=lambda item: item[0], reverse=True)
    return [chunk for score, chunk in scored_chunks[:top_k] if score > 0.0]

def build_context(chunks):
    if not chunks:
        return ""
    return "\n\n".join(chunk.content for chunk in chunks)

def answer_general_question(question):
    prompt = f"""You are a professional, helpful, and concise AI assistant.
Answer the following question in a clear, well-structured, and accurate manner.

Question:
{question}"""
    return generate_answer(prompt)

def answer_project_question(project_id, question, authorization_header, project_data=None):
    if not project_data:
        try:
            project_data = get_project(project_id, authorization_header)
        except Exception:
            project_data = {}

    project_name = project_data.get("name", f"Project #{project_id}")
    project_desc = project_data.get("description", "No description provided.")
    project_status = project_data.get("status", "Not defined")
    project_priority = project_data.get("priority", "Not defined")
    project_deadline = project_data.get("deadline", "Not defined")

    tasks = get_project_tasks(project_id, authorization_header)
    tasks_text_parts = []
    if isinstance(tasks, list) and tasks:
        for t in tasks:
            t_title = t.get("title", "")
            t_status = t.get("status", "")
            t_priority = t.get("priority", "")
            t_assignee = t.get("assignee_name") or (f"User #{t.get('assignee_id')}" if t.get('assignee_id') else "Unassigned")
            t_deadline = t.get("deadline", "None")
            tasks_text_parts.append(f"- Task: {t_title} | Status: {t_status} | Priority: {t_priority} | Assigned to: {t_assignee} | Deadline: {t_deadline}")
        tasks_text = "\n".join(tasks_text_parts)
    else:
        tasks_text = "No tasks recorded for this project."

    members = get_project_members(project_id, authorization_header)
    members_text_parts = []
    if isinstance(members, list) and members:
        for m in members:
            name = f"{m.get('first_name', '')} {m.get('last_name', '')}".strip() or m.get('email', 'Member')
            members_text_parts.append(f"- {name} (Role: {m.get('role', 'Member')})")
        members_text = "\n".join(members_text_parts)
    else:
        members_text = "Member information not available."

    try:
        index_project_documents(project_id, authorization_header)
    except Exception:
        pass

    relevant_chunks = retrieve_relevant_chunks(project_id, question)
    doc_context = build_context(relevant_chunks)
    if not doc_context:
        doc_context = "No relevant documents indexed for this project."

    prompt = f"""You are the collaborative AI assistant for project "{project_name}".
Here is all available context regarding this project:

General Project Information:
- Name: {project_name}
- Description: {project_desc}
- Status: {project_status}
- Priority: {project_priority}
- Deadline: {project_deadline}

Project Team Members:
{members_text}

Project Tasks:
{tasks_text}

Relevant Document Extracts (RAG):
{doc_context}

User Question:
{question}

Instructions:
- Provide a clear, concise, helpful, and professional answer.
- If the question asks about project progress, tasks (overdue tasks, todo tasks, assignments), use the tasks list and their deadlines.
- If the question asks about requirements, specifications, or document contents, use the provided document extracts.
- If the question asks for a summary, synthesize the project goals, team, task completion status, and key documents.
- If information is not present in the provided data, state it politely without inventing data."""

    return generate_answer(prompt)