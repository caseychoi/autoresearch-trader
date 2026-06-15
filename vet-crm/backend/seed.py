from sqlmodel import Session, select
from main import engine
from models import Staff
from auth import get_password_hash

def seed_users():
    with Session(engine) as session:
        # Check if users already exist
        if session.exec(select(Staff)).first():
            print("Users already seeded.")
            return

        receptionist = Staff(
            name="Alice (Reception)",
            email="reception@clinic.com",
            hashed_password=get_password_hash("password123"),
            role="reception"
        )
        vet = Staff(
            name="Dr. Smith (Vet)",
            email="vet@clinic.com",
            hashed_password=get_password_hash("password123"),
            role="vet"
        )
        admin = Staff(
            name="Admin",
            email="admin@clinic.com",
            hashed_password=get_password_hash("password123"),
            role="admin"
        )

        session.add(receptionist)
        session.add(vet)
        session.add(admin)
        session.commit()
        print("Successfully seeded mock users.")

if __name__ == "__main__":
    seed_users()
