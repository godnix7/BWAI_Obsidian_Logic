# MediLocker: Secure Healthcare Ecosystem

## 🏥 Overview
MediLocker is a production-grade, secure healthcare backend system designed for the digital age. It provides a centralized, encrypted, and consent-gated ecosystem for patients, doctors, and hospitals to manage medical records, prescriptions, and emergencies with zero-trust security.

## ✨ Features
- **Zero-Trust Authentication**: JWT-based authentication with BCrypt hashing.
- **Consent-Gated Access**: Strict role-based access control requiring active patient consent.
- **Emergency QR System**: AES-256 encrypted payloads for first-responder access.
- **Smart Appointment Engine**: Collision-free scheduling system.

## 🛠️ Tech Stack
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy Async
- **Security**: PyJWT, Cryptography (AES-256)
- **Migrations**: Alembic

## 🚀 Installation & Usage
1. **Clone the repository**:
   ```bash
   git clone https://github.com/godnix7/BWAI_Obsidian_Logic.git
   cd backend
   ```
2. **Set up the environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Configure Environment Variables** (Create a `.env` file):
   ```env
   DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/medilocker
   SECRET_KEY=your-super-secret-key
   ```
4. **Start the Server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   Access the interactive API docs at `http://localhost:8000/docs`.

## 🔮 Future Improvements
- **AI Analytics**: Predictive health insights based on medical history.
- **Real-time Chat**: Secure WebSockets-based communication between doctors and patients.
