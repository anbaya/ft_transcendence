# Reusable Components Specifications

Based on the premium, minimalist SaaS design system, here are the architectural and visual specifications for the core UI components. The goal is to maintain the 80% white / 15% dark text / 5% accent visual formula.

## General Visual Rules
- **Borders**: `1px solid #E2E8F0` (Border color). Never use heavy or dark borders for layout elements.
- **Radii**: `6px` or `8px` (Medium rounded) for most components to feel modern but highly structured.
- **Shadows**: Extremely subtle. Keep cards flat when possible. Use diffuse shadows (`box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05)`) exclusively for floating elements like Modals, Dropdowns, or Toasts.
- **Transitions**: Fast and smooth (`150ms ease-in-out`) on hover states.

---

## 1. Buttons
- **Primary (Default)**: Background `#111827` (Deep Ink), Text `#FFFFFF`. Hover: `#0F172A`. Weight: 500.
- **Accent (Highlight)**: Background `#4F6EF7` (Indigo), Text `#FFFFFF`. Hover: `#4059D6`. (Use sparingly, e.g., for the main "Create Project" action).
- **Secondary / Outline**: Background `transparent`, Border `1px solid #E2E8F0`, Text `#0F172A`. Hover background: `#F1F5F9`.
- **Ghost / Text**: No background, no border. Text `#64748B`. Hover text: `#0F172A`, Hover background: `#F1F5F9`.
- **Destructive**: Background `#DC2626` (Error), Text `#FFFFFF`.

## 2. Forms & Inputs
*(Applies to Input, Select, Textarea)*
- **Surface**: Background `#FFFFFF`, Border `1px solid #E2E8F0`, Radius `6px`.
- **Typography**: Text `14px` (`#0F172A`), Placeholder `#64748B`. Label `13px` (`#0F172A`, Weight 500) placed above the input.
- **Focus State**: Border becomes `1px solid #4F6EF7` (Indigo) with a subtle `#EEF2FF` ring. No default browser outline.
- **Checkbox & Radio**: 
  - Size: `16px x 16px`.
  - Unchecked: White background, `#E2E8F0` border.
  - Checked: `#111827` (Deep Ink) background with a white checkmark or dot.

## 3. Overlays & Floating
- **Modal & Confirmation Dialog**: 
  - **Backdrop**: `rgba(15, 23, 42, 0.4)` with a subtle `backdrop-blur(4px)`.
  - **Surface**: `#FFFFFF`, `8px` radius, elevated shadow.
  - **Header**: Weight 600, 18px text. Muted text description directly underneath.
  - **Footer**: Right-aligned actions (e.g., Cancel [Outline], Confirm [Primary]).
- **Dropdown Menu**:
  - Surface: `#FFFFFF`, `1px solid #E2E8F0`, `6px` radius, sharp drop shadow.
  - Items: `14px` text, `#0F172A`. Hover state: `#F1F5F9` background, `4px` internal radius.
- **Tooltip**:
  - Surface: `#111827` background, `12px` white text, `4px` radius. Arrow pointing to trigger.
- **Toast**: 
  - Placement: Bottom-right.
  - Surface: `#FFFFFF` background, `1px solid #E2E8F0`. Add a `3px` left-border colored based on status (Success `#16A34A` / Error `#DC2626`).

## 4. Data Display
- **Card**: `#FFFFFF` background, `1px solid #E2E8F0`, `8px` radius. Flat (no shadow).
- **Table**: 
  - Headers: `13px`, Weight 500, `#64748B` (Muted text), slight uppercase tracking.
  - Rows: `14px` text. `1px` bottom border `#E2E8F0`. Hover row background: `#F8FAFC`.
- **Badge**: 
  - Size: Small (`12px` text, `20px` height), `99px` (pill) radius.
  - Colors: Always use the "Light" semantic backgrounds. (e.g., `#EEF2FF` bg with `#2563EB` text for Info; `#F0FDF4` bg with `#16A34A` text for Success).
- **Avatar**: 
  - Shape: Circle. Sizes: `32px` (navbar), `40px` (profile), `24px` (table rows).
  - Fallback: `#F1F5F9` background with `#0F172A` initials (Weight 500).

## 5. Navigation
- **Tabs**: 
  - Style: Clean underline. No boxes.
  - Inactive: Text `#64748B`, Weight 500, transparent bottom border.
  - Active: Text `#0F172A`, `2px solid #111827` bottom border.
- **Pagination**: 
  - Minimal list. Previous/Next buttons use the Outline style. Active page number has `#F1F5F9` background and `#0F172A` text.

## 6. Feedback States
- **Loading Spinner**: Simple `2px` stroke SVG ring spinning. Color: `#64748B` or `#4F6EF7`.
- **Skeleton Loader**: Background `#F1F5F9`, subtle pulse animation. Used in place of spinners for initial page/dashboard loads to prevent layout shift.
- **Empty State**: 
  - Centered inside a Card or Table body.
  - Monochromatic/subtle icon.
  - Title: `#0F172A` (16px, Weight 500).
  - Subtext: `#64748B` (14px).
  - Action: Outline button to create the first item.
- **Error State**: Similar to empty state, but utilizing a soft red `#FEF2F2` background block and `#DC2626` text/icon for high visibility.
