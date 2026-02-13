// LocalStorage utilities for persisting settings

const STORAGE_KEYS = {
    API_KEY: 'ea-scanner-api-key',
    MODEL: 'ea-scanner-model',
    USE_OWN_KEY: 'ea-scanner-use-own-key',
} as const;

export interface Settings {
    apiKey: string;
    model: string;
    useOwnKey: boolean;
}

export const AVAILABLE_MODELS = [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Latest)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
];

export function loadSettings(): Settings {
    return {
        apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
        model: localStorage.getItem(STORAGE_KEYS.MODEL) || 'gemini-2.5-pro',
        useOwnKey: localStorage.getItem(STORAGE_KEYS.USE_OWN_KEY) === 'true',
    };
}

export function saveSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, settings.apiKey);
    localStorage.setItem(STORAGE_KEYS.MODEL, settings.model);
    localStorage.setItem(STORAGE_KEYS.USE_OWN_KEY, String(settings.useOwnKey));
}

export function clearSettings(): void {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.MODEL);
    localStorage.removeItem(STORAGE_KEYS.USE_OWN_KEY);
}
