from pathlib import Path

# Expose the backend/app package even though this file exists at the project root.
__path__ = [str(Path(__file__).resolve().with_name("app"))]

from app.main import app
