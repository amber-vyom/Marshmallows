import sqlite3

conn = sqlite3.connect("docktrace.db")
cursor = conn.cursor()

test_builds = [
    ("a1b2c3d", "Alex", 210.5),
    ("d4e5f6g", "Sam", 215.0),
    ("g7h8i9j", "Dev", 1850.0),  # a deliberate spike, like a huge dependency getting added
]

for commit_sha, author, size_mb in test_builds:
    cursor.execute(
        "INSERT INTO builds (commit_sha, author, image_size_mb) VALUES (?, ?, ?)",
        (commit_sha, author, size_mb)
    )

conn.commit()
conn.close()
print(f"Inserted {len(test_builds)} test build records.")