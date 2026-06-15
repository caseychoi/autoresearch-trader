import os
from sqlmodel import Session, create_engine, select
from models import ServiceItem

DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL)

common_services = [
    {"name": "Annual Wellness Exam", "description": "Comprehensive physical examination", "price": 50.00},
    {"name": "Rabies Vaccination (1 year)", "description": "Core vaccine required by law", "price": 25.00},
    {"name": "Rabies Vaccination (3 year)", "description": "Core vaccine extended coverage", "price": 45.00},
    {"name": "Distemper/Parvo Vaccine (DHPP)", "description": "Core dog vaccine", "price": 30.00},
    {"name": "FVRCP Vaccine (Cats)", "description": "Core cat vaccine", "price": 30.00},
    {"name": "Bordetella Vaccine", "description": "Kennel cough prevention", "price": 25.00},
    {"name": "Heartworm Test", "description": "Annual screening for heartworm disease", "price": 40.00},
    {"name": "Fecal Exam", "description": "Screening for intestinal parasites", "price": 35.00},
    {"name": "Microchip Implantation", "description": "Permanent identification microchip", "price": 45.00},
    {"name": "Nail Trim", "description": "Basic nail clipping", "price": 20.00},
    {"name": "Anal Gland Expression", "description": "Manual expression of anal glands", "price": 25.00},
    {"name": "Dental Cleaning (Basic)", "description": "Routine scaling and polishing under anesthesia", "price": 250.00},
    {"name": "Spay / Neuter Surgery", "description": "Standard sterilization surgery", "price": 200.00},
    {"name": "X-Ray (1 view)", "description": "Standard radiograph", "price": 100.00},
    {"name": "Ultrasound", "description": "Diagnostic imaging", "price": 250.00},
    {"name": "Bloodwork (Comprehensive)", "description": "Full chemistry and CBC panel", "price": 150.00}
]

def seed():
    with Session(engine) as session:
        existing_names = [e.name for e in session.exec(select(ServiceItem)).all()]
        added = 0
        for s in common_services:
            if s["name"] not in existing_names:
                service = ServiceItem(**s)
                session.add(service)
                added += 1
        
        session.commit()
        print(f"Successfully seeded {added} common services!")

if __name__ == '__main__':
    seed()
