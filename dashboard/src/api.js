import { mockBuilds } from './mockData';

export async function fetchBuildHistory() {
    try {
        // Calls Flask backend through Vite proxy
        const response = await fetch('/api/builds');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Convert DockTrace backend data
        // into the format expected by the dashboard
        const builds = data.map((build, index) => {
            const previousBuild = data[index + 1];

            const sizeChange = previousBuild
                ? build.image_size_mb - previousBuild.image_size_mb
                : 0;

            const hasSpike = sizeChange > 50;

            return {
                id: build.id,

                commit_sha: build.commit_sha,

                author: build.author,

                // Dashboard chart expects size_mb
                size_mb: build.image_size_mb,

                timestamp: build.timestamp,

                // Dashboard fields
                has_spike: hasSpike,

                message: `Docker image build recorded for commit ${build.commit_sha}`,

                diff_summary:
                    build.reason ||
                    (hasSpike
                        ? `Image size increased by ${sizeChange.toFixed(2)} MB`
                        : "No significant Docker image size increase detected.")
            };
        });

        return builds;

    } catch (error) {
        console.warn(
            "Backend not reachable, falling back to mock data.",
            error
        );

        return mockBuilds;
    }
}