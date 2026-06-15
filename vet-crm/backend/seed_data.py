from sqlmodel import Session
from main import engine
from models import Client, Patient, Appointment, Staff, MedicalRecord
from datetime import datetime, timedelta
import uuid

def seed_test_data():
    with Session(engine) as session:
        # Add a couple of clients
        client1 = Client(first_name="John", last_name="Doe", email="john.doe@example.com", phone="555-0101")
        client2 = Client(first_name="Jane", last_name="Smith", email="jane.smith@example.com", phone="555-0102")
        client3 = Client(first_name="Alice", last_name="Johnson", email="alice.j@example.com", phone="555-0103")
        session.add_all([client1, client2, client3])
        session.commit()
        
        # Add some patients
        patient1 = Patient(client_id=client1.id, name="Buddy", species="Dog", breed="Golden Retriever", weight_kg=30.5)
        patient2 = Patient(client_id=client1.id, name="Whiskers", species="Cat", breed="Siamese", alert_flags="Allergic to Penicillin")
        patient3 = Patient(client_id=client2.id, name="Bella", species="Dog", breed="Pug", weight_kg=8.2, alert_flags="Anxious")
        patient4 = Patient(client_id=client3.id, name="Shadow", species="Cat", breed="Maine Coon")
        session.add_all([patient1, patient2, patient3, patient4])
        session.commit()
        
        # Add appointments (some scheduled, some checked in)
        now = datetime.now()
        app1 = Appointment(patient_id=patient1.id, start_time=now + timedelta(hours=1), end_time=now + timedelta(hours=1, minutes=30), type="checkup", status="Scheduled")
        app2 = Appointment(patient_id=patient2.id, start_time=now + timedelta(minutes=30), end_time=now + timedelta(hours=1), type="vaccination", status="Checked In")
        app3 = Appointment(patient_id=patient3.id, start_time=now - timedelta(hours=1), end_time=now - timedelta(minutes=30), type="surgery", status="Completed")
        session.add_all([app1, app2, app3])
        session.commit()
        
        # Add a medical record
        record = MedicalRecord(patient_id=patient3.id, subjective="Owner states dog is lethargic.", objective="Temp 101.5F, HR 120.", assessment="Mild dehydration.", plan="Fluids and rest.")
        session.add(record)
        session.commit()
        
        print("Test data seeded successfully!")

if __name__ == "__main__":
    seed_test_data()
