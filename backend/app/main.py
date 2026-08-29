from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3

app = FastAPI(title="Docktrace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "../docktrace.db"

class BuildRecord(BaseModel):
    commit: str
    author: str
    sizeMB: float
    timestamp: str
    deltaMB: float

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "docktrace"}

@app.get("/api/builds", response_model=List[BuildRecord])
def get_builds():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT commit_sha, author, image_size_mb, timestamp FROM builds ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    previous_size = None
    for commit, author, size_mb, timestamp in rows:
        delta = round(size_mb - previous_size, 2) if previous_size is not None else 0.0
        results.append({
            "commit": commit, "author": author, "sizeMB": size_mb,
            "timestamp": timestamp, "deltaMB": delta,
        })
        previous_size = size_mb
    return results