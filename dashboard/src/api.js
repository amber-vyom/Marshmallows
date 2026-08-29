import { mockBuilds } from './mockData';

export async function fetchBuildHistory() {
  try {
    // Tries to call the FastAPI backend via the Vite proxy
    const response = await fetch('/api/builds');

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.warn("Backend not reachable, falling back to mock data.", error);
    // If the backend fails or isn't running, return the fake data so the UI doesn't break
    return mockBuilds;
  }
}