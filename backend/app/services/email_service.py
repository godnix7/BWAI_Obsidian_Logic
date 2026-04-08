import logging
from typing import Dict, Any
from app.core.config import settings
from fastapi_mail import FastMail, ConnectionConfig, MessageSchema, MessageType

logger = logging.getLogger(__name__)

# FastAPI-Mail configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS
)

class EmailService:
    @staticmethod
    async def send_doctor_credentials_email(
        doctor_full_name: str,
        doctor_email: str,
        temp_password: str,
        hospital_name: str
    ):
        """
        Sends welcome email to a new doctor with their login credentials via FastAPI-Mail.
        """
        subject = "Welcome to MEDI LOCKER — Your Login Credentials"
        body = f"""
        <html>
        <body>
            <h3>Dear {doctor_full_name},</h3>
            <p>Your account has been created on <b>MEDI LOCKER</b> by <i>{hospital_name}</i>.</p>
            <p><b>Login Email:</b> {doctor_email}</p>
            <p><b>Temporary Password:</b> {temp_password}</p>
            <p>Login here: <a href="http://localhost:5173/login">MediLocker Login</a></p>
            <p>Please change your password immediately after logging in for security.</p>
            <br/>
            <p>Regards,<br/>MEDI LOCKER Team</p>
        </body>
        </html>
        """
        
        message = MessageSchema(
            subject=subject,
            recipients=[doctor_email],
            body=body,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        try:
            await fm.send_message(message)
            logger.info(f"Welcome email sent successfully to {doctor_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {doctor_email}: {str(e)}")
            # Fallback log for development
            with open("debug_emails.txt", "a") as f:
                f.write(f"\n--- FAILED EMAIL LOG fallback ---\nSent to: {doctor_email}\nBody:\n{body}\n--------------------------\n")
            return False

email_service = EmailService()

