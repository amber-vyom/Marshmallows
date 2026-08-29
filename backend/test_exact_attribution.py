from docktrace import (
    get_latest_commit_info,
    get_file_changes,
    attribute_cause
)


print("=" * 60)
print("DOCKTRACE EXACT ATTRIBUTION TEST")
print("=" * 60)


# ==========================================
# GET LATEST COMMIT
# ==========================================

info = get_latest_commit_info()


print()
print("Current Commit:")
print(info["commit_sha"])


print()
print("Author:")
print(info["author"])


print()
print("Changed Files:")


for file in info["changed_files"]:

    print("-", file)


# ==========================================
# SHOW EXACT GIT CHANGES
# ==========================================

print()
print("=" * 60)
print("EXACT GIT CHANGES")
print("=" * 60)


for file in info["changed_files"]:

    changes = get_file_changes(
        filename=file
    )

    added = changes["added"]
    removed = changes["removed"]

    if added or removed:

        print()
        print(f"File: {file}")

        if added:

            print("  Added:")

            for line in added[:5]:

                print(
                    "   +",
                    line
                )

        if removed:

            print("  Removed:")

            for line in removed[:5]:

                print(
                    "   -",
                    line
                )


# ==========================================
# DETECT CAUSE
# ==========================================

print()
print("=" * 60)
print("DETECTED REASON")
print("=" * 60)


reason = attribute_cause(
    info["changed_files"]
)


if reason:

    print(reason)

else:

    print(
        "No Docker-related dependency "
        "or build file was found."
    )


print("=" * 60)