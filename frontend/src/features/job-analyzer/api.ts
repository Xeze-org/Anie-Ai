import type { AnalyzeRequest, AnalysisResult, ApiError } from './types';

const API_URL = import.meta.env.VITE_JOB_ANALYZER_API_URL || 'https://docs-backend-271230242037.asia-south1.run.app';

export async function checkServerHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(15000)
        });
        return response.ok;
    } catch {
        return false;
    }
}

export async function analyzeDocument(request: AnalyzeRequest): Promise<AnalysisResult> {
    const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.details || error.error || 'Analysis failed');
    }

    return response.json();
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Resume Analysis API
export async function analyzeResume(request: { api_key: string; document: string; filename: string }): Promise<import('./types').ResumeAnalysisResult> {
    const response = await fetch(`${API_URL}/api/resume/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Resume analysis failed');
    }

    return response.json();
}
