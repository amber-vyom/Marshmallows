import sys
import subprocess
import sqlite3

def init_db():
    conn = sqlite3.connect("docktrace.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS builds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            commit_sha TEXT,
            author TEXT,
            image_size_mb REAL,
            reason TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def get_latest_commit_info(repo_path="."):
    import git
    repo = git.Repo(repo_path)
    commit = repo.head.commit
    return {
        "commit_sha": commit.hexsha[:7],
        "author": commit.author.name,
        "changed_files": list(commit.stats.files.keys()),
    }

def get_image_size_mb(image_name):
    cmd = ["docker", "inspect", "--format={{.Size}}", image_name]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    size_bytes = int(result.stdout.strip())
    return round(size_bytes / (1024 * 1024), 2)

def attribute_cause(changed_files):
    bloat_files = {
        "requirements.txt": "a Python dependency change in requirements.txt",
        "package.json": "a Node dependency change in package.json",
        "package-lock.json": "an updated package-lock.json",
        "Dockerfile": "a change to the Dockerfile itself",
        "poetry.lock": "a Poetry dependency change",
        "Pipfile": "a Pipfile dependency change",
    }
    for f in changed_files:
        filename = f.split("/")[-1]
        if filename in bloat_files:
            return f"Likely caused by {bloat_files[filename]}."
    return None

def log_build(image_name):
    info = get_latest_commit_info()
    size_mb = get_image_size_mb(image_name)
    reason = attribute_cause(info["changed_files"])

    conn = sqlite3.connect("docktrace.db")
    cursor = conn.cursor()
    cursor.execute("SELECT image_size_mb FROM builds ORDER BY id DESC LIMIT 1")
    previous = cursor.fetchone()
    delta_mb = round(size_mb - previous[0], 2) if previous else 0.0

    cursor.execute(
        "INSERT INTO builds (commit_sha, author, image_size_mb, reason) VALUES (?, ?, ?, ?)",
        (info["commit_sha"], info["author"], size_mb, reason)
    )
    conn.commit()
    conn.close()

    if previous:
        sign = "+" if delta_mb >= 0 else ""
        print(f"Recorded build: {info['commit_sha']} by {info['author']} | {size_mb} MB ({sign}{delta_mb} MB)")
    else:
        print(f"Recorded build: {info['commit_sha']} by {info['author']} | {size_mb} MB (first build)")
    if reason:
        print(f"Reason: {reason}")

if __name__ == "__main__":
    init_db()
    if len(sys.argv) > 1:
        log_build(sys.argv[1])
    else:
        print("Database ready. Run again with an image name, e.g.:")
        print("  python docktrace.py myapp:latest")