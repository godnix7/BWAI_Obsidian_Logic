import os
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

def generate_keys():
    keys_dir = "keys"
    if not os.path.exists(keys_dir):
        os.makedirs(keys_dir)
        print(f"Created directory: {keys_dir}")

    private_key_path = os.path.join(keys_dir, "private.pem")
    public_key_path = os.path.join(keys_dir, "public.pem")

    if os.path.exists(private_key_path) and os.path.exists(public_key_path):
        print("Keys already exist. Skipping generation.")
        return

    # Generate Private Key
    print("Generating 2048-bit RSA private key...")
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )

    # Save Private Key
    with open(private_key_path, "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ))
    print(f"Private key saved to: {private_key_path}")

    # Generate Public Key
    public_key = private_key.public_key()

    # Save Public Key
    with open(public_key_path, "wb") as f:
        f.write(public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ))
    print(f"Public key saved to: {public_key_path}")

if __name__ == "__main__":
    generate_keys()
