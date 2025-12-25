// Settings interface
export interface AppSettings {
  useCustomApi: boolean
  apiKey: string
  model: string
}

const STORAGE_KEY = 'anie-settings'

// Default settings
const defaultSettings: AppSettings = {
  useCustomApi: false,
  apiKey: '',
  model: 'gemini-2.5-flash'
}

// Available models for selection
export const availableModels = [
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest (Recommended)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
]

// Get settings from localStorage
export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error('Error reading settings:', error)
  }
  return defaultSettings
}

// Save settings to localStorage
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

// Clear settings
export function clearSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing settings:', error)
  }
}
