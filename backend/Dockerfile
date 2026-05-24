FROM python:3.12-slim

WORKDIR /app

# Install deps first so Docker can cache this layer.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code + the Cloudflare Worker template the renderer reads.
COPY app/ ./app/
COPY templates/ ./templates/

# Railway injects $PORT; default to 8000 for local docker runs.
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
