import sys
import os
from sqlalchemy.orm import Session

# Add the server directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole

def seed():
    # Make sure tables are created
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        default_users = [
            {
                "email": "manager@transitops.in",
                "password": "manager123",
                "role": UserRole.FLEET_MANAGER,
                "name": "Fleet Manager"
            },
            {
                "email": "dispatcher@transitops.in",
                "password": "dispatcher123",
                "role": UserRole.DISPATCHER,
                "name": "Dispatcher"
            },
            {
                "email": "safety@transitops.in",
                "password": "safety123",
                "role": UserRole.SAFETY_OFFICER,
                "name": "Safety Officer"
            },
            {
                "email": "finance@transitops.in",
                "password": "finance123",
                "role": UserRole.FINANCIAL_ANALYST,
                "name": "Financial Analyst"
            }
        ]
        
        for u in default_users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    role=u["role"],
                    name=u["name"]
                )
                db.add(user)
                print(f"Created user: {u['email']} ({u['role']})")
        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
