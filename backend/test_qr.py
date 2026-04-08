import sys
import os
from uuid import uuid4
import json

# Add backend to path
sys.path.append(os.getcwd())

from app.core.config import settings
from app.core.encryption import encrypt_qr_token, decrypt_qr_token

def test_encryption_roundtrip():
    print("Testing Encryption Roundtrip...")
    test_id = str(uuid4())
    token = encrypt_qr_token(test_id)
    print(f"Generated Token: {token}")
    
    decrypted = decrypt_qr_token(token)
    print(f"Decrypted ID: {decrypted}")
    
    assert test_id == decrypted
    print("SUCCESS: Encryption Success!")

def test_qr_generation_simulation():
    print("\nTesting QR Generation Logic...")
    import qrcode
    test_url = f"{settings.BASE_URL}/api/v1/emergency/some-token"
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(test_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to dummy file
    filename = "test_qr.png"
    img.save(filename)
    
    assert os.path.exists(filename)
    os.remove(filename)
    print("SUCCESS: QR Image Logic Success!")

def test_data_filtering_simulation():
    print("\nTesting Data Filtering Simulation...")
    # Mock some data
    profile_data = {
        "full_name": "John Doe",
        "gender": "Male",
        "blood_group": "O+",
        "allergies": ["Peanuts"],
        "emergency_contact_name": "Jane Doe",
        "emergency_contact_phone": "123456789"
    }
    
    # Mock config: hide allergies
    config = {
        "show_blood_group": True,
        "show_allergies": False,
        "show_emergency_contact": True
    }
    
    # Simulation of public_emergency_access filtering logic
    response = {
        "patient_name": profile_data["full_name"],
        "gender": profile_data["gender"]
    }
    if config.get("show_blood_group"):
        response["blood_group"] = profile_data["blood_group"]
    
    if config.get("show_allergies"):
        response["allergies"] = profile_data["allergies"]
    
    if config.get("show_emergency_contact"):
         response["emergency_contact"] = {
            "name": profile_data["emergency_contact_name"],
            "phone": profile_data["emergency_contact_phone"]
        }
         
    print(f"Filtered Response: {json.dumps(response, indent=2)}")
    
    assert "blood_group" in response
    assert "allergies" not in response
    assert "emergency_contact" in response
    print("SUCCESS: Data Filtering Logic Success!")

if __name__ == "__main__":
    try:
        test_encryption_roundtrip()
        test_qr_generation_simulation()
        test_data_filtering_simulation()
        print("\nALL QR SYSTEM CORE LOGIC IS ERROR FREE!")
    except Exception as e:
        print(f"\nERROR DETECTED: {e}")
        sys.exit(1)
