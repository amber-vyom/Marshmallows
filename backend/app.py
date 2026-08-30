from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

app = FastAPI(
    title="DockTrace API",
    version="1.0.0"
)

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "docktrace.db"
)


@app.get("/api/builds")
def get_builds():

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM builds
            ORDER BY id DESC
        """)

        rows = cursor.fetchall()

        builds = [dict(row) for row in rows]

        conn.close()

        return builds

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/api/health")
def health():

    return {
        "status": "running",
        "message": "DockTrace FastAPI is running"
    }