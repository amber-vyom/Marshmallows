import sys
import subprocess
import sqlite3
import git


# =========================================================
# DATABASE
# =========================================================

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


# =========================================================
# GIT INFORMATION
# =========================================================

def get_latest_commit_info(repo_path=".."):
    repo = git.Repo(repo_path)
    commit = repo.head.commit

    return {
        "commit_sha": commit.hexsha[:7],
        "author": commit.author.name,
        "changed_files": list(commit.stats.files.keys())
    }


# =========================================================
# DECODE FILE CONTENT
# =========================================================

def decode_file_content(data):
    """
    Try multiple encodings.

    This allows DockTrace to read files such as:
    UTF-8
    UTF-8 with BOM
    UTF-16 LE
    UTF-16 BE
    """

    encodings = [
        "utf-8",
        "utf-8-sig",
        "utf-16",
        "utf-16-le",
        "utf-16-be"
    ]

    for encoding in encodings:

        try:
            return data.decode(encoding)

        except UnicodeDecodeError:
            pass

    return data.decode(
        "utf-8",
        errors="ignore"
    )


# =========================================================
# GET FILE CONTENT FROM A COMMIT
# =========================================================

def get_file_content_from_commit(
    commit,
    filename
):
    """
    Get a file directly from a Git commit.
    """

    try:

        blob = commit.tree / filename

        data = blob.data_stream.read()

        return decode_file_content(data)

    except Exception:

        return ""


# =========================================================
# COMPARE FILE LINES DIRECTLY
# =========================================================

def compare_commit_files(
    parent,
    commit,
    filename
):
    """
    Compare parent and current commit.

    This works even when Git considers
    a text file to be binary because
    of UTF-16 encoding.
    """

    old_content = get_file_content_from_commit(
        parent,
        filename
    )

    new_content = get_file_content_from_commit(
        commit,
        filename
    )

    old_lines = old_content.splitlines()

    new_lines = new_content.splitlines()

    added = []
    removed = []

    # Find lines that exist in the
    # new file but not in old file

    for line in new_lines:

        clean_line = line.strip()

        if (
            clean_line
            and clean_line not in old_lines
        ):

            added.append(clean_line)

    # Find lines that existed in the
    # old file but not in new file

    for line in old_lines:

        clean_line = line.strip()

        if (
            clean_line
            and clean_line not in new_lines
        ):

            removed.append(clean_line)

    return {
        "added": added,
        "removed": removed
    }


# =========================================================
# GET EXACT FILE CHANGES
# =========================================================

def get_file_changes(
    repo_path=".",
    filename=None
):

    repo = git.Repo(repo_path)

    commit = repo.head.commit


    # First commit has no parent

    if not commit.parents:

        return {
            "added": [],
            "removed": []
        }


    parent = commit.parents[0]


    # =====================================================
    # TRY NORMAL GIT DIFF FIRST
    # =====================================================

    try:

        diff_text = repo.git.diff(
            parent.hexsha,
            commit.hexsha,
            "--",
            filename
        )


        added_lines = []
        removed_lines = []


        for line in diff_text.splitlines():

            # Ignore file headers

            if line.startswith("+++"):
                continue

            if line.startswith("---"):
                continue


            # Added line

            if line.startswith("+"):

                clean_line = line[1:].strip()

                if clean_line:

                    added_lines.append(
                        clean_line
                    )


            # Removed line

            elif line.startswith("-"):

                clean_line = line[1:].strip()

                if clean_line:

                    removed_lines.append(
                        clean_line
                    )


        # If Git gave us real text changes,
        # return them immediately

        if added_lines or removed_lines:

            return {
                "added": added_lines,
                "removed": removed_lines
            }


    except Exception:

        pass


    # =====================================================
    # FALLBACK:
    # DIRECTLY COMPARE FILE CONTENT
    # =====================================================

    return compare_commit_files(
        parent,
        commit,
        filename
    )


# =========================================================
# BACKWARD COMPATIBILITY
# =========================================================

def get_added_lines(
    repo_path=".",
    filename=None
):

    changes = get_file_changes(
        repo_path=repo_path,
        filename=filename
    )

    return changes["added"]


# =========================================================
# DOCKER IMAGE SIZE
# =========================================================

def get_image_size_mb(image_name):

    cmd = [
        "docker",
        "inspect",
        "--format={{.Size}}",
        image_name
    ]

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=True
    )

    size_bytes = int(
        result.stdout.strip()
    )

    size_mb = size_bytes / (
        1024 * 1024
    )

    return round(
        size_mb,
        2
    )


# =========================================================
# ATTRIBUTE CAUSE
# =========================================================

def attribute_cause(changed_files):

    important_files = {

        "requirements.txt":
            "Python dependencies",

        "package.json":
            "Node dependencies",

        "package-lock.json":
            "Node package lock changes",

        "Dockerfile":
            "Dockerfile changes",

        "poetry.lock":
            "Poetry dependencies",

        "Pipfile":
            "Python dependencies"
    }


    for file_path in changed_files:

        filename = file_path.split("/")[-1]


        if filename not in important_files:

            continue


        # Get exact changes

        changes = get_file_changes(
            repo_path=".",
            filename=file_path
        )


        added = changes["added"]

        removed = changes["removed"]


        # =================================================
        # ADDED LINES
        # =================================================

        if added:

            important_lines = added[:3]

            details = ", ".join(

                f"`{line}`"

                for line in important_lines
            )


            return (

                f"Likely caused by changes in "

                f"{file_path}: "

                f"added {details}."
            )


        # =================================================
        # REMOVED LINES
        # =================================================

        if removed:

            important_lines = removed[:3]

            details = ", ".join(

                f"`{line}`"

                for line in important_lines
            )


            return (

                f"Changes detected in "

                f"{file_path}: "

                f"removed {details}."
            )


        # =================================================
        # FALLBACK
        # =================================================

        return (

            f"Likely caused by "

            f"{important_files[filename]} "

            f"in {file_path}."
        )


    return None


# =========================================================
# LOG BUILD
# =========================================================

def log_build(image_name):

    # Get latest Git information

    info = get_latest_commit_info()


    # Get Docker image size

    size_mb = get_image_size_mb(
        image_name
    )


    # Detect possible cause

    reason = attribute_cause(
        info["changed_files"]
    )


    # Connect database

    conn = sqlite3.connect(
        "docktrace.db"
    )

    cursor = conn.cursor()


    # Get previous build

    cursor.execute("""
        SELECT image_size_mb
        FROM builds
        ORDER BY id DESC
        LIMIT 1
    """)


    previous = cursor.fetchone()


    # Calculate delta

    if previous:

        delta_mb = round(
            size_mb - previous[0],
            2
        )

    else:

        delta_mb = 0.0


    # Insert build

    cursor.execute(
        """
        INSERT INTO builds (
            commit_sha,
            author,
            image_size_mb,
            reason
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            info["commit_sha"],
            info["author"],
            size_mb,
            reason
        )
    )


    conn.commit()

    conn.close()


    # =====================================================
    # DISPLAY RESULT
    # =====================================================

    print()

    print("=" * 60)

    print(
        "DOCKTRACE BUILD RECORDED"
    )

    print("=" * 60)


    print(
        f"Commit: {info['commit_sha']}"
    )


    print(
        f"Author: {info['author']}"
    )


    print(
        f"Image Size: {size_mb} MB"
    )


    if previous:

        sign = (
            "+"
            if delta_mb >= 0
            else ""
        )


        print(

            f"Size Change: "

            f"{sign}{delta_mb} MB"
        )


    else:

        print(
            "Size Change: First build"
        )


    print()


    if reason:

        print(
            "Possible Cause:"
        )

        print(
            reason
        )


    else:

        print(
            "Possible Cause:"
        )

        print(
            "No obvious dependency "
            "or Docker build file "
            "was detected."
        )


    print("=" * 60)


# =========================================================
# MAIN PROGRAM
# =========================================================

if __name__ == "__main__":

    init_db()


    if len(sys.argv) > 1:

        image_name = sys.argv[1]

        log_build(
            image_name
        )


    else:

        print("=" * 50)

        print(
            "DOCKTRACE"
        )

        print("=" * 50)

        print(
            "Database ready."
        )

        print()

        print(
            "Run with a Docker image:"
        )

        print()

        print(
            "python docktrace.py myapp:latest"
        )