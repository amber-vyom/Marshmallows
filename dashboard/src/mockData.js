export const mockBuilds = [
  {
    id: 1,
    commit_sha: "7a8b9c1",
    author: "Vyom",
    message: "Initial FastAPI and SQLite backend setup",
    timestamp: "10:00 AM",
    size_mb: 180,
    has_spike: false,
    diff_summary: "Base Python Alpine image used."
  },
  {
    id: 2,
    commit_sha: "3f4e5d6",
    author: "Pooja",
    message: "Add Vite React dashboard structure",
    timestamp: "10:30 AM",
    size_mb: 210,
    has_spike: false,
    diff_summary: "+30MB added from npm dependencies."
  },
  {
    id: 3,
    commit_sha: "9e8d7c6",
    author: "Vyom",
    message: "Install heavy machine learning dependency",
    timestamp: "11:15 AM",
    size_mb: 1450,
    has_spike: true,
    diff_summary: "+1240MB spike detected! Added PyTorch in requirements.txt."
  },
  {
    id: 4,
    commit_sha: "1a2b3c4",
    author: "Pooja",
    message: "Refactor Dockerfile with multi-stage build",
    timestamp: "12:00 PM",
    size_mb: 320,
    has_spike: false,
    diff_summary: "-1130MB reduced by stripping build cached files."
  }
];