# 🚀 Frontend Integration To-Do Plan

> Based on a full scan of `srcs/frontend/src/` and all backend `urls.py` files.
> All real backend endpoint URLs are confirmed from the source code.

---

## Phase 1 — Auth Service (`/api/auth/`)

> **File to edit:** `src/pages/auth/LoginPage.tsx`, `src/stores/authStore.ts`

### ✅ Endpoints Available (from `auth/users/urls.py`)
| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/auth/login/` | Login → returns `access` + `refresh` JWT tokens |
| POST | `/api/auth/register/` | Register new user |
| GET/PATCH | `/api/auth/me/` | Get / update current user profile |
| POST | `/api/auth/logout/` | Logout (blacklist token) |
| POST | `/api/auth/refresh/` | Refresh JWT access token |
| POST | `/api/auth/change-password/` | Change password |
| POST | `/api/auth/forgot-password/` | Request password reset email |
| POST | `/api/auth/reset-password/` | Submit new password via reset token |

### 📋 To-Do
- [x] **`LoginPage.tsx` line 37–44**: Replace mock `setTimeout` + fake `login()` call with `apiClient.post('/api/auth/login/', data)`. On success, extract `access` token and `user` from response, then call `useAuthStore.login()`.
- [x] **`authStore.ts`**: Add `persist` middleware (e.g., `zustand/middleware/persist` with `localStorage`) so the JWT token survives a page refresh.
- [x] **Create `src/pages/auth/RegisterPage.tsx`** integration: wire the form to `POST /api/auth/register/`.
- [x] **`src/hooks/useAuth.ts`** (currently empty): implement a `useAuth` hook that calls `GET /api/auth/me/` on app load to rehydrate the user session from a stored token.
- [x] **`src/pages/auth/ForgotPasswordPage.tsx`**: wire form to `POST /api/auth/forgot-password/`.
- [x] **`src/pages/profile/`**: wire profile edit form to `PATCH /api/auth/me/` and change-password form to `POST /api/auth/change-password/`.

---

## Phase 2 — Project Service (`/api/projects/` & `/api/organizations/`)

> **File to create:** `src/stores/projectStore.ts`, `src/stores/organizationStore.ts`
> *(These stores don't exist yet — the frontend only has feature components)*

### ✅ Endpoints Available (from `project/projects/urls.py` & `organizations/urls.py`)
| Method | URL | Purpose |
|--------|-----|---------|
| GET/POST | `/api/projects/` | List all / create project |
| GET/PUT/DELETE | `/api/projects/<id>/` | Project detail |
| GET/POST | `/api/projects/<id>/members/` | List / add member |
| DELETE | `/api/projects/<id>/members/<id>/` | Remove member |
| GET/POST | `/api/organizations/` | List all / create org |
| GET/PUT/DELETE | `/api/organizations/<id>/` | Org detail |
| GET/POST | `/api/organizations/<id>/members/` | List / add org member |
| DELETE | `/api/organizations/<id>/members/<id>/` | Remove org member |

### 📋 To-Do
- [x] **Create `src/stores/projectStore.ts`**: replace any hardcoded project data in features with `apiClient.get('/api/projects/')`, `apiClient.post('/api/projects/', data)`, etc.
- [x] **Create `src/stores/organizationStore.ts`**: wire to `/api/organizations/` endpoints. The `src/types/organization.ts` type file is currently empty — fill it in to match the backend's response shape.
- [x] **`src/pages/projects/`**: use projectStore to load and display real project data.
- [x] **`src/features/organizations/`**: wire organization pages and member management UI.

> ⚠️ **Note for DevOps:** The gateway is missing `/api/organizations/`. Add it to `nginx.conf` before this phase can be tested.

---

## Phase 3 — Task Service (`/api/tasks/`)

> **File to create:** `src/stores/taskStore.ts`

### ✅ Endpoints Available (from `task/tasks/urls.py`)
| Method | URL | Purpose |
|--------|-----|---------|
| GET/POST | `/api/tasks/projects/<id>/tasks/` | List / create tasks for a project |
| GET/PUT/DELETE | `/api/tasks/tasks/<id>/` | Task detail |
| PATCH | `/api/tasks/tasks/<id>/status/` | Update task status |
| PATCH | `/api/tasks/tasks/<id>/assignee/` | Update task assignee |
| GET | `/api/tasks/users/me/tasks/` | Get current user's own tasks |

### 📋 To-Do
- [x] **Create `src/stores/taskStore.ts`**: replace any hardcoded task data with real API calls.
- [x] **`src/pages/tasks/`**: use taskStore to display task lists, and wire the status-change toggle to `PATCH /api/tasks/tasks/<id>/status/`.
- [x] **`src/pages/dashboard/`**: use `GET /api/tasks/users/me/tasks/` to show "My Tasks" widget with real data.

---

## Phase 4 — Document Service (`/api/documents/`)

> **File to edit:** `src/stores/documentStore.ts`

### ✅ Endpoints Available (from `document/documents/urls.py`)
| Method | URL | Purpose |
|--------|-----|---------|
| GET/POST | `/api/documents/projects/<id>/documents/` | List / upload docs for a project |
| GET/DELETE | `/api/documents/documents/<id>/` | Document detail / delete |
| GET | `/api/documents/documents/<id>/download/` | Download a file |

### 📋 To-Do
- [x] **`documentStore.ts` `fetchDocuments()`** (line 101–104): Replace mock with `apiClient.get('/api/documents/projects/${projectId}/documents/')`.
- [x] **`documentStore.ts` `uploadFile()`** (line 65–91): Replace the fake progress loop with a real `FormData` `multipart/form-data` POST to `/api/documents/projects/${projectId}/documents/`. Use `onUploadProgress` in axios to get real progress.
- [x] **`documentStore.ts` `deleteDocument()`** (line 93–98): Replace mock with `apiClient.delete('/api/documents/documents/${id}/')`.
- [x] **Wire the download button** in the documents page to `/api/documents/documents/<id>/download/`.

---

## Phase 5 — Chat Service (`/api/conversations/` + WebSocket `/ws/`)

> **Files to implement:** `src/services/websocket/client.ts`, `src/services/websocket/events.ts`
> *(Both files are currently completely empty)*

### ✅ Endpoints Available (from `chat/conversations/urls.py` & `notifications/urls.py`)
| Method | URL | Purpose |
|--------|-----|---------|
| GET/POST | `/api/conversations/<id>/messages/` | List / send messages in a conversation |
| GET | `/api/conversations/messages/<id>/` | Message detail |
| GET | `/api/conversations/projects/<id>/` | Get a project's conversation |
| GET | `/api/notifications/` | List user notifications |
| PATCH | `/api/notifications/<id>/read/` | Mark notification as read |
| WebSocket | `wss://.../ws/` | Real-time messages & events |

### 📋 To-Do
- [x] **`src/services/websocket/client.ts`** (empty): Implement a WebSocket manager class. It should:
  - Connect to `wss://<host>/ws/` with the JWT token as a query param or header.
  - Auto-reconnect on disconnect.
  - Expose `send(event, payload)` and `on(event, callback)` methods.
- [x] **`src/services/websocket/events.ts`** (empty): Define all WebSocket event type constants (e.g., `'message.new'`, `'notification.created'`).
- [x] **`src/features/chat/`**: Use `apiClient.get('/api/conversations/projects/${id}/')` on page load to get the conversation ID, then use the WebSocket client to send/receive messages in real-time.
- [x] **`src/stores/notificationStore.ts` `fetchNotifications()`** (line 54–68): Replace mock with `apiClient.get('/api/notifications/')`.
- [x] **`notificationStore.ts` `markAsRead()`** (line 70–79): Add `apiClient.patch('/api/notifications/${id}/read/')` call alongside the local state update.

> ⚠️ **Note for DevOps:** Gateway is missing `/api/conversations/` and `/api/notifications/` HTTP routes. Add to `nginx.conf`.

---

## Phase 6 — Analytics (`/api/analytics/`)

### ✅ Endpoints Available (from `project/analytics/urls.py`)
| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/projects/<id>/analytics/` | Get analytics data for a project |

### 📋 To-Do
- [x] **`src/pages/analytics/`**: Wire the analytics dashboard to `apiClient.get('/api/projects/${id}/analytics/')`.

> ⚠️ **Note for DevOps:** Gateway is missing `/api/analytics/`. Add to `nginx.conf`.

---

## Phase 7 — AI Service (`/api/ai/`)

> **File to edit:** `src/stores/aiStore.ts`

### ❌ Backend Not Ready
The `ai-service` is an **empty Dockerfile** with no code. The frontend cannot integrate this until the Backend team implements it.

### 📋 To-Do (Frontend — Prep Only)
- [ ] **`aiStore.ts` `sendMessage()`** (line 97–181): Keep the mock for now. When the Backend confirms the AI API shape, replace `setTimeout` mock with `apiClient.post('/api/ai/chat/', { message: content, project_id: projectId })`.
- [ ] Define the expected request/response type in `src/types/ai.ts` and share it with the Backend team so they build to the same contract.

---

## Quick Summary

| Phase | Service | Status | Blocked? |
|-------|---------|--------|----------|
| 1 | Auth | ✅ Backend Ready | No |
| 2 | Projects & Orgs | ✅ Backend Ready | ⚠️ DevOps: missing `/api/organizations/` in gateway |
| 3 | Tasks | ✅ Backend Ready | No |
| 4 | Documents | ✅ Backend Ready | No |
| 5 | Chat & Notifications | ✅ Backend Ready | ⚠️ DevOps: missing `/api/conversations/` & `/api/notifications/` in gateway |
| 6 | Analytics | ✅ Complete | ✅ Complete |
| 7 | AI | ❌ Backend Empty | Blocked — Backend must implement first |
