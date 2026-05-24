FROM python:3.12-slim

WORKDIR /app

# Install deps first so Docker can cache this layer.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the embedding model so the first /api/scan or /api/rag/stats
# request doesn't pay the ~80 MB cold-start download.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Application code + the Cloudflare Worker template the renderer reads.
COPY app/ ./app/
COPY templates/ ./templates/

# Railway injects $PORT; default to 8000 for local docker runs.
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
