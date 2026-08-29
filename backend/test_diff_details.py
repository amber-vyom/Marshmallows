
import git

def get_added_lines(repo, commit, filename):
    if not commit.parents:
        return []
    parent = commit.parents[0]
    diffs = parent.diff(commit, paths=filename, create_patch=True)
    added = []
    for d in diffs:
        if d.diff:
            text = d.diff.decode("utf-8", errors="ignore")
            for line in text.splitlines():
                if line.startswith("+") and not line.startswith("+++"):
                    added.append(line[1:].strip())
    return added

repo = git.Repo("..")
commit = repo.head.commit
repo = git.Repo("..")
commit = repo.head.commit
print("Parent:", commit.parents[0].hexsha[:7] if commit.parents else "no parent")

print("Current commit:", commit.hexsha[:7])
print("Changed files:", list(commit.stats.files.keys()))
print()

for filename in commit.stats.files.keys():
    added = get_added_lines(repo, commit, filename)
    if added:
        print(f"Added lines in {filename}:")
        for line in added[:5]:
            print("   +", line)
        print()