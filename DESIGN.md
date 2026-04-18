# The Reunion Projects — Design System

Light theme only. Adapted from the [Lovable design language](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/lovable/DESIGN.md) for a podcast scheduling and guest management platform.

---

## 1. Visual Theme & Atmosphere

The Reunion Projects sits on a warm cream canvas (`#f7f4ed`) that feels approachable and human — like a well-organized notebook rather than a clinical SaaS dashboard. The near-black charcoal (`#1c1c1c`) text has organic warmth; it is never pure black. Together, the cream and charcoal create a comfortable contrast that hosts will sit in for long sessions without fatigue.

The Outfit typeface carries the brand personality — geometric bones with humanist roundness. At display sizes (28px+), semibold weight with tight tracking creates confident, editorial headlines. At body sizes (14–16px), regular weight provides clean readability. Geist Mono handles data and metadata (timestamps, IDs, email addresses) where a monospace voice clarifies that something is a literal value.

Depth comes from borders, not shadows. Cards, inputs, and containers are defined by warm cream borders (`#eceae4`) against the page surface. The only shadow in the system is a multi-layer inset on dark buttons, giving them a tactile, pressed-into-surface quality. Everything else stays flat and grounded.

Color is intentionally restrained. The palette is warm neutrals — cream, charcoal, and a scale of opacities in between. Functional color (green for confirmed, amber for pending, red for cancelled) is reserved exclusively for episode status indicators and never used decoratively. This keeps the interface calm and lets status information pop when it matters.

**Key Characteristics:**
- Warm cream background (`#f7f4ed`) — never pure white
- Charcoal text and primary actions (`#1c1c1c`) — never pure black
- Outfit for all UI; Geist Mono for data/metadata
- Opacity-driven gray scale: all grays derived from `#1c1c1c` at varying transparency
- Border-forward depth: `1px solid #eceae4` defines structure, not shadows
- Inset shadow technique on dark buttons only
- Functional color reserved for status states — not decoration
- 6px button radius, 12px card radius, 9999px for badges/pills only
- Light theme only — no dark mode

---

## 2. Color Palette & Roles

### Foundation

| Name | Value | CSS Variable | Role |
|------|-------|-------------|------|
| Cream | `#f7f4ed` | `--background` | Page background, card surfaces, input backgrounds |
| Charcoal | `#1c1c1c` | `--foreground` | Primary text, headings, dark button backgrounds |
| Off-White | `#fcfbf8` | `--primary-foreground` | Text on dark buttons and charcoal surfaces |

### Neutral Scale (Opacity-Based)

All grays are `#1c1c1c` at varying opacities. This creates automatic tonal unity.

| Name | Value | CSS Variable | Role |
|------|-------|-------------|------|
| Charcoal 83% | `rgba(28,28,28,0.83)` | — | Strong secondary text |
| Muted Gray | `#5f5f5d` | `--muted-foreground` | Body descriptions, captions, timestamps |
| Charcoal 40% | `rgba(28,28,28,0.4)` | — | Interactive borders (hover, focus context) |
| Charcoal 4% | `rgba(28,28,28,0.04)` | `--muted`, `--accent` | Hover backgrounds, badge tints, subtle fills |
| Charcoal 3% | `rgba(28,28,28,0.03)` | — | Barely-visible overlays |

### Surface & Border

| Name | Value | CSS Variable | Role |
|------|-------|-------------|------|
| Light Cream | `#eceae4` | `--border`, `--input` | Card borders, dividers, input borders |
| Sidebar Cream | `#f3f0e8` | `--sidebar` | Sidebar background — slightly darker than page |

### Functional (Primary Action)

| Name | Value | CSS Variable | Role |
|------|-------|-------------|------|
| Charcoal | `#1c1c1c` | `--primary` | Primary CTA buttons, active nav indicators |
| Off-White | `#fcfbf8` | `--primary-foreground` | Text inside primary buttons |

### Functional (Destructive)

| Name | Value | Role |
|------|-------|------|
| Red 500 | `#ef4444` | `--destructive` — error ring, delete buttons, cancel actions |

### Episode Status Colors

These are the only saturated colors in the system. Used exclusively for status badges, pipeline column headers, and calendar block fills.

| Status | Background | Text | Border | Use |
|--------|-----------|------|--------|-----|
| Draft | `#f3f4f6` | `#374151` | `#d1d5db` | Gray — not yet sent |
| Pending Guest | `#fef3c7` | `#92400e` | `#fcd34d` | Amber — waiting for response |
| Confirmed | `#dcfce7` | `#166534` | `#86efac` | Green — locked in |
| Recorded | `#dbeafe` | `#1e40af` | `#93c5fd` | Blue — recording complete |
| Published | `#f3e8ff` | `#6b21a8` | `#c4b5fd` | Purple — episode is live |
| Cancelled | `#fee2e2` | `#991b1b` | `#fca5a5` | Red — cancelled |

### Focus & Interaction

| Name | Value | Role |
|------|-------|------|
| Ring Blue | `rgba(59,130,246,0.5)` | `--ring` — keyboard focus ring |
| Focus Shadow | `rgba(0,0,0,0.1) 0px 4px 12px` | Soft focus glow on active states |
| Inset Shadow | See Section 6 | Dark button tactile depth |

---

## 3. Typography Rules

### Font Families

- **Primary**: `Outfit` — geometric sans-serif with humanist warmth. Used for all headings, body text, buttons, labels.
- **Mono**: `Geist Mono` — used for email addresses, timestamps, IDs, code-like metadata.
- **Heading** (reserved): `Merriweather` — serif. Loaded but reserved for the public scheduling page hero and marketing moments only. Not used inside the host dashboard.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Tailwind Classes |
|------|------|------|--------|-------------|----------------|------------------|
| Page Title | Outfit | 36px | 600 | 1.10 | -0.9px | `text-4xl font-semibold tracking-tight` |
| Section Heading | Outfit | 24px | 600 | 1.20 | -0.5px | `text-2xl font-semibold tracking-tight` |
| Card Title | Outfit | 20px | 500 | 1.25 | normal | `text-xl font-medium` |
| Body Large | Outfit | 18px | 400 | 1.40 | normal | `text-lg` |
| Body | Outfit | 16px | 400 | 1.50 | normal | `text-base` |
| Body Small | Outfit | 14px | 400 | 1.50 | normal | `text-sm` |
| Button | Outfit | 14px | 500 | 1.00 | normal | `text-sm font-medium` |
| Section Label | Outfit | 12px | 500 | 1.00 | 0.5px | `text-xs font-medium uppercase tracking-wider` |
| Caption | Outfit | 12px | 400 | 1.30 | normal | `text-xs` |
| Mono Data | Geist Mono | 13px | 400 | 1.50 | normal | `font-mono text-[13px]` |
| Schedule Hero | Merriweather | 40px | 700 | 1.15 | -0.5px | `font-heading text-[40px] font-bold tracking-tight` |

### Principles

- **Two weights in the dashboard**: 400 (body/reading) and 500–600 (headings/emphasis). Never go above 600.
- **Compression at scale**: Headlines use negative letter-spacing (`tracking-tight` / `tracking-tighter`) for editorial impact. Body text stays at normal tracking.
- **Mono for data**: Email addresses, dates in tables, booking IDs, and Riverside URLs use `font-mono` to signal "this is a literal value."
- **Section labels are uppercase**: Small navigational labels like "UPCOMING EPISODES" or "PROFILE" use `text-xs font-medium uppercase tracking-wider text-muted-foreground`.

---

## 4. Component Stylings

### Buttons

**Primary Dark (Inset Shadow)**
- Background: `#1c1c1c` (charcoal)
- Text: `#fcfbf8` (off-white)
- Padding: 8px 12px (default), 10px 16px (lg)
- Radius: 6px
- Shadow: `rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px`
- Hover: opacity 0.85
- Use: Primary CTAs — "Create episode", "Save", "Confirm booking"

**Ghost / Outline**
- Background: transparent
- Text: `#1c1c1c`
- Padding: 8px 12px
- Radius: 6px
- Border: `1px solid rgba(28,28,28,0.4)`
- Hover: `background: rgba(28,28,28,0.04)`
- Use: Secondary actions — "Back", "Cancel", "Edit"

**Destructive**
- Background: `rgba(239,68,68,0.1)`
- Text: `#ef4444`
- Radius: 6px
- Hover: `background: rgba(239,68,68,0.2)`
- Use: "Delete", "Cancel episode", "Remove"

**Ghost (no border)**
- Background: transparent
- Text: `#1c1c1c`
- Radius: 6px
- Hover: `background: rgba(28,28,28,0.04)`
- Use: Sidebar nav links, icon buttons, subtle actions

### Status Badges

- Radius: `9999px` (full pill)
- Padding: 2px 10px
- Font: `text-xs font-medium`
- Colors: per episode status table (Section 2)
- Use: Episode status in lists, pipeline cards, calendar blocks

### Cards

- Background: `#f7f4ed` (same as page — seamless)
- Border: `1px solid #eceae4`
- Radius: 12px
- Padding: 20px–24px
- Hover: `border-color: rgba(28,28,28,0.4)` (border darkens)
- No box-shadow
- Use: Guest cards, episode cards in pipeline, template cards, dashboard stat cards

### Inputs & Forms

- Background: `#f7f4ed` (cream — matches page)
- Text: `#1c1c1c`
- Placeholder: `#5f5f5d`
- Border: `1px solid #eceae4`
- Radius: 6px
- Padding: 10px 12px
- Focus: `box-shadow: 0 0 0 2px rgba(59,130,246,0.5)` (blue ring), border becomes transparent
- Error: `box-shadow: 0 0 0 2px #ef4444` (red ring)
- Use: All form fields — booking forms, guest profiles, template editor, settings

### Sidebar Navigation

- Background: `#f3f0e8` (slightly darker cream)
- Width: `208px` (`md:w-52`)
- Nav links: `text-sm font-medium`, charcoal text
- Active link: `background: rgba(28,28,28,0.06)`, `border-left: 2px solid #1c1c1c`
- Hover: `background: rgba(28,28,28,0.04)`
- Section: host email in `font-mono text-xs text-muted-foreground`

### Tables / Lists

- Border: `1px solid #eceae4` outer, `divide-y` with `#eceae4` between rows
- Header: `text-xs font-medium uppercase tracking-wider text-muted-foreground`
- Row hover: `background: rgba(28,28,28,0.03)`
- Radius: 12px on outer container
- Use: Episode list, guest list, email history, availability windows

---

## 5. Layout Principles

### Spacing System

Base unit: 8px. Use Tailwind's scale which aligns (4=16px, 6=24px, 8=32px, etc.).

| Token | px | Tailwind | Use |
|-------|-----|---------|-----|
| xs | 4px | `1` | Inline icon gaps |
| sm | 8px | `2` | Tight internal spacing |
| md | 12px | `3` | Button/input padding, label gaps |
| base | 16px | `4` | Standard internal padding |
| lg | 24px | `6` | Card internal padding, form group gaps |
| xl | 32px | `8` | Section content padding |
| 2xl | 40px | `10` | Section gaps within a page |
| 3xl | 64px | `16` | Major section boundaries |

### Grid & Container

- **Max content width**: `max-w-6xl` (1152px) inside `<main>` — prevents content from stretching on ultrawide
- **Sidebar**: `md:w-52` (208px) — fixed on desktop, collapsible on mobile
- **Main padding**: `px-8 py-6` (32px horizontal, 24px vertical)
- **Form max-width**: `max-w-lg` (512px) for single-column forms
- **Card grids**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with `gap-5`
- **Pipeline columns**: horizontal scroll on mobile, `grid-cols-5` on desktop

### Whitespace Philosophy

- **Content-driven rhythm**: Tight spacing within cards (12–24px) contrasts with generous gaps between sections (40–64px). This creates a reading rhythm: dense information islands separated by visual rest.
- **Section pattern**: Each dashboard page follows: Page Title (36px) → description (muted, optional) → 40px gap → content sections separated by `<hr>` dividers or 40px spacing.
- **No background color changes for sections** — spacing and dividers (`1px solid #eceae4`) handle separation.

### Border Radius Scale

| Token | px | Tailwind | Use |
|-------|-----|---------|-----|
| Standard | 6px | `rounded-md` | Buttons, inputs, dropdowns |
| Card | 12px | `rounded-xl` | Cards, containers, table wrappers, dialogs |
| Large | 16px | `rounded-2xl` | Featured containers, the scheduling page card |
| Pill | 9999px | `rounded-full` | Status badges, avatar circles, icon buttons |

---

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, cream background | Page surface, most content areas |
| Bordered (Level 1) | `1px solid #eceae4` | Cards, inputs, table containers, dividers |
| Bordered Active (Level 1b) | `1px solid rgba(28,28,28,0.4)` | Card hover, active input context |
| Inset (Level 2) | `rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px` | Dark primary buttons only |
| Focus (Level 3) | `0 0 0 2px rgba(59,130,246,0.5)` | Keyboard focus ring on all interactive elements |

**Shadow Philosophy**: The Reunion Projects uses zero traditional box-shadows for elevation. Structure is defined entirely through warm borders (`#eceae4`). The only shadow is the inset technique on dark buttons — a subtle highlight line at the top and a dark ring at the bottom, creating a "pressed into the surface" feel. This keeps everything grounded and tangible.

### Hover & Active States

- **Cards**: border darkens from `#eceae4` to `rgba(28,28,28,0.4)` on hover
- **Buttons**: `opacity: 0.85` on hover (primary), `background: rgba(28,28,28,0.04)` on hover (ghost)
- **Table rows**: `background: rgba(28,28,28,0.03)` on hover
- **Nav links**: `background: rgba(28,28,28,0.04)` on hover
- **Active/pressed**: `translate-y-px` (1px downward nudge) for tactile click feedback

---

## 7. Do's and Don'ts

### Do

- Use cream (`#f7f4ed`) as the page background everywhere — it is the brand
- Use charcoal (`#1c1c1c`) for all primary text and dark buttons — never pure black
- Derive grays from `#1c1c1c` at opacity levels (0.03, 0.04, 0.4, 0.83) for tonal unity
- Use `#eceae4` borders as the primary structural element — not shadows
- Keep episode status colors as the only saturated colors in the interface
- Use the inset shadow on dark buttons — it is the signature tactile detail
- Use `text-xs font-medium uppercase tracking-wider` for section labels
- Use `font-mono` for email addresses, timestamps, IDs, and URLs
- Keep button radius at 6px (`rounded-md`) and card radius at 12px (`rounded-xl`)
- Use full pill radius (`rounded-full`) only for status badges, avatars, and icon buttons

### Don't

- Don't use pure white (`#ffffff`) as a background — the cream is intentional
- Don't use pure black (`#000000`) for text — charcoal has warmth
- Don't add box-shadows to cards — borders are the containment mechanism
- Don't use the episode status colors decoratively — they are functional signals only
- Don't use font weight above 600 — the system maxes at semibold
- Don't use pill radius (`rounded-full`) on rectangular action buttons — pills are for badges
- Don't mix border colors — `#eceae4` for passive structure, `rgba(28,28,28,0.4)` for interactive
- Don't apply positive letter-spacing to headings — headings run tight (`tracking-tight`)
- Don't create dark mode variants — the app is light-only
- Don't use Merriweather inside the dashboard — it is reserved for the public scheduling page

---

## 8. Responsive Behavior

### Breakpoints

| Name | Tailwind | Width | Key Changes |
|------|----------|-------|-------------|
| Mobile | default | <640px | Single column, sidebar collapses to bottom sheet or hamburger |
| Tablet | `sm:` | 640px+ | 2-column card grids, wider content padding |
| Desktop Small | `md:` | 768px+ | Sidebar visible, 2-column grids expand |
| Desktop | `lg:` | 1024px+ | 3-column card grids, pipeline columns all visible |
| Large Desktop | `xl:` | 1280px+ | Max content width reached, generous margins |

### Sidebar Behavior

- **Desktop (md+)**: Fixed left sidebar, 208px wide, always visible
- **Mobile (<md)**: Sidebar collapses. Replace with a horizontal bottom tab bar (Dashboard, Guests, Episodes, Calendar, Templates) with Settings accessible via avatar menu. Or use a hamburger menu in a top bar.

### Touch Targets

- Buttons: minimum 36px height (`h-9`), preferably 40px (`h-10`) on mobile
- Nav links: `py-2 px-3` minimum (40px+ tap target)
- Table rows: `py-3` minimum for comfortable row taps
- Sidebar links: full-width tap target, `py-2.5`

### Collapsing Strategy

- **Pipeline Kanban**: 5 columns on `lg:`, horizontal scroll on smaller screens. Each column min-width 280px.
- **Card grids** (Guests, Templates): `grid-cols-1` default, `sm:grid-cols-2`, `lg:grid-cols-3`
- **Calendar view**: Full month grid on `md:+`, week view on mobile with horizontal day scroll
- **Episode detail**: Single column on mobile, two-column (details + actions sidebar) on `lg:`
- **Public scheduling page**: Always single-column centered, works perfectly on mobile (guests open this from email on phone)
- **Section spacing**: 64px (`space-y-16`) on desktop reduces to 40px (`space-y-10`) on mobile via responsive classes

---

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:        #f7f4ed  (cream)
Text:              #1c1c1c  (charcoal)
Muted text:        #5f5f5d
Border:            #eceae4  (passive)
Border active:     rgba(28,28,28,0.4)  (interactive)
Hover tint:        rgba(28,28,28,0.04)
Row hover:         rgba(28,28,28,0.03)
Button text:       #fcfbf8  (off-white on dark)
Focus ring:        rgba(59,130,246,0.5)
Error ring:        #ef4444
Sidebar bg:        #f3f0e8
```

### Status Badge Colors

```
Draft:        bg-[#f3f4f6]  text-[#374151]  border-[#d1d5db]
Pending:      bg-[#fef3c7]  text-[#92400e]  border-[#fcd34d]
Confirmed:    bg-[#dcfce7]  text-[#166534]  border-[#86efac]
Recorded:     bg-[#dbeafe]  text-[#1e40af]  border-[#93c5fd]
Published:    bg-[#f3e8ff]  text-[#6b21a8]  border-[#c4b5fd]
Cancelled:    bg-[#fee2e2]  text-[#991b1b]  border-[#fca5a5]
```

### Typography Quick Reference

```
Page title:        text-4xl font-semibold tracking-tight
Section heading:   text-2xl font-semibold tracking-tight
Card title:        text-xl font-medium
Body:              text-base  (16px)
Body small:        text-sm    (14px)
Section label:     text-xs font-medium uppercase tracking-wider text-muted-foreground
Caption:           text-xs text-muted-foreground
Mono data:         font-mono text-[13px]
```

### Example Component Prompts

- "Create a page with title 'Episodes' at `text-4xl font-semibold tracking-tight`. Below it, a muted description at `text-sm text-muted-foreground`. Then a 40px gap (`mt-10`) before the content grid."

- "Build an episode card: cream background (`bg-background`), `border border-border rounded-xl p-6`. Status badge as `rounded-full px-2.5 py-0.5 text-xs font-medium` with colors from the status table. Guest name at `text-xl font-medium`. Date in `font-mono text-[13px] text-muted-foreground`. Hover: `hover:border-[rgba(28,28,28,0.4)]` transition."

- "Build the sidebar: `w-52 bg-[#f3f0e8] border-r border-border`. Nav links as `text-sm font-medium py-2.5 px-3 rounded-md`. Active: `bg-[rgba(28,28,28,0.06)] border-l-2 border-[#1c1c1c]`. Hover: `bg-[rgba(28,28,28,0.04)]`."

- "Create a form input: `bg-background border border-border rounded-md px-3 py-2.5 text-sm`. Focus: `focus:border-transparent focus:ring-2 focus:ring-[rgba(59,130,246,0.5)]`. Placeholder: `placeholder:text-muted-foreground`."

- "Build the primary button: `bg-[#1c1c1c] text-[#fcfbf8] rounded-md px-3 py-2 text-sm font-medium`. Inset shadow: `shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px]`. Hover: `hover:opacity-85`. Active: `active:translate-y-px`."

### Iteration Checklist

1. Background is always `#f7f4ed` — check that no component uses `bg-white`
2. Text is always `#1c1c1c` — never `text-black`
3. Borders are `#eceae4` — never `border-gray-200` or `border-gray-300`
4. Status colors come only from the badge table — never reuse them for buttons or backgrounds
5. Dark buttons always have the inset shadow — it is the visual signature
6. Cards use `rounded-xl` (12px), buttons use `rounded-md` (6px) — never mix
7. Section labels are uppercase with `tracking-wider` — not just bold text
8. `font-mono` on emails, dates in tables, IDs, Riverside URLs
9. All forms use the same input pattern: cream bg, cream border, blue focus ring
10. Max content width is `max-w-6xl` inside main — content never stretches to viewport edge
