from docktrace import attribute_cause

test_cases = [
    ["requirements.txt", "app/main.py"],
    ["README.md"],
    ["Dockerfile", "src/app.py"],
    ["package.json", "package-lock.json"],
]

for files in test_cases:
    print(f"Changed files: {files}")
    print(f"  -> {attribute_cause(files)}")
    print()