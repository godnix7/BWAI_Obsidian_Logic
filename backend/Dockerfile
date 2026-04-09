FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    python3-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy code
COPY . .

# Create static subdirs that git doesn't track (empty dirs)
RUN mkdir -p static/qrcodes static/records static/tmp

# Expose default port (Railway overrides via $PORT)
EXPOSE 8000

# Use shell form so $PORT env var from Railway is expanded at runtime
# Falls back to 8000 if PORT is not set (local dev)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
