# 🏥 MediLocker — Complete Design System & Theme Guide

> **Version:** 2.0 | **Based on:** MediLocker_System_Design.docx  
> **Stack:** React + Vite + TailwindCSS v4 + GSAP + Three.js + Lenis  
> **Roles:** Patient · Doctor · Hospital

---

## 1. Brand Identity

**MEDI LOCKER** — A secure, role-based digital healthcare platform.

- **Wordmark:** `MEDI LOCKER` — Space Grotesk, Bold, tracked wide
- **Favicon/Short:** `ML` monogram with gradient fill
- **Tagline:** "Your Health. Your Vault. Your Control."
- **Voice:** Trustworthy, modern, premium, secure

---

## 2. Color System

### 2.1 Core Palette (Light-Mode "Liquid Sky")

```css
:root {
  /* ── Backgrounds ── */
  --bg-base:       #EFFAFD;    /* Pale Blue Baseline */
  --bg-surface:    rgba(255, 255, 255, 0.45);
  --bg-elevated:   rgba(255, 255, 255, 0.65);

  /* ── Glass ── */
  --glass-light:   rgba(255, 255, 255, 0.50);
  --glass-medium:  rgba(255, 255, 255, 0.70);
  --glass-heavy:   rgba(255, 255, 255, 0.85);
  --glass-border:  rgba(255, 255, 255, 0.60);

  /* ── Primary — Royal Blue ── */
  --accent:        #4A8BDF;
  --accent-dim:    #3574C5;
  --accent-glow:   rgba(74, 139, 223, 0.20);
  --accent-soft:   rgba(74, 139, 223, 0.08);

  /* ── Secondary — Eggplant ── */
  --eggplant:      #A0006D;
  --eggplant-dim:  #800057;
  --eggplant-glow: rgba(160, 0, 109, 0.20);

  /* ── Semantic ── */
  --success:       #00A86B;    /* Deeper green for light mode */
  --warning:       #D97706;    /* Deeper amber */
  --error:         #DC2626;    /* Snappy red */
  --info:          #4A8BDF;

  /* ── Text ── */
  --text-primary:   #0A1128;   /* Deep Navy for readability */
  --text-secondary: #4A5568;   /* Cool Gray */
  --text-muted:     #718096;

  /* ── Borders ── */
  --border-subtle:  rgba(74, 139, 223, 0.10);
  --border-default: rgba(74, 139, 223, 0.20);
  --border-accent:  rgba(74, 139, 223, 0.35);

  /* ── Gradients ── */
  --gradient-sky:    linear-gradient(135deg, #EFFAFD, #E0F2F7);
  --gradient-accent: linear-gradient(135deg, #4A8BDF, #A0006D);
  --gradient-card:   linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4));

  /* ── Shadows ── */
  --shadow-card:   0 10px 30px rgba(74, 139, 223, 0.08);
  --shadow-glow:   0 0 20px rgba(74, 139, 223, 0.15);
  --shadow-modal:  0 30px 60px rgba(10, 17, 40, 0.12);
}
```

### 2.2 Role Accent Colors

Each dashboard uses a subtle accent tint to differentiate roles:

| Role     | Accent Tint              | Sidebar Active BG                |
|----------|--------------------------|----------------------------------|
| Patient  | Royal Blue `#4A8BDF`     | `rgba(74, 139, 223, 0.08)`      |
| Doctor   | Eggplant `#A0006D`       | `rgba(160, 0, 109, 0.08)`        |
| Hospital | Navy `#0A1128`           | `rgba(10, 17, 40, 0.08)`         |

### 2.3 Record Type Colors (left-edge stripe on cards)

| Record Type    | Color     | CSS                  |
|----------------|-----------|----------------------|
| lab_report     | Eggplant  | `#A0006D`            |
| prescription   | Warning   | `#D97706`            |
| scan / imaging | Success   | `#00A86B`            |
| discharge      | Royal     | `#4A8BDF`            |
| other          | Navy      | `#0A1128`            |

### 2.4 Status Badge Colors

| Status      | BG                          | Text      | Border                     |
|-------------|-----------------------------|-----------|-----------------------------|
| pending     | `rgba(245,158,11,0.12)`     | `#F59E0B` | `rgba(245,158,11,0.25)`    |
| confirmed   | `rgba(16,232,126,0.12)`     | `#10E87E` | `rgba(16,232,126,0.25)`    |
| rejected    | `rgba(239,68,68,0.12)`      | `#EF4444` | `rgba(239,68,68,0.25)`     |
| cancelled   | `rgba(75,85,99,0.12)`       | `#8B9BB8` | `rgba(75,85,99,0.25)`      |
| completed   | `rgba(0,229,200,0.12)`      | `#00E5C8` | `rgba(0,229,200,0.25)`     |
| active      | `rgba(16,232,126,0.12)`     | `#10E87E` | `rgba(16,232,126,0.25)`    |
| revoked     | `rgba(239,68,68,0.12)`      | `#EF4444` | `rgba(239,68,68,0.25)`     |
| expired     | `rgba(75,85,99,0.12)`       | `#8B9BB8` | `rgba(75,85,99,0.25)`      |
| unpaid      | `rgba(239,68,68,0.12)`      | `#EF4444` | `rgba(239,68,68,0.25)`     |
| paid        | `rgba(16,232,126,0.12)`     | `#10E87E` | `rgba(16,232,126,0.25)`    |
| partial     | `rgba(245,158,11,0.12)`     | `#F59E0B` | `rgba(245,158,11,0.25)`    |

---

## 3. Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}
```

| Token     | Size | Weight | Font          | Use                           |
|-----------|------|--------|---------------|-------------------------------|
| text-xs   | 11px | 600    | Inter         | Badges, status tags           |
| text-sm   | 13px | 400    | Inter         | Captions, helper text         |
| text-base | 15px | 400    | Inter         | Body text                     |
| text-lg   | 20px | 600    | Space Grotesk | Card titles                   |
| text-xl   | 24px | 700    | Space Grotesk | Page headings (h2)            |
| text-2xl  | 32px | 700    | Space Grotesk | Section headings (h1)         |
| text-3xl  | 48px | 800    | Space Grotesk | Hero titles                   |
| text-4xl  | 64px | 800    | Space Grotesk | Landing hero                  |
| mono      | 13px | 400    | JetBrains     | IDs, invoice numbers, dates   |

### Gradient text for hero headings:
```css
.gradient-text {
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 4. Glassmorphism Design Language

### 4.1 Glass Hierarchy

```
Level 0: --bg-base (#020811)                  → Page background
Level 1: --glass-light (5% white, blur 16px)  → Cards, list items
Level 2: --glass-medium (8% white, blur 16px) → Sidebar, hover states
Level 3: --glass-heavy (12% white, blur 24px) → Focused inputs, selected
Level 4: 80% bg-surface, blur 40px            → Modals, command palette
```

### 4.2 Glass Recipes

```css
.glass-card {
  background: var(--glass-light);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
}

.glass-elevated {
  background: rgba(13,22,40,0.80);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255,255,255,0.20);
  border-radius: 20px;
  box-shadow: var(--shadow-modal);
}

/* Top-edge light reflection for premium feel */
.glass-highlight::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%);
  pointer-events: none;
}
```

---

## 5. Layout System

### 5.1 Spacing (4px base)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64 · 96`

### 5.2 Structure

```
┌──────────────────────────────────────────────┐
│  NAVBAR (64px, fixed, glass backdrop-blur)    │
├────────────┬─────────────────────────────────┤
│  SIDEBAR   │  MAIN CONTENT (animate-page)    │
│  260px     │  padding: 32px                  │
│  glass bg  │  max-width: 1280px              │
│  role nav  │  flex-1, scrollable             │
└────────────┴─────────────────────────────────┘
```

- Sidebar collapses to 72px (icon-only) on ≤1024px
- Card grids: `repeat(auto-fill, minmax(280px, 1fr))` gap 20px
- Responsive breakpoints: sm:640 · md:768 · lg:1024 · xl:1280 · 2xl:1536

---

## 6. Sidebar Navigation (All Roles)

### 6.1 Menu Items Per Role

**Patient** (`/patient/*`)
| Icon             | Label          | Path                      |
|------------------|----------------|---------------------------|
| LayoutDashboard  | Dashboard      | /patient                  |
| FileText         | Records        | /patient/records          |
| Calendar         | Appointments   | /patient/appointments     |
| Pill             | Prescriptions  | /patient/prescriptions    |
| Users            | Family         | /patient/family           |
| Shield           | Consents       | /patient/consents         |
| ShieldCheck      | Insurance      | /patient/insurance        |
| QrCode           | Emergency QR   | /patient/emergency-qr    |
| User             | Profile        | /patient/profile          |

**Doctor** (`/doctor/*`)
| Icon             | Label          | Path                      |
|------------------|----------------|---------------------------|
| LayoutDashboard  | Dashboard      | /doctor                   |
| Calendar         | Appointments   | /doctor/appointments      |
| Users            | Patients       | /doctor/patients          |
| ClipboardPlus    | Prescriptions  | /doctor/prescriptions     |
| Clock            | Schedule       | /doctor/schedule          |
| User             | Profile        | /doctor/profile           |

**Hospital** (`/hospital/*`)
| Icon             | Label          | Path                      |
|------------------|----------------|---------------------------|
| LayoutDashboard  | Dashboard      | /hospital                 |
| Stethoscope      | Doctors        | /hospital/doctors         |
| Users            | Patients       | /hospital/patients        |
| TestTube         | Lab Reports    | /hospital/lab-reports     |
| CreditCard       | Billing        | /hospital/billing         |
| Building2        | Profile        | /hospital/profile         |

### 6.2 Sidebar Item States

```css
/* Default */  text-secondary, no bg
/* Hover */    glass-light bg, text-primary, translateX(4px) via GSAP
/* Active */   accent-soft bg, accent text, 3px left border in role accent color
```

Icon size: 18px (Lucide React). Gap icon→label: 10px. Item padding: 10px 12px. Border-radius: 10px.

---

## 7. Component Specs

### 7.1 Buttons

```css
/* Primary CTA — dark text on teal gradient */
.btn-primary {
  background: linear-gradient(135deg, #00E5C8, #00B8A0);
  color: #020811; font-weight: 600;
  padding: 10px 24px; border-radius: 10px;
  box-shadow: var(--shadow-button);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,229,200,0.45); }

/* Secondary — glass outline */
.btn-secondary {
  background: transparent; color: var(--accent);
  border: 1px solid var(--border-accent);
  padding: 10px 24px; border-radius: 10px;
}
.btn-secondary:hover { background: var(--accent-soft); }

/* Danger */
.btn-danger {
  background: rgba(239,68,68,0.12); color: #EF4444;
  border: 1px solid rgba(239,68,68,0.30);
  padding: 10px 24px; border-radius: 10px;
}
```

### 7.2 Cards (Record, Appointment, Prescription, Consent, Insurance, Billing)

All cards use `.glass-card` base + hover lift:

```css
.card {
  /* glass-card base */
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.card:hover {
  transform: translateY(-4px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-card), var(--shadow-glow);
}
/* Left colored stripe by type/status */
.card::before {
  content: ''; position: absolute;
  left: 0; top: 10%; bottom: 10%; width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--accent); /* overridden per type */
}
```

### 7.3 Inputs & Forms

```css
.input {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border-default);
  border-radius: 10px; color: var(--text-primary);
  padding: 10px 14px; font-size: 14px;
}
.input:focus {
  border-color: var(--accent);
  background: rgba(0,229,200,0.04);
  box-shadow: 0 0 0 3px rgba(0,229,200,0.10);
  outline: none;
}
.input-label {
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--text-secondary); margin-bottom: 6px;
}
```

### 7.4 Modals (Upload, Preview, Appointment, Consent, Billing)

```css
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(2,8,17,0.75);
  backdrop-filter: blur(8px); z-index: 100;
  display: flex; align-items: center; justify-content: center;
}
.modal-panel {
  background: rgba(8,15,30,0.92);
  border: 1px solid rgba(255,255,255,0.20);
  border-radius: 20px; box-shadow: var(--shadow-modal);
  width: min(560px, 95vw); max-height: 90vh;
  overflow-y: auto; padding: 32px;
}
```

### 7.5 Multi-Step Modal (Appointment Booking)

Steps: Search Doctor → Select Slot → Fill Details → Confirm  
Progress indicator: 4 circles connected by line, active circle uses `--accent`, completed uses `--success`.

### 7.6 Tag Input (Allergies, Chronic Conditions)

Glass-bordered chips with × remove button. Add via Enter key. Chips use `badge-info` styling.

### 7.7 QR Code Display

QR rendered inside a glass-card with glow border. Below: Download PNG button + Regenerate button. "Scan Preview" button shows what first responders see.

---

## 8. Animation System (GSAP)

All animations centralized in `src/utils/animations.js`. Never use CSS `@keyframes` for entrances.

### 8.1 Easing Reference

| Name              | GSAP String       | Use Case                      |
|-------------------|--------------------|-------------------------------|
| Smooth entrance   | `power3.out`       | Page loads, card reveals      |
| Elastic pop       | `back.out(1.7)`    | Modal open, button press      |
| Snappy slide      | `expo.out`         | Sidebar toggle, drawer        |
| Linear            | `linear`           | Background parallax           |
| Dramatic          | `power4.inOut`     | Hero reveal, large text       |

### 8.2 Core Presets

```js
// PAGE ENTER — call on every route mount
export const pageEnter = (sel = '.animate-page') => {
  gsap.from(sel, { opacity:0, y:48, duration:0.85, ease:'power3.out', clearProps:'all' })
}

// STAGGER CARDS — records, appointments, prescriptions, family, billing
export const cardStagger = (sel = '.card') => {
  gsap.from(sel, { opacity:0, y:32, scale:0.97, duration:0.6, stagger:0.1, ease:'power3.out', clearProps:'all' })
}

// HERO REVEAL — landing page
export const heroReveal = () => {
  const tl = gsap.timeline()
  tl.from('.hero-title', { y:80, opacity:0, duration:1.1, ease:'power4.out' })
    .from('.hero-para',  { y:40, opacity:0, duration:0.9 }, '-=0.6')
    .from('.hero-cta',   { y:20, opacity:0, ease:'back.out(1.5)' }, '-=0.5')
    .from('.hero-img',   { scale:0.88, opacity:0, duration:1.0 }, '-=0.8')
}

// SCROLL REVEAL — about/services sections
export const scrollReveal = (el, opts = {}) => {
  gsap.fromTo(el, { opacity:0, y:50 }, {
    opacity:1, y:0, duration:0.8, ease:'power3.out',
    scrollTrigger: { trigger:el, start:'top 82%', toggleActions:'play none none reverse', ...opts }
  })
}

// MODAL OPEN
export const modalOpen = (panel, backdrop) => {
  gsap.from(backdrop, { opacity:0, duration:0.3 })
  gsap.from(panel, { opacity:0, scale:0.94, y:20, duration:0.4, ease:'back.out(1.4)' })
}

// FLOAT — idle animation for 3D/hero elements
export const float = (el) => {
  gsap.to(el, { y:-12, duration:2.8, ease:'power1.inOut', yoyo:true, repeat:-1 })
}

// GLOW PULSE — accent elements, QR card
export const glowPulse = (el) => {
  gsap.to(el, { boxShadow:'0 0 40px rgba(0,229,200,0.45)', duration:1.8, ease:'power1.inOut', yoyo:true, repeat:-1 })
}

// SIDEBAR HOVER micro-interaction
export const sidebarHover    = (el) => gsap.to(el, { x:4, duration:0.2, ease:'power2.out' })
export const sidebarHoverOut = (el) => gsap.to(el, { x:0, duration:0.2, ease:'power2.in' })
```

### 8.3 CSS-Based Infinite Scrolling Text

For ambient elements or news tickers, we use an infinite linear CSS integration:

```css
@keyframes scroll-text-anim {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.scrolling-container {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  display: flex;
  align-items: center;
}

.scrolling-text {
  display: inline-block;
  animation: scroll-text-anim 15s linear infinite;
  font-family: var(--font-display);
  font-weight: 700;
}
```

### 8.3 Reduced Motion

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!prefersReducedMotion) { pageEnter(); cardStagger(); }
```

### 8.4 CSS Class → Animation Mapping

| Class           | Animation      | Used On                              |
|-----------------|----------------|--------------------------------------|
| `.animate-page` | pageEnter      | Every page wrapper                   |
| `.card`         | cardStagger    | All list cards (records, appts, etc) |
| `.record-card`  | cardStagger    | Medical record cards specifically    |
| `.hero-title`   | heroReveal     | Landing hero heading                 |
| `.hero-para`    | heroReveal     | Landing hero paragraph               |
| `.hero-cta`     | heroReveal     | Landing CTA buttons                  |
| `.hero-img`     | heroReveal     | Landing hero visual/3D element       |

---

## 9. Three.js & WebGL

Fixed full-screen background canvas, `opacity: 0.25–0.35`, `pointer-events: none`.

```js
// Scene setup
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2

// Materials
Hero sphere:  MeshStandardMaterial, color #00E5C8, roughness 0.2, metalness 0.9
Bg torus:     MeshStandardMaterial, color #7B6FF0, roughness 0.1, metalness 1.0
Particles:    PointsMaterial, color #FFFFFF, size 0.015, opacity 0.6

// Lighting
PointLight('#00E5C8', 2, 30) at (5,8,5)   // teal fill
PointLight('#7B6FF0', 1.5, 25) at (-8,-5,-5) // violet rim
AmbientLight('#ffffff', 0.15)               // soft fill

// Rotation: sphere Y 0.007, X 0.003
```

---

## 10. Smooth Scroll (Lenis)

```js
const lenis = new Lenis({ duration:1.2, smooth:true, mouseMultiplier:1.0, smoothTouch:false })
// Sync with GSAP ScrollTrigger on every frame
// Always destroy on unmount
// Use lenis.scrollTo('#section') for anchor nav
```

---

## 11. Page-by-Page Design Map

### Landing Page (`/`)
Sections: Navbar (glass) → Hero (full-height + 3D sphere) → Scroll Line → About (slide-in left) → Services (slide-in right) → Footer

### Auth Pages (`/register`, `/login`)
Centered glass-elevated card, 420px wide. Role selector tabs (Patient / Doctor / Hospital). Gradient accent on active tab. Password strength meter.

### Patient Dashboard (`/patient`)
Stats row (4 cards): Total Records, Upcoming Appointments, Active Prescriptions, Active Consents. Recent records grid below. Quick actions: Upload Record, Book Appointment.

### Records (`/patient/records`)
Filter bar: type dropdown + date range + search. Grid of record-cards with type badge, date, title, preview/download/delete actions. Upload modal: file picker + metadata form.

### Appointments (`/patient/appointments`)
Tabs: Upcoming | Past | All. Cards show doctor name, date/time, type badge (in_person/video/phone), status badge. Book button opens multi-step modal.

### Prescriptions (`/patient/prescriptions`)
Cards: doctor name, diagnosis, date, active/inactive badge. Detail view: medication cards with dosage/frequency/duration. Download PDF button.

### Consents (`/patient/consents`)
Two sections: Active Consents | Revoked/Expired. Grant button → search doctor/hospital modal. Cards: grantee info, access level, record types, expiry, revoke button.

### Emergency QR (`/patient/emergency-qr`)
QR image in glowing glass card. Config checkboxes: blood group, allergies, contacts, specific records. Regenerate + Download buttons. Scan Preview button.

### Doctor Appointments (`/doctor/appointments`)
Tabs with badge counts: Pending | Confirmed | Completed. Approve (green) / Reject (red with reason modal) / Complete (with notes) actions.

### Doctor Patients (`/doctor/patients`)
Consented patients list. Click → patient detail with profile summary + filtered records. Access expiry indicator.

### Hospital Doctors (`/hospital/doctors`)
Doctor cards: name, specialization, department, availability. Add Doctor button → search by license/email. Remove with confirmation.

### Hospital Billing (`/hospital/billing`)
Create Invoice form: patient search, services table (add rows), tax/discount, totals. Invoice list with status badges. Print/Download PDF.

---

## 12. Icon Usage (Lucide React)

```bash
npm install lucide-react
```

| Context          | Icon             | Size |
|------------------|------------------|------|
| Records          | FileText         | 18px |
| Appointments     | Calendar         | 18px |
| Prescriptions    | Pill / Clipboard | 18px |
| Patient          | User             | 18px |
| Doctor           | Stethoscope      | 18px |
| Hospital         | Building2        | 18px |
| Consent/Security | Shield           | 18px |
| Insurance        | ShieldCheck      | 18px |
| QR Code          | QrCode           | 18px |
| Upload           | Upload           | 16px |
| Preview          | Eye              | 16px |
| Download         | Download         | 16px |
| Delete           | Trash2           | 16px |
| Settings         | Settings         | 18px |
| Billing          | CreditCard       | 18px |
| Lab Reports      | TestTube         | 18px |
| Schedule         | Clock            | 18px |
| Family           | Users            | 18px |
| Logout           | LogOut           | 18px |
| Empty state      | (contextual)     | 48px |

---

## 13. Accessibility

- Focus: `outline: 2px solid var(--accent); outline-offset: 2px` on `:focus-visible`
- Contrast: WCAG AA (4.5:1 body, 3:1 large text) — all token pairs verified
- Motion: gate GSAP behind `prefers-reduced-motion` check
- Semantic HTML: `<nav>`, `<main>`, `<aside>`, `<section>`, `<article>`
- ARIA: icon-only buttons get `aria-label`. Modals: `role="dialog"`, `aria-modal="true"`

---

## 14. File & Folder Conventions

```
src/
├── Layouts/
│   ├── MainLayout.jsx          GSAP page animation wrapper
│   └── DashboardLayout.jsx     Sidebar + MainLayout
├── components/
│   ├── Layout/Sidebar.jsx      Role-based nav
│   ├── Patient/                RecordCard, UploadModal, PreviewModal, ConsentCard, QRDisplay...
│   ├── Doctor/                 AppointmentCard, PatientDetail, PrescriptionForm...
│   └── Hospital/               DoctorCard, InvoiceForm, LabUploadModal...
├── pages/
│   ├── auth/                   Login, Register (role tabs)
│   ├── patient/                Dashboard, Records, Appointments, Prescriptions, Family,
│   │                           Consents, Insurance, EmergencyQR, Profile
│   ├── doctor/                 Dashboard, Appointments, Patients, Prescriptions, Schedule, Profile
│   └── hospital/               Dashboard, Doctors, Patients, LabReports, Billing, Profile
├── utils/animations.js         All GSAP presets (centralized)
├── store/authStore.js          Zustand: user, role, token
├── api/                        patient.api.js, doctor.api.js, hospital.api.js, auth.api.js
├── hooks/                      useAuth, useApi, useConsentCheck
├── App.jsx                     Root: Three.js + Lenis + GSAP + routing
├── index.css                   Tailwind v4 + CSS custom properties
└── main.jsx                    React entry
```

### Naming

| Type       | Convention          | Example              |
|------------|---------------------|----------------------|
| Components | PascalCase          | RecordCard.jsx       |
| Pages      | PascalCase          | Records.jsx          |
| Utils      | camelCase           | animations.js        |
| CSS class  | kebab-case          | .record-card         |
| Store      | camelCase + suffix  | authStore.js         |
| API        | camelCase + .api.js | patient.api.js       |

---

*Last updated: April 2026 | MediLocker Design System v2.0*
