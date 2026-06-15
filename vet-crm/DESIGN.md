# Veterinary CRM - Comprehensive Design Document

## 1. Product Vision & Philosophy
The Veterinary CRM is engineered to solve the primary friction point in modern veterinary clinics: **data fragmentation and UI clutter**. Most existing vet software is legacy, slow, and overly complex, forcing clinical staff to click through dozens of menus just to check in a patient or write a clinical note.

**Core Philosophy:** 
- **Speed & Accessibility:** Features must be accessible from a centralized dashboard. Workflows should require minimal clicks.
- **Role-Centric Workflows:** The system adapts its focus based on who is using it. A receptionist cares about the day's schedule and billing; a veterinarian cares about clinical notes and medical history.
- **Modern Aesthetics:** Utilizing clean typography, generous whitespace, and a "glassmorphism" inspired design to reduce cognitive load during high-stress clinic hours.

---

## 2. User Roles & Workflows (Phase 4 Implementation)

### A. Receptionist (Front Desk)
**Primary Goal:** Fast client intake, managing the schedule, and handling billing.
- **Dashboard View:** Centered around the "Appointments Calendar". Quick visibility into who is "Scheduled", "Checked In", and "Completed".
- **Key Actions:** 
  - *Quick Add Patient:* Add a pet directly from the dashboard if a walk-in arrives.
  - *Change Status:* Move an appointment from "Scheduled" to "Checked In" so the vet knows they are waiting in Exam Room 1.
  - *Invoicing:* Generate a bill when an appointment status moves to "Completed".

### B. Veterinarian (Clinical Staff)
**Primary Goal:** Examining patients and writing accurate, legal medical records efficiently.
- **Dashboard View:** Centered around the "Checked In" queue. They need to see exactly who is waiting for them.
- **Key Actions:**
  - *EMR / SOAP Notes:* Clicking a waiting patient immediately opens their Medical Chart.
  - *Historical Context:* Instant visibility into previous SOAP notes, allergies (e.g., "Allergic to Penicillin"), and behavioral flags (e.g., "Bites, needs muzzle").
  - *Treatment Plans:* Entering treatments that seamlessly feed into the Receptionist's billing system.

---

## 3. UI/UX Design System

### Layout Structure
- **Global Sidebar:** Persistent left-hand navigation containing `Dashboard`, `Appointments`, and `Clients & Patients`.
- **Top Navigation/Header:** Context-aware headers. When viewing a specific Client or Patient, the header displays key summary information (Name, Species, Breed) to prevent "lost context" errors.

### Visual Language
- **Framework:** Tailwind CSS
- **Color Palette:**
  - *Primary Actions:* Vibrant Blue (`bg-blue-600` to `bg-blue-700`). Signifies "Save" or "Add".
  - *Backgrounds:* Soft off-whites (`bg-slate-50`) to reduce glare on clinic monitors.
  - *Status Indicators:* Semantic colors for instant recognition (Green for Completed, Orange for Waiting/Checked In, Gray for Scheduled).
- **Typography:** Inter (via Next.js default `next/font`), maximizing legibility for dense medical text.

---

## 4. Feature Specifications

### 4.1 Client & Patient Directory
- **Searchable Table:** A unified list allowing staff to search by owner name, pet name, or phone number.
- **Hierarchical Profiling:** Clients are the "root" entity. Navigating to a Client Profile reveals all enrolled Pets (Patients). Navigating to a Pet reveals their Medical Chart.

### 4.2 Appointments & Scheduling
- **Data Model Integration:** Appointments tie directly to a specific Patient and optionally to a specific Veterinarian (Staff).
- **Time Management:** Utilizes ISO-8601 strict timestamps (`start_time`, `end_time`) handled by the backend to avoid timezone drift across clinic devices.

### 4.3 Electronic Medical Records (EMR)
- **SOAP Methodology:** 
  - **S**ubjective: History and owner observations.
  - **O**bjective: Vitals (weight, temp, HR) and physical exam findings.
  - **A**ssessment: Working diagnosis.
  - **P**lan: Diagnostics ordered, treatments administered, prescriptions.
- **Immutability:** Medical records, once signed/saved, should be appended rather than overwritten, maintaining legal clinical integrity.

---

## 5. API Design Principles (Backend Integration)

- **RESTful Structure:** Resources are strictly noun-based (e.g., `/clients/`, `/patients/`, `/appointments/`, `/records/`).
- **Eager Loading:** To minimize frontend network requests, the FastAPI backend uses SQLAlchemy `selectinload`. For example, fetching a Client automatically joins and returns their associated Patients in a single, fast payload.
- **Type Safety:** The integration of `SQLModel` guarantees that the JSON payload the React frontend sends is strictly validated before hitting the SQLite database, preventing corrupt or malformed clinical data.

---

## 6. Security & Data Integrity (Future Phases)
- **Authentication:** Supabase Auth (JWT tokens) will protect all routes. The Next.js frontend will handle session states, while the FastAPI backend will verify the JWT signature on every request.
- **Soft Deletion:** No records are ever truly `DELETE`d. `is_deleted=True` flags ensure that accidental clicks do not permanently destroy a pet's medical history.
