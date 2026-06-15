# Veterinary CRM Architecture & Design

## System Overview

The Veterinary CRM is a modern, responsive web application tailored for small-to-medium sized veterinary clinics. It provides an intuitive interface for managing pet owners (Clients), their pets (Patients), medical records, and daily clinic schedules.

## Technology Stack

The application is built using a decoupled client-server architecture:

### Frontend (Client)
* **Framework:** Next.js 14+ (App Router)
* **UI Library:** React
* **Styling:** Tailwind CSS (for rapid, responsive, and highly customizable UI)
* **Icons:** Lucide-React
* **Design Pattern:** A sleek, glassmorphism-inspired "Dashboard" layout optimized for tablets and desktops commonly used in clinic reception areas and exam rooms.

### Backend (API Server)
* **Framework:** FastAPI (Python)
* **ORM:** SQLModel (combining SQLAlchemy for database interactions and Pydantic for data validation/serialization)
* **Database:** SQLite (currently used for rapid local development), engineered to be instantly swappable to PostgreSQL (via Supabase) for production.
* **Migrations:** Alembic (for robust database schema versioning)

## Data Model

The core relational database schema revolves around these primary entities:

1. **Client (Pet Owner)**
   - `id` (UUID)
   - `first_name`, `last_name`, `phone`, `email`
   - Has a one-to-many relationship with `Patient`.

2. **Patient (Pet)**
   - `id` (UUID)
   - `client_id` (Foreign Key -> Client)
   - `name`, `species`, `breed`, `dob`, `weight_kg`
   - `alert_flags` (e.g., "Allergic to Penicillin", "Bites")

3. **Staff (Clinic Employee)**
   - `id` (UUID)
   - `name`, `role` (Admin, Veterinarian, Vet Tech, Receptionist)

4. **Appointment**
   - `id` (UUID)
   - `patient_id` (Foreign Key -> Patient)
   - `vet_id` (Foreign Key -> Staff)
   - `start_time`, `end_time`
   - `type` (Checkup, Surgery, Vaccination)
   - `status` (Scheduled, Checked_In, Completed, Cancelled)

5. **Medical Record**
   - `id` (UUID)
   - `patient_id` (Foreign Key -> Patient)
   - `vet_id` (Foreign Key -> Staff)
   - Contains SOAP notes: `subjective`, `objective`, `assessment`, `plan`

## Key Design Decisions

1. **Decoupled Architecture:** By separating the Next.js frontend from the FastAPI backend, we ensure that the frontend can be hosted independently (e.g., on Vercel) while the backend can scale on specialized Python infrastructure. It also allows future development of native mobile apps (iOS/Android) that consume the exact same FastAPI endpoints.
2. **SQLModel for Backend:** Choosing SQLModel drastically reduces boilerplate. A single class definition serves as both the SQLAlchemy database table schema and the Pydantic API validation schema.
3. **Optimized User Experience:** The UI is designed to minimize clicks. Features like the "Quick Add Patient" modal directly on the Dashboard ensure that fast-paced clinic staff can enter data without constantly navigating away from their primary schedule view.

## Future Implementation Roadmap

* **Phase 2:** Supabase Authentication and Role-Based Access Control (RBAC).
* **Phase 3:** Full CRUD implementation for Medical Records (SOAP notes).
* **Phase 4:** Invoicing, Payment integrations (Stripe), and Automated SMS Reminders (Twilio).
