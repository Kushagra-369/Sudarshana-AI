// ============================================================
// SUDARSHANA-AI
// FRONTEND API SERVICE
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// ============================================================
// TYPES
// ============================================================

export interface DashboardData {
    system: string;
    status: string;
    objects_detected: number;
    persons: number;
    vehicles: number;
    anomalies: number;
    active_threats: number;
    high_risk: number;
    medium_risk: number;
    summary: string;
    timestamp: string;
}


export interface HealthData {
    system: string;
    status: string;
    processing: string;
    ai_pipeline: string;
    timestamp: string;
}


// ============================================================
// GET DASHBOARD DATA
// ============================================================

export async function getDashboardData(): Promise<DashboardData> {

    const response = await fetch(
        `${API_BASE_URL}/api/dashboard`
    );

    if (!response.ok) {

        throw new Error(
            `Dashboard API failed: ${response.status}`
        );

    }

    return response.json();
}


// ============================================================
// GET HEALTH
// ============================================================

export async function getHealth(): Promise<HealthData> {

    const response = await fetch(
        `${API_BASE_URL}/api/health`
    );

    if (!response.ok) {

        throw new Error(
            `Health API failed: ${response.status}`
        );

    }

    return response.json();
}