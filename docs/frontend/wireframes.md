# Phase 2 — Wireframes

Structural layout blueprints for every view in the application.
Design system: Geist font, minimalist SaaS, 80/15/5 visual formula.

---

## 1. Authentication

All auth screens use a **split layout**: left side is a branding panel, right side is the form.

### Login

```
+---------------------------------------------------------------+
|                                                               |
|   +---------------------------+  +-------------------------+  |
|   |                           |  |                         |  |
|   |   [Logo]                  |  |   Welcome back          |  |
|   |                           |  |   Sign in to continue   |  |
|   |   "Work, without          |  |                         |  |
|   |    the noise."            |  |   Email                 |  |
|   |                           |  |   [___________________] |  |
|   |   Subtle gradient bg      |  |                         |  |
|   |   #F8FAFC → #EEF2FF   |  |   Password              |  |
|   |                           |  |   [___________________] |  |
|   |                           |  |                         |  |
|   |                           |  |   [ ] Remember me       |  |
|   |                           |  |       Forgot password?  |  |
|   |                           |  |                         |  |
|   |                           |  |   [■■■ Sign in ■■■■■■]  |  |
|   |                           |  |   (Primary button)      |  |
|   |                           |  |                         |  |
|   |                           |  |   ─── or continue ───   |  |
|   |                           |  |                         |  |
|   |                           |  |   Don't have an account?|  |
|   |                           |  |   Sign up →             |  |
|   +---------------------------+  +-------------------------+  |
|                                                               |
+---------------------------------------------------------------+
```

- **Left panel**: `50%` width, soft gradient background, app logo + tagline.
- **Right panel**: `50%` width, white `#FFFFFF`, vertically centered form card.
- **Mobile**: Left panel hidden, form takes full width with logo above.

### Register

```
+---------------------------+  +-------------------------------+
|                           |  |   Create your account         |
|   [Logo]                  |  |   Get started for free        |
|                           |  |                               |
|   Branding panel          |  |   Full name                   |
|   (same as Login)         |  |   [_________________________] |
|                           |  |                               |
|                           |  |   Email                       |
|                           |  |   [_________________________] |
|                           |  |                               |
|                           |  |   Password                    |
|                           |  |   [_________________________] |
|                           |  |                               |
|                           |  |   Confirm password            |
|                           |  |   [_________________________] |
|                           |  |                               |
|                           |  |   [■■ Create account ■■■■■]   |
|                           |  |                               |
|                           |  |   Already have an account?    |
|                           |  |   Sign in →                   |
+---------------------------+  +-------------------------------+
```

### Forgot Password

```
+---------------------------+  +-------------------------------+
|                           |  |   Reset your password         |
|   [Logo]                  |  |   Enter your email and we'll  |
|                           |  |   send a reset link.          |
|   Branding panel          |  |                               |
|                           |  |   Email                       |
|                           |  |   [_________________________] |
|                           |  |                               |
|                           |  |   [■■ Send reset link ■■■■]   |
|                           |  |                               |
|                           |  |   ← Back to sign in          |
+---------------------------+  +-------------------------------+
```

### Reset Password

```
+---------------------------+  +-------------------------------+
|                           |  |   Set new password            |
|   [Logo]                  |  |   Choose a strong password    |
|                           |  |                               |
|   Branding panel          |  |   New password                |
|                           |  |   [_________________________] |
|                           |  |                               |
|                           |  |   Confirm password            |
|                           |  |   [_________________________] |
|                           |  |                               |
|                           |  |   [■■ Reset password ■■■■■]   |
+---------------------------+  +-------------------------------+
```

---

## 2. Main Application Shell

All authenticated pages share this shell layout.

### Overall Shell

```
+--------+------------------------------------------------------+
| SIDEBAR|  HEADER (sticky top, 64px)                           |
|  240px |  [≡] Breadcrumb / Page Title    [⌘K] [🤖] [🔔 3] [👤▾]|
|        +------------------------------------------------------+
|        |                                                      |
| [Logo] |                                                      |
| [Org▾] |              MAIN CONTENT AREA                       |
|        |              (scrollable)                             |
| ────── |                                                      |
| # Dash |              Varies per page.                        |
| □ Proj |              Padded: 32px.                            |
| ✓ Tasks|              Max-width: 1280px, centered.            |
| 💬 Chat|                                                      |
| 📄 Docs|                                                      |
| 🤖 AI  |                                                      |
| 📊 Anal|                                                      |
| ────── |                                                      |
| ⚙ Admin|                                                      |
| ? Help |                                                      |
| « Coll |                                                      |
+--------+------------------------------------------------------+
```

### Dashboard

```
+--------+------------------------------------------------------+
| SIDEBAR|  HEADER                                              |
|        +------------------------------------------------------+
|        |                                                      |
|        |  Good morning, Anoir.                    (24px, 600) |
|        |  You have 7 tasks remaining today.       (14px, 400) |
|        |                                                      |
|        |  +------------+ +------------+ +------------------+  |
|        |  | Today's    | | This Week  | | Completion Rate  |  |
|        |  | Tasks      | | Total      | |                  |  |
|        |  |    7       | |    31      | |    78%           |  |
|        |  | ▲14% vs lw | | ▲8% vs lw | | [████████░░] bar |  |
|        |  +------------+ +------------+ +------------------+  |
|        |                                                      |
|        |  +--- Today -----------+  +--- This Week ---------+  |
|        |  | Task name  ● High  |  |  Mon Tue Wed Thu Fri   |  |
|        |  |  Project · Design  |  |  [activity heatmap]    |  |
|        |  |            2h ago  |  |                        |  |
|        |  |                    |  +------------------------+  |
|        |  | Task name  ● Med  |                               |
|        |  |  Project · Dev    |  +--- Active Projects -----+  |
|        |  |            30m    |  | Website      ████░ 75%  |  |
|        |  |                   |  | Mobile App   ███░░ 67%  |  |
|        |  | Task name  ○ Low  |  | Campaign     ██░░░ 50%  |  |
|        |  |  Biz · Comms      |  +-------------------------+  |
|        |  +-------------------+                               |
|        |                                                      |
+--------+------------------------------------------------------+
```

- **Metric Cards**: 3 across the top. White card, `1px` border, flat.
- **Today's Tasks**: Left column, scrollable list. Each item shows task name, priority badge, project label, and time.
- **This Week / Active Projects**: Right column, weekly heatmap and project progress bars.

### Sidebar (Expanded & Collapsed)

```
EXPANDED (240px)                COLLAPSED (64px)
+------------------------+     +--------+
| [Logo] Astra           |     | [Logo] |
| [Acme Corp         ▾]  |     +--------+
+------------------------+     | [#]    |
| MAIN                   |     | [□]    |
| [#] Dashboard          |     | [✓] 12 |
| [□] Projects           |     | [💬] 3 |
| [✓] Tasks         (12) |     | [📄]   |
| [💬] Chat           (3) |     | [🤖]   |
| [📄] Documents         |     | [📊]   |
| [🤖] AI Assistant  NEW |     +--------+
| [📊] Analytics         |     | [⚙]   |
+------------------------+     | [«]    |
| ADMIN                  |     +--------+
| [⚙] Admin Console      |
+------------------------+
| [?] Help & Support     |
| [»] Collapse           |
+------------------------+
```

### Header

```
+--------------------------------------------------------------+
| [≡]  Dashboard                [Search or ⌘K...]  [🤖] [🔔 3] [Avatar ▾] |
+--------------------------------------------------------------+
```

- `[≡]` hamburger — visible only on mobile.
- Breadcrumb or page title on left.
- Search bar (centered).
- AI toggle, notification bell with badge, user avatar dropdown on right.

### Profile Menu (User Avatar Dropdown)

```
                              +-------------------------+
                              |  [Avatar] Anoir Baya    |
                              |  anoir@example.com      |
                              |  ● Online               |
                              +-------------------------+
                              |  👤 My Profile           |
                              |  ⚙ Account Settings     |
                              +-------------------------+
                              |  🚪 Log out              |
                              +-------------------------+
```

### Notification Panel (Dropdown / Slide-out)

```
                          +-------------------------------+
                          |  Notifications           Mark |
                          |                       all read|
                          +-------------------------------+
                          |  ● Douaa assigned you a task  |
                          |    "Fix API endpoint"         |
                          |    2 minutes ago              |
                          +-------------------------------+
                          |  ● New message in #general    |
                          |    Anas: "Updated the docs"   |
                          |    15 minutes ago             |
                          +-------------------------------+
                          |  ○ Project "Mobile App"       |
                          |    deadline tomorrow          |
                          |    1 hour ago                 |
                          +-------------------------------+
                          |  View all notifications →     |
                          +-------------------------------+
```

- `●` = unread (bold text, `#F1F5F9` background highlight).
- `○` = read (normal weight).

---

## 3. Organizations

### Organization List

```
+--------------------------------------------------------------+
|  Organizations                        [+ Create Organization] |
+--------------------------------------------------------------+
|                                                               |
|  +---------------------------+  +---------------------------+ |
|  | [Avatar] Acme Corp       |  | [Avatar] Startup Inc     | |
|  | 12 members · 5 projects  |  | 4 members · 2 projects   | |
|  | Role: Admin              |  | Role: Member             | |
|  | [View →]                 |  | [View →]                 | |
|  +---------------------------+  +---------------------------+ |
|                                                               |
|  +---------------------------+                                |
|  | [Avatar] Side Project    |                                |
|  | 2 members · 1 project    |                                |
|  | Role: PM                 |                                |
|  | [View →]                 |                                |
|  +---------------------------+                                |
+--------------------------------------------------------------+
```

### Organization Details

```
+--------------------------------------------------------------+
|  ← Organizations  /  Acme Corp                               |
+--------------------------------------------------------------+
|                                                               |
|  +----------------------------------------------------------+|
|  | [Avatar]  Acme Corp                        [⚙ Settings]  ||
|  |  Created Jan 2025 · 12 members · 5 projects              ||
|  +----------------------------------------------------------+|
|                                                               |
|  [Members]  [Projects]  [Settings]    ← Tabs                 |
|  ──────────────────────────────────                           |
|                                                               |
|  (Tab content renders below based on active tab)              |
+--------------------------------------------------------------+
```

### Organization Members (Tab Content)

```
+--------------------------------------------------------------+
|  Members (12)                             [+ Add Member]      |
+--------------------------------------------------------------+
|  NAME              EMAIL                ROLE      ACTIONS     |
|  ─────────────────────────────────────────────────────────    |
|  [Av] Anoir Baya   anoir@mail.com      [Admin▾]   [···]     |
|  [Av] Douaa E.     douaa@mail.com      [PM   ▾]   [···]     |
|  [Av] Anas K.      anas@mail.com       [Member▾]  [···]     |
|  ...                                                          |
+--------------------------------------------------------------+
```

- Role column uses a `Select` dropdown (editable by Admin/PM).
- `[···]` opens a small dropdown: *View Profile*, *Remove Member*.

### Add Member (Modal)

```
+--------------------------------------------------------------+
|                                                               |
|     +----------------------------------------------+         |
|     |  Add Member to Acme Corp              [✕]    |         |
|     +----------------------------------------------+         |
|     |                                              |         |
|     |  Search by email or name                     |         |
|     |  [________________________________]          |         |
|     |                                              |         |
|     |  Select role                                 |         |
|     |  [Member                            ▾]       |         |
|     |                                              |         |
|     +----------------------------------------------+         |
|     |               [Cancel]  [■ Add Member ■]     |         |
|     +----------------------------------------------+         |
|                                                               |
+--------------------------------------------------------------+
```

### Remove Member (Confirmation Dialog)

```
+----------------------------------------------+
|  Remove member?                       [✕]    |
+----------------------------------------------+
|                                              |
|  Are you sure you want to remove             |
|  Anas K. from Acme Corp?                     |
|  This action cannot be undone.               |
|                                              |
+----------------------------------------------+
|               [Cancel]  [■ Remove ■]         |
|                         (Destructive btn)    |
+----------------------------------------------+
```

---

## 4. Projects

### Project List

```
+--------------------------------------------------------------+
|  Projects                                  [+ New Project]    |
+--------------------------------------------------------------+
|                                                               |
|  [All]  [Active]  [Completed]  [Archived]    ← Filter tabs   |
|  ──────────────────────────────────────────                   |
|                                                               |
|  +----------------------------------------------------------+|
|  | Website Redesign                          ● Active       ||
|  | 12/16 tasks completed                     Due: Oct 15    ||
|  | [████████████░░░░] 75%                                   ||
|  | [Av][Av][Av] +3                                          ||
|  +----------------------------------------------------------+|
|                                                               |
|  +----------------------------------------------------------+|
|  | Mobile App                                ● Active       ||
|  | 8/12 tasks completed                      Due: Nov 1     ||
|  | [████████░░░░░░░░] 67%                                   ||
|  | [Av][Av]                                                 ||
|  +----------------------------------------------------------+|
+--------------------------------------------------------------+
```

### Project Dashboard (Single Project View)

```
+--------------------------------------------------------------+
|  ← Projects  /  Website Redesign             [⚙] [+ Task]   |
+--------------------------------------------------------------+
|                                                               |
|  +----------+ +----------+ +----------+ +------------------+ |
|  | Total    | | Completed| | In Progr | | Overdue          | |
|  |   16     | |   12     | |    3     | |    1             | |
|  +----------+ +----------+ +----------+ +------------------+ |
|                                                               |
|  [Board]  [List]  [Members]    ← Tabs                        |
|  ──────────────────────────                                   |
|                                                               |
|  BOARD VIEW (Kanban):                                         |
|  +----------+ +----------+ +----------+ +----------+         |
|  | TODO     | | IN PROG  | | REVIEW   | | DONE     |         |
|  +----------+ +----------+ +----------+ +----------+         |
|  | Fix nav  | | Redesign | | Update   | | Setup    |         |
|  | ● High   | | homepage | | footer   | | CI/CD    |         |
|  | [Av]     | | ● Med    | | ○ Low    | | [Av]     |         |
|  +----------+ | [Av]     | | [Av]     | +----------+         |
|  | Write    | +----------+ +----------+ | Deploy   |         |
|  | tests    |                           | staging  |         |
|  | ○ Low    |                           | [Av]     |         |
|  +----------+                           +----------+         |
+--------------------------------------------------------------+
```

### Project Members (Tab Content)

```
+--------------------------------------------------------------+
|  Team (6)                                  [+ Add Member]     |
+--------------------------------------------------------------+
|  NAME              ROLE           TASKS ASSIGNED              |
|  ─────────────────────────────────────────────────────────    |
|  [Av] Anoir Baya   Project Lead   4 tasks                    |
|  [Av] Douaa E.     Developer      3 tasks                    |
|  [Av] Anas K.      Designer       2 tasks                    |
+--------------------------------------------------------------+
```

---

## 5. Tasks

### Task List View

```
+--------------------------------------------------------------+
|  Tasks                              [Filter ▾] [+ New Task]  |
+--------------------------------------------------------------+
|                                                               |
|  [All]  [My Tasks]  [Overdue]    ← Quick filters             |
|  ──────────────────────────────                               |
|                                                               |
|  STATUS    TASK               PRIORITY  PROJECT     DUE      |
|  ──────────────────────────────────────────────────────────   |
|  [○]  Fix navigation bug      ● High   Website     Sep 22   |
|  [○]  Redesign homepage       ● Med    Website     Sep 25   |
|  [✓]  Setup CI/CD pipeline    ○ Low    Mobile      Sep 20   |
|  [○]  Write API docs          ● Med    Mobile      Sep 28   |
|  [○]  Update footer           ○ Low    Website     Oct 1    |
+--------------------------------------------------------------+
```

- `[○]` = checkbox, toggles status to Done.
- Priority: `● High` = `#DC2626` badge, `● Med` = `#D97706` badge, `○ Low` = `#64748B` badge.
- Clicking a row opens the Task Detail panel.

### Task Details (Side Panel / Slide-over)

```
                    +---------------------------------------+
                    |  Fix navigation bug             [✕]   |
                    +---------------------------------------+
                    |                                       |
                    |  Status     [In Progress     ▾]       |
                    |  Priority   [● High          ▾]       |
                    |  Assignee   [Av] Anoir Baya  [Change] |
                    |  Deadline   Sep 22, 2025     [Edit]   |
                    |  Project    Website Redesign          |
                    |                                       |
                    |  ──────────────────────────────────   |
                    |                                       |
                    |  Description                          |
                    |  The main navigation breaks on        |
                    |  mobile viewport when the sidebar     |
                    |  is toggled open...                   |
                    |                                       |
                    |  ──────────────────────────────────   |
                    |                                       |
                    |  Activity                             |
                    |  Anoir changed status to              |
                    |  "In Progress" · 2h ago               |
                    |                                       |
                    |  Douaa commented:                     |
                    |  "Check the z-index" · 5h ago         |
                    |                                       |
                    |  ──────────────────────────────────   |
                    |  Add a comment...                     |
                    |  [________________________________]   |
                    |                          [Post]       |
                    +---------------------------------------+
```

### Create / Edit Task (Modal)

```
+----------------------------------------------+
|  Create New Task                      [✕]    |
+----------------------------------------------+
|                                              |
|  Task name                                   |
|  [________________________________]          |
|                                              |
|  Description                                 |
|  [________________________________]          |
|  [________________________________]          |
|                                              |
|  Project         [Website Redesign   ▾]      |
|  Status          [TODO               ▾]      |
|  Priority        [Medium             ▾]      |
|  Assignee        [Select member      ▾]      |
|  Deadline        [Pick a date        📅]      |
|                                              |
+----------------------------------------------+
|            [Cancel]  [■ Create Task ■]       |
+----------------------------------------------+
```

---

## 6. Communication (Chat)

### Chat Layout (Split Pane)

```
+--------+-------------------+----------------------------------+
| SIDEBAR| CONVERSATIONS     |  CHAT WINDOW                     |
|        +-------------------+----------------------------------+
|        | [Search...]       |  # general                       |
|        +-------------------+  5 members · ● 3 online          |
|        |                   |  ─────────────────────────────── |
|        | # general     (2) |                                  |
|        |   "Updated docs"  |  [Av] Douaa           10:30 AM   |
|        |                   |  Hey, I pushed the new API       |
|        | # design          |  endpoints. Can someone review?  |
|        |   "New mockups"   |                                  |
|        |                   |  [Av] Anas             10:32 AM  |
|        | 👤 Douaa E.    ●  |  Sure, I'll check it out now.    |
|        |   "Sounds good"   |                                  |
|        |                   |  [Av] Anoir            10:45 AM  |
|        | 👤 Anas K.     ●  |  Looks good! Merged to main. ✅  |
|        |   "On it"         |                                  |
|        |                   |  ─────────────────────────────── |
|        +-------------------+  Today                           |
|        |                   |                                  |
|        | [+ New Chat]      |  [Av] Douaa             2:15 PM  |
|        |                   |  Updated the footer design,      |
|        |                   |  check Figma link 🔗              |
|        |                   |                                  |
|        |                   +----------------------------------+
|        |                   |  [Type a message...]    [📎] [➤] |
+--------+-------------------+----------------------------------+
```

- **Conversation Rail** (`280px`): Search bar at top, list of channels (`#`) and DMs (`👤`). Unread count badges. Green `●` = online.
- **Chat Window**: Message stream with avatar, name, timestamp. Input bar at bottom with file attach `[📎]` and send `[➤]`.
- **Online/Offline**: Green dot `●` next to usernames in the conversation rail and member list.

---

## 7. Documents

### Document List

```
+--------------------------------------------------------------+
|  Documents                                   [+ Upload File]  |
+--------------------------------------------------------------+
|                                                               |
|  [All]  [PDF]  [Images]  [Other]    ← Filter tabs            |
|  ──────────────────────────────                               |
|                                                               |
|  NAME                TYPE     SIZE     UPLOADED     ACTIONS   |
|  ──────────────────────────────────────────────────────────   |
|  📄 API-spec.pdf      PDF     2.4 MB   Sep 18       [···]    |
|  📄 Wireframes.fig    FIG     8.1 MB   Sep 15       [···]    |
|  🖼 logo-final.png    PNG     340 KB   Sep 12       [···]    |
|  📄 Meeting-notes.md  MD      12 KB    Sep 10       [···]    |
+--------------------------------------------------------------+
```

- `[···]` dropdown: *Download*, *View Details*, *Delete*.

### Upload Interface (Modal or Drag Zone)

```
+----------------------------------------------+
|  Upload Document                      [✕]    |
+----------------------------------------------+
|                                              |
|  +----------------------------------------+ |
|  |                                        | |
|  |    📁 Drag & drop files here           | |
|  |       or click to browse               | |
|  |                                        | |
|  |    Supports: PDF, PNG, JPG, MD, TXT    | |
|  |    Max size: 10MB                      | |
|  +----------------------------------------+ |
|                                              |
|  Uploading:                                  |
|  📄 report.pdf   [████████░░] 80%    [✕]     |
|                                              |
+----------------------------------------------+
|                    [Cancel]  [■ Upload ■]     |
+----------------------------------------------+
```

### Document Details (Side Panel)

```
                    +---------------------------------------+
                    |  API-spec.pdf                   [✕]   |
                    +---------------------------------------+
                    |                                       |
                    |  Type        PDF                      |
                    |  Size        2.4 MB                   |
                    |  Uploaded    Sep 18, 2025             |
                    |  By          Douaa E.                 |
                    |  Project     Website Redesign         |
                    |                                       |
                    |  ──────────────────────────────────   |
                    |                                       |
                    |  [■ Download ■]  [Delete]             |
                    |                                       |
                    +---------------------------------------+
```

---

## 8. AI / RAG

### AI Assistant (Side Panel or Full Page)

```
+--------------------------------------------------------------+
|  AI Assistant                                    [Full Page]  |
+--------------------------------------------------------------+
|                                                               |
|  +----------------------------------------------------------+|
|  |                                                          ||
|  |  [🤖] Hi Anoir! I can help you search through your      ||
|  |  project documents and answer questions about your       ||
|  |  codebase. Ask me anything.                              ||
|  |                                                          ||
|  |  ────────────────────────────────────────────────────    ||
|  |                                                          ||
|  |  [Av] You                                     2:30 PM   ||
|  |  What does the API-spec say about authentication?        ||
|  |                                                          ||
|  |  [🤖] AI Assistant                            2:30 PM   ||
|  |  Based on API-spec.pdf, authentication uses JWT          ||
|  |  tokens with the following endpoints:                    ||
|  |                                                          ||
|  |  • POST /auth/register — Register a user                ||
|  |  • POST /auth/login — Login and receive token            ||
|  |  • POST /auth/logout — Invalidate token                  ||
|  |  • GET  /auth/me — Get current user                      ||
|  |                                                          ||
|  |  📄 Sources:                                             ||
|  |  [API-spec.pdf, page 3-4]                                ||
|  |                                                          ||
|  +----------------------------------------------------------+|
|                                                               |
|  +----------------------------------------------------------+|
|  | Ask a question about your documents...      [📎] [➤]     ||
|  +----------------------------------------------------------+|
+--------------------------------------------------------------+
```

- **Loading State**: Animated skeleton with 3 pulsing lines appearing in the AI response bubble while processing.
- **Error State**: Red-tinted message card: *"Sorry, I couldn't process your request. Please try again."* with a `[Retry]` ghost button.
- **Sources**: Each AI response can link back to source documents with page references.

---

## 9. Analytics

### Analytics Dashboard

```
+--------------------------------------------------------------+
|  Analytics                          [Date Range: Last 30d ▾]  |
+--------------------------------------------------------------+
|                                                               |
|  +----------+ +----------+ +----------+ +------------------+ |
|  | Tasks    | | Completed| | Overdue  | | Avg. Completion  | |
|  | Created  | | Tasks    | | Tasks    | | Time             | |
|  |   142    | |   118    | |    8     | |   3.2 days       | |
|  | ▲12%     | | ▲18%     | | ▼25%     | | ▼0.4 days       | |
|  +----------+ +----------+ +----------+ +------------------+ |
|                                                               |
|  +------------------------------+ +-------------------------+ |
|  | Task Completion Trend        | | Tasks by Status         | |
|  | (Line chart)                 | | (Donut chart)           | |
|  |                              | |                         | |
|  |     ╱‾‾‾╲    ╱‾‾‾           | |  ████ Done      72%     | |
|  |    ╱      ╲╱╱               | |  ████ In Prog   18%     | |
|  |  ╱                          | |  ████ Todo       7%     | |
|  | ╱                           | |  ████ Overdue    3%     | |
|  +------------------------------+ +-------------------------+ |
|                                                               |
|  +------------------------------+ +-------------------------+ |
|  | Project Progress             | | Activity Feed           | |
|  |                              | |                         | |
|  | Website    [████████░░] 75%  | | Anoir completed         | |
|  | Mobile     [██████░░░░] 67%  | |  "Fix nav" · 2h ago    | |
|  | Campaign   [████░░░░░░] 50%  | | Douaa created           | |
|  |                              | |  "New task" · 3h ago   | |
|  +------------------------------+ +-------------------------+ |
+--------------------------------------------------------------+
```

- **Metric Cards**: Top row, 4 cards with delta percentages (green ▲ positive, red ▼ negative).
- **Charts**: Line chart for trends, donut chart for distribution. Use the design system colors.
- **Project Progress**: Horizontal progress bars.
- **Activity Feed**: Scrollable timeline of recent user actions.

---

## Mobile Responsive Notes

All views above collapse to a single-column layout on screens `< 768px`:
- Chat split-pane becomes a navigable two-screen flow (conversation list → chat window).
- Task detail side-panel becomes a full-screen overlay.
- Dashboard metric cards stack vertically (2 per row on tablet, 1 per row on phone).
- Tables switch to card-based layouts on mobile.
- Bottom navigation bar replaces the sidebar.
