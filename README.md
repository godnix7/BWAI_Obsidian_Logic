# 🏥 MediLocker - Secure Healthcare Management Platform

**MediLocker** is a production-grade, secure healthcare backend system designed for the digital age. It provides a centralized, encrypted, and consent-gated ecosystem for patients, doctors, and hospitals to manage medical records, prescriptions, and emergencies with zero-trust security.

**Deployed_URL** : https://bwai-obsidian-logic.vercel.app/

---

## 👥 Meet the Team
| Name | Role |
| :--- | :--- |
| **Nischay Kademane** | Backend Architect & Security Lead |
| **Sujal Singh** | API Development & Database Optimization |
| **Aditya R** | Structural Logic & Documentation |
| **Neeraj Singh** | System Integration & Testing |

---

## 🚀 Project Overview
MediLocker addresses the fragmentation in healthcare by providing a unified platform where patients own their data. Using a "Consent-First" architecture, medical professionals can only access sensitive patient data after explicit digital approval, ensuring total privacy and HIPAA-inspired standards.

---

## ✨ Key Features
- **Zero-Trust Authentication**: Robust JWT-based authentication with secure password hashing (BCrypt).
- **Consent-Gated Access**: Doctors and Hospitals must request and receive "ACTIVE" consent to view medical history or upload reports.
- **Emergency QR System**: Unique patient QR codes with **AES-256 encrypted payloads** for immediate access to critical life-saving data by first responders.
- **Smart Appointment Engine**: A schedule-aware booking system that prevents collisions and suggests the "Next Available Slot."
- **Self-Healing Infrastructure**: Automatic directory management and robust error handling for medical document uploads.
- **Insurance Management**: Secure storage and tracking of policy documents and validity.

---

## 🛠️ Tech Stack
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance Python framework)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [SQLAlchemy Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- **Security**: PyJWT, Cryptography (AES-256), Passlib (BCrypt)
- **Migrations**: Alembic
- **Environment**: Pydantic-Settings
- **Storage**: Local Filesystem / S3-ready (Boto3)

---

## 📂 Project Structure
```text
backend/
├── alembic/                # Database migration history
├── app/
│   ├── api/                # API dependencies (Auth/DB)
│   ├── core/               # App configuration & Security logic
│   ├── models/             # SQLAlchemy ORM Models (User, Profile, Clinical)
│   ├── routers/            # Feature-specific API endpoints
│   ├── schemas/            # Pydantic data validation schemas
│   ├── services/           # Business logic & Storage services
│   └── main.py             # Application entry point & Startup logic
├── keys/                   # RSA Keys for JWT (Production only)
├── static/                 # Storage for Medical Records & QR Codes
├── .env                    # Environment variables configuration
└── requirements.txt        # Project dependencies
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/godnix7/BWAI_Obsidian_Logic.git
cd medilocker/backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the `backend/` root:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/medilocker
SECRET_KEY=your-super-secret-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🚀 Usage Instructions

### Start the Development Server
```bash
uvicorn app.main:app --reload
```
The server will start at `http://localhost:8000`.

### Access API Documentation
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🛣️ Primary API Endpoints

### 🔐 Auth
- `POST /api/v1/auth/signup` - Register as Patient, Doctor, or Hospital.
- `POST /api/v1/auth/login` - Exchange credentials for a JWT Access Token.

### 👤 Patient
- `GET /api/v1/patient/profile` - View medical profile.
- `POST /api/v1/patient/records/upload` - Securely upload medical records.

### 🩺 Doctor
- `GET /api/v1/doctor/appointments` - View assigned patient appointments.
- `POST /api/v1/doctor/prescriptions` - Issue digital prescriptions (Consent required).

### 🏥 Hospital
- `POST /api/v1/hospital/lab-reports` - Upload lab reports directly to patient profiles.

---

## 🔮 Future Enhancements
- **AI Analytics**: Predictive health insights based on medical history.
- **Real-time Chat**: Secure WebSockets-based communication between doctors and patients.
- **Blockchain Integration**: Immutable audit logs for every record access event.

---

## 📄 License
This project is licensed under the MIT License.

---
*Built with ❤️ by the MediLocker Team for the BWAI Hackathon.*
