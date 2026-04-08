import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

def _get_aes_key():
    # Ensure the key is exactly 32 bytes for AES-256
    key = settings.QR_ENCRYPTION_KEY.encode()
    if len(key) < 32:
        key = key.ljust(32, b'0')
    return key[:32]

def encrypt_qr_token(patient_id: str) -> str:
    """
    Encrypts a patient_id using AES-256-GCM.
    Returns: urlsafe-base64(nonce + ciphertext + tag)
    """
    aesgcm = AESGCM(_get_aes_key())
    nonce = os.urandom(12)
    data = patient_id.encode()
    
    ciphertext = aesgcm.encrypt(nonce, data, None)
    
    # Combine nonce and ciphertext
    result = nonce + ciphertext
    return base64.urlsafe_b64encode(result).decode('utf-8')

def decrypt_qr_token(token: str) -> str:
    """
    Decrypts a base64url encoded AES-GCM token back to patient_id.
    """
    try:
        data = base64.urlsafe_b64decode(token.encode('utf-8'))
        nonce = data[:12]
        ciphertext = data[12:]
        
        aesgcm = AESGCM(_get_aes_key())
        decrypted = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted.decode('utf-8')
    except Exception:
        return None
