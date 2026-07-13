# Runtime stage for Python FastAPI
FROM python:3.12-slim
WORKDIR /app

# Install uv for fast dependency resolution
RUN pip install uv

# Copy python dependencies
COPY pyproject.toml uv.lock ./
# We install dependencies globally in the container
RUN uv sync --system

# Copy application files
COPY api ./api

# Expose port (Cloud Run sets $PORT, default to 8080)
ENV PORT=8080

# Command to run the application
CMD ["sh", "-c", "uvicorn api.app:app --host 0.0.0.0 --port ${PORT}"]
