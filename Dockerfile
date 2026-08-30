FROM python:3.11-slim

WORKDIR /app

# Install Git
RUN apt-get update && apt-get install -y git docker.io

# Copy requirements first
COPY backend/requirements.txt ./requirements.txt

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pandas
# Copy the complete project
COPY . .

# Start DockTrace
CMD ["python", "backend/docktrace.py"]