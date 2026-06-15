from typing import Optional, List
from datetime import datetime, date
from sqlmodel import SQLModel, Field, Relationship
import uuid

class Staff(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    name: str
    role: str # 'admin', 'vet', 'tech', 'reception'
    is_active: bool = Field(default=True)

class Client(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: str
    is_deleted: bool = Field(default=False)
    
    patients: List["Patient"] = Relationship(back_populates="client")

class Patient(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(foreign_key="client.id")
    name: str
    species: str
    breed: Optional[str] = None
    dob: Optional[date] = None
    weight_kg: Optional[float] = None
    alert_flags: Optional[str] = None # e.g. "Bites, Allergic to Penicillin"
    is_deleted: bool = Field(default=False)

    client: Client = Relationship(back_populates="patients")
    appointments: List["Appointment"] = Relationship(back_populates="patient")

class Appointment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    patient_id: uuid.UUID = Field(foreign_key="patient.id")
    vet_id: Optional[uuid.UUID] = Field(default=None, foreign_key="staff.id")
    start_time: datetime
    end_time: datetime
    type: str # 'checkup', 'surgery', 'vaccination'
    status: str # 'scheduled', 'checked_in', 'completed', 'cancelled'

    patient: Patient = Relationship(back_populates="appointments")

class MedicalRecord(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    patient_id: uuid.UUID = Field(foreign_key="patient.id")
    vet_id: Optional[uuid.UUID] = Field(default=None, foreign_key="staff.id")
    subjective: str
    objective: str
    assessment: str
    plan: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ServiceItem(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    price: float
    is_active: bool = Field(default=True)

class Invoice(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(foreign_key="client.id")
    total_amount: float = Field(default=0.0)
    amount_paid: float = Field(default=0.0)
    status: str = Field(default="pending") # 'pending', 'paid', 'cancelled'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = None

    line_items: List["InvoiceLineItem"] = Relationship(back_populates="invoice")
    payments: List["Payment"] = Relationship(back_populates="invoice")

class InvoiceLineItem(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    invoice_id: uuid.UUID = Field(foreign_key="invoice.id")
    service_id: Optional[uuid.UUID] = Field(default=None, foreign_key="serviceitem.id")
    patient_id: Optional[uuid.UUID] = Field(default=None, foreign_key="patient.id")
    description: str
    quantity: int = Field(default=1)
    unit_price: float
    total: float

    invoice: Invoice = Relationship(back_populates="line_items")

class Payment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    invoice_id: uuid.UUID = Field(foreign_key="invoice.id")
    amount: float
    payment_method: str # 'cash', 'card', 'check', 'stripe'
    date: datetime = Field(default_factory=datetime.utcnow)
    stripe_payment_intent_id: Optional[str] = None

    invoice: Invoice = Relationship(back_populates="payments")

class ClinicProfile(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(default="My Veterinary Clinic")
    address: str = Field(default="")
    phone: str = Field(default="")
    email: str = Field(default="")
    tax_rate: float = Field(default=0.0) # Percentage (e.g. 5.0 for 5%)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
