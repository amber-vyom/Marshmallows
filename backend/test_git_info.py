from docktrace import get_latest_commit_info

info = get_latest_commit_info()
print("Commit SHA:", info["commit_sha"])
print("Author:", info["author"])
print("Changed files:", info["changed_files"])
