from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, create_engine
import models
from models import Client, Patient, Appointment, MedicalRecord, Staff, ServiceItem, Invoice, InvoiceLineItem, Payment, ClinicProfile
from auth import verify_password, create_access_token
from sqlalchemy.orm import selectinload
from typing import List
import uuid
import shutil
import os
import datetime
import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_123")

# SQLite connection for local development
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def get_session():
    with Session(engine) as session:
        yield session

app = FastAPI(title="Veterinary CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Veterinary CRM API is running"}

# --- Clients ---
@app.post("/clients/", response_model=Client)
def create_client(client: Client, session: Session = Depends(get_session)):
    session.add(client)
    session.commit()
    session.refresh(client)
    return client

@app.get("/clients/")
def read_clients(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    clients = session.exec(select(Client).options(selectinload(Client.patients)).where(Client.is_deleted == False).offset(skip).limit(limit)).all()
    return clients

@app.get("/clients/{client_id}")
def read_client(client_id: uuid.UUID, session: Session = Depends(get_session)):
    client = session.exec(select(Client).options(selectinload(Client.patients)).where(Client.id == client_id, Client.is_deleted == False)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client_data = client.model_dump()
    client_data["patients"] = [p.model_dump() for p in client.patients if not p.is_deleted]
    return client_data

@app.delete("/clients/{client_id}")
def delete_client(client_id: uuid.UUID, session: Session = Depends(get_session)):
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.is_deleted = True # Soft delete
    session.add(client)
    session.commit()
    return {"ok": True}

# --- Patients ---
@app.post("/patients/", response_model=Patient)
def create_patient(patient: Patient, session: Session = Depends(get_session)):
    if isinstance(patient.client_id, str):
        import uuid
        patient.client_id = uuid.UUID(patient.client_id)
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient

@app.get("/patients/", response_model=List[Patient])
def read_patients(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    patients = session.exec(select(Patient).where(Patient.is_deleted == False).offset(skip).limit(limit)).all()
    return patients

@app.get("/patients/{patient_id}")
def read_patient(patient_id: uuid.UUID, session: Session = Depends(get_session)):
    patient = session.get(Patient, patient_id)
    if not patient or patient.is_deleted:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

# --- Appointments ---
@app.post("/appointments/")
def create_appointment(appointment: Appointment, session: Session = Depends(get_session)):
    if isinstance(appointment.patient_id, str):
        import uuid
        appointment.patient_id = uuid.UUID(appointment.patient_id)
    import datetime
    if isinstance(appointment.start_time, str):
        appointment.start_time = datetime.datetime.fromisoformat(appointment.start_time.replace('Z', '+00:00'))
    if isinstance(appointment.end_time, str):
        appointment.end_time = datetime.datetime.fromisoformat(appointment.end_time.replace('Z', '+00:00'))
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment

@app.get("/appointments/")
def read_appointments(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    appointments = session.exec(select(Appointment).options(selectinload(Appointment.patient)).offset(skip).limit(limit)).all()
    return [{"id": a.id, "patient_id": a.patient_id, "start_time": a.start_time, "end_time": a.end_time, "type": a.type, "status": a.status, "patient": a.patient} for a in appointments]

# --- Medical Records ---
@app.post("/records/")
def create_medical_record(record: MedicalRecord, session: Session = Depends(get_session)):
    if isinstance(record.patient_id, str):
        import uuid
        record.patient_id = uuid.UUID(record.patient_id)
    if record.vet_id and isinstance(record.vet_id, str):
        import uuid
        record.vet_id = uuid.UUID(record.vet_id)
    session.add(record)
    session.commit()
    session.refresh(record)
    return record

@app.get("/patients/{patient_id}/records")
def read_patient_records(patient_id: uuid.UUID, session: Session = Depends(get_session)):
    records = session.exec(select(MedicalRecord).where(MedicalRecord.patient_id == patient_id).order_by(MedicalRecord.created_at.desc())).all()
    return records

# --- Auth ---
@app.post("/login")
def login(data: dict, session: Session = Depends(get_session)):
    email = data.get("email")
    password = data.get("password")
    user = session.exec(select(Staff).where(Staff.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": str(user.id), "name": user.name, "role": user.role}}

# --- Data Security (Backup & Restore) ---
@app.post("/admin/backup/create")
def create_backup():
    if not os.path.exists("backups"):
        os.makedirs("backups")
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_path = f"backups/database_{timestamp}.db"
    shutil.copy2(sqlite_file_name, backup_path)
    return {"message": "Backup created successfully", "file": backup_path}

@app.get("/admin/backup/list")
def list_backups():
    if not os.path.exists("backups"):
        return []
    files = os.listdir("backups")
    return [{"file": f, "size": os.path.getsize(os.path.join("backups", f))} for f in files if f.endswith(".db")]

@app.post("/admin/backup/restore/{filename}")
def restore_backup(filename: str):
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    backup_path = os.path.join("backups", filename)
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail="Backup not found")
        
    try:
        shutil.copy2(backup_path, sqlite_file_name)
        return {"message": "Database restored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/export")
def export_database(session: Session = Depends(get_session)):
    clients = session.exec(select(Client)).all()
    patients = session.exec(select(Patient)).all()
    appointments = session.exec(select(Appointment)).all()
    records = session.exec(select(MedicalRecord)).all()
    
    return {
        "clients": [c.model_dump() for c in clients],
        "patients": [p.model_dump() for p in patients],
        "appointments": [a.model_dump() for a in appointments],
        "records": [r.model_dump() for r in records]
    }

@app.get("/admin/deleted")
def get_deleted_records(session: Session = Depends(get_session)):
    clients = session.exec(select(Client).where(Client.is_deleted == True)).all()
    patients = session.exec(select(Patient).where(Patient.is_deleted == True)).all()
    return {"clients": clients, "patients": patients}

@app.post("/admin/restore/client/{client_id}")
def restore_client(client_id: uuid.UUID, session: Session = Depends(get_session)):
    client = session.exec(select(Client).where(Client.id == client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.is_deleted = False
    session.add(client)
    session.commit()
    return {"message": "Client restored"}

@app.post("/admin/restore/patient/{patient_id}")
def restore_patient(patient_id: uuid.UUID, session: Session = Depends(get_session)):
    patient = session.exec(select(Patient).where(Patient.id == patient_id)).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.is_deleted = False
    session.add(patient)
    session.commit()
    return {"message": "Patient restored"}

# --- Billing & Payments ---
@app.get("/services/")
def read_services(session: Session = Depends(get_session)):
    return session.exec(select(ServiceItem).where(ServiceItem.is_active == True)).all()

@app.post("/services/")
def create_service(service: ServiceItem, session: Session = Depends(get_session)):
    session.add(service)
    session.commit()
    session.refresh(service)
    return service

@app.post("/invoices/")
def create_invoice(data: dict, session: Session = Depends(get_session)):
    import datetime
    
    client_id = uuid.UUID(data["client_id"])
    due_date = datetime.datetime.fromisoformat(data["due_date"].replace('Z', '+00:00')) if data.get("due_date") else None
    
    invoice = Invoice(client_id=client_id, due_date=due_date, status="pending")
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    
    total = 0.0
    for item in data.get("line_items", []):
        line_total = item["quantity"] * item["unit_price"]
        total += line_total
        
        line_item = InvoiceLineItem(
            invoice_id=invoice.id,
            service_id=uuid.UUID(item["service_id"]) if item.get("service_id") else None,
            patient_id=uuid.UUID(item["patient_id"]) if item.get("patient_id") else None,
            description=item["description"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            total=line_total
        )
        session.add(line_item)
        
    invoice.total_amount = total
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    
    return invoice

@app.get("/clients/{client_id}/invoices")
def get_client_invoices(client_id: uuid.UUID, session: Session = Depends(get_session)):
    invoices = session.exec(
        select(Invoice)
        .options(selectinload(Invoice.line_items), selectinload(Invoice.payments))
        .where(Invoice.client_id == client_id)
        .order_by(Invoice.created_at.desc())
    ).all()
    return invoices

@app.post("/invoices/{invoice_id}/pay")
def pay_invoice(invoice_id: uuid.UUID, data: dict, session: Session = Depends(get_session)):
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    amount = float(data["amount"])
    payment_method = data["payment_method"]
    stripe_id = data.get("stripe_payment_intent_id")
    
    payment = Payment(invoice_id=invoice.id, amount=amount, payment_method=payment_method, stripe_payment_intent_id=stripe_id)
    session.add(payment)
    
    invoice.amount_paid += amount
    if invoice.amount_paid >= invoice.total_amount:
        invoice.status = "paid"
        
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    
    return invoice

from pydantic import BaseModel
class PaymentIntentRequest(BaseModel):
    invoice_id: uuid.UUID
    amount: float

@app.post("/payments/create-intent")
def create_payment_intent(req: PaymentIntentRequest, session: Session = Depends(get_session)):
    invoice = session.get(Invoice, req.invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(req.amount * 100), # Amount in cents
            currency="usd",
            metadata={"invoice_id": str(invoice.id)}
        )
        return {"clientSecret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Clinic Settings & Staff ---

@app.get("/settings/profile")
def get_clinic_profile(session: Session = Depends(get_session)):
    profile = session.exec(select(ClinicProfile)).first()
    if not profile:
        profile = ClinicProfile()
        session.add(profile)
        session.commit()
        session.refresh(profile)
    return profile

@app.put("/settings/profile")
def update_clinic_profile(data: ClinicProfile, session: Session = Depends(get_session)):
    profile = session.exec(select(ClinicProfile)).first()
    if not profile:
        profile = ClinicProfile()
        session.add(profile)
    
    profile.name = data.name
    profile.address = data.address
    profile.phone = data.phone
    profile.email = data.email
    profile.tax_rate = data.tax_rate
    profile.updated_at = datetime.datetime.utcnow()
    
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile

@app.get("/staff")
def get_staff(session: Session = Depends(get_session)):
    return session.exec(select(Staff).where(Staff.is_active == True)).all()

class StaffCreateRequest(BaseModel):
    name: str
    email: str
    role: str

@app.post("/staff")
def create_staff(req: StaffCreateRequest, session: Session = Depends(get_session)):
    staff = Staff(name=req.name, email=req.email, role=req.role, hashed_password="placeholder_hash")
    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff

@app.delete("/staff/{staff_id}")
def delete_staff(staff_id: uuid.UUID, session: Session = Depends(get_session)):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    staff.is_active = False
    session.add(staff)
    session.commit()
    return {"message": "Staff removed"}
