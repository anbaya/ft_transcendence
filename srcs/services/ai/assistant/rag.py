import math
from .models import DocumentChunk
from .document_extractor import extract_text
from .gemini_service import generate_embedding, generate_answer
from .document_service import get_project_documents, download_document
from .project_service import get_project, get_project_tasks, get_project_members

def split_text(text, chunk_size=2500, overlap=400):
    text = text.strip()
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end >= len(text):
            chunks.append(text[start:].strip())
            break

        # Try to find a natural break point (paragraph or newline or sentence)
        boundary = text.rfind("\n\n", start, end)
        if boundary == -1 or boundary <= start:
            boundary = text.rfind("\n", start, end)
        if boundary == -1 or boundary <= start:
            boundary = text.rfind(". ", start, end)

        if boundary > start:
            chunks.append(text[start:boundary].strip())
            start = max(boundary - overlap, start + 1)
        else:
            chunks.append(text[start:end].strip())
            start = end - overlap

    return [c for c in chunks if c]

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

    if len(vector_a) != len(vector_b):
        return 0.0

    dot_product = sum(vector_a[i] * vector_b[i] for i in range(len(vector_a)))

    norm_a = math.sqrt(sum(a * a for a in vector_a))
    norm_b = math.sqrt(sum(b * b for b in vector_b))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot_product / (norm_a * norm_b)

def retrieve_relevant_chunks(project_id, question, top_k=10):
    chunks = list(DocumentChunk.objects.filter(project_id=project_id))
    if not chunks:
        return []

    # If the total project documents are reasonably sized (<= 15 chunks),
    # supply the complete document context to Gemini to ensure zero information loss.
    if len(chunks) <= 15:
        chunks.sort(key=lambda c: (c.document_id, c.id))
        return chunks

    question_embedding = generate_embedding(question)

    if not question_embedding:
        words = set(question.lower().split())
        scored = []
        for chunk in chunks:
            c_text = chunk.content.lower()
            overlap = sum(1 for w in words if len(w) > 3 and w in c_text)
            scored.append((overlap, chunk))
        scored.sort(key=lambda item: item[0], reverse=True)
        selected = [chunk for _, chunk in scored[:top_k]]
        selected.sort(key=lambda c: (c.document_id, c.id))
        return selected

    scored_chunks = []
    for chunk in chunks:
        score = cosine_similarity(question_embedding, chunk.embedding)
        scored_chunks.append((score, chunk))

    scored_chunks.sort(key=lambda item: item[0], reverse=True)
    selected = [chunk for score, chunk in scored_chunks[:top_k] if score > 0.05]
    if not selected and scored_chunks:
        selected = [chunk for _, chunk in scored_chunks[:3]]
    # Re-sort selected chunks by document_id and chunk id to preserve document reading flow
    selected.sort(key=lambda c: (c.document_id, c.id))
    return selected

def build_context(chunks):
    if not chunks:
        return ""
    return "\n\n".join(chunk.content for chunk in chunks)

def answer_general_question(question, conversation_history=""):
    history_section = ""
    if conversation_history:
        history_section = f"\nRecent Conversation History:\n{conversation_history}\n"

    prompt = f"""You are a professional, helpful, and concise AI assistant.
Answer the following question in a clear, well-structured, and accurate manner.

Rules:
- Always answer in the exact same language as the user's question (e.g., if asked in French, reply in French; if asked in English, reply in English).
{history_section}
User Question:
{question}"""
    return generate_answer(prompt)

def answer_project_question(project_id, question, authorization_header, project_data=None, conversation_history=""):
    if not project_data:
        try:
            project_data = get_project(project_id, authorization_header)
        except Exception:
            project_data = {}

    from django.utils import timezone
    current_date_str = timezone.now().strftime("%Y-%m-%d")

    project_name = project_data.get("name", f"Project #{project_id}")
    project_desc = project_data.get("description", "No description provided.")
    project_status = project_data.get("status", "Not defined")
    project_priority = project_data.get("priority", "Not defined")
    project_start_date = project_data.get("start_date", "Not defined")
    project_deadline = project_data.get("deadline", "Not defined")

    tasks = get_project_tasks(project_id, authorization_header)
    tasks_text_parts = []
    if isinstance(tasks, list) and tasks:
        for t in tasks:
            t_title = t.get("title", "")
            t_desc = t.get("description", "").strip() if t.get("description") else ""
            t_status = t.get("status", "")
            t_priority = t.get("priority", "")
            t_assignee = t.get("assignee_name") or (f"User #{t.get('assignee_id')}" if t.get('assignee_id') else "Unassigned")
            t_deadline = t.get("deadline", "None")
            desc_part = f" | Description: {t_desc}" if t_desc else ""
            tasks_text_parts.append(f"- Task: {t_title}{desc_part} | Status: {t_status} | Priority: {t_priority} | Assigned to: {t_assignee} | Deadline: {t_deadline}")
        tasks_text = "\n".join(tasks_text_parts)
    else:
        tasks_text = "No tasks recorded for this project."

    members = get_project_members(project_id, authorization_header)
    members_text_parts = []
    if isinstance(members, list) and members:
        for m in members:
            name = f"{m.get('first_name', '')} {m.get('last_name', '')}".strip() or "Member"
            email = m.get('email', '')
            role = m.get('role', 'Member')
            email_part = f" | Email: {email}" if email else ""
            members_text_parts.append(f"- {name}{email_part} (Role: {role})")
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

    history_section = ""
    if conversation_history:
        history_section = f"\nRecent Conversation History:\n{conversation_history}\n"

    prompt = f"""You are the collaborative AI assistant for project "{project_name}".
Here is all available context regarding this project:

Current Server Date: {current_date_str}

General Project Information:
- Name: {project_name}
- Description: {project_desc}
- Status: {project_status}
- Priority: {project_priority}
- Start Date: {project_start_date}
- Deadline: {project_deadline}

Project Team Members:
{members_text}

Project Tasks:
{tasks_text}

Relevant Document Extracts (RAG):
{doc_context}
{history_section}
User Question:
{question}

Instructions:
- Always answer in the exact same language as the user's question (e.g., if asked in French, reply in French).
- Provide a clear, concise, helpful, and professional answer.
- Temporal awareness: Today's date is {current_date_str}. When answering about overdue tasks, upcoming deadlines, or timeline progress, strictly compare each task or project deadline to this date ({current_date_str}).
- If the question asks about project progress, tasks (overdue tasks, todo tasks, assignments), use the tasks list and their deadlines.
- If the question asks about requirements, specifications, or document contents, use the provided document extracts.
- If the question asks for a summary, synthesize the project goals, team, task completion status, and key documents.
- If information is not present in the provided data, state it politely without inventing data."""

    return generate_answer(prompt)