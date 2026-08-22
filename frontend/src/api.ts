

const API_URL = import.meta.env.VITE_API_URL;

export async function getDashboard() {
    const response = await fetch(`${API_URL}/api/dashboard`);

    if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
    }

    return response.json();
}