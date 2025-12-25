import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, EyeOff, Loader2, CheckCircle, XCircle, Zap } from 'lucide-react'
import { getSettings, saveSettings, availableModels, type AppSettings } from '../lib/settings'
import { testApiKey } from '../lib/gemini'
import './Settings.css'

export function Settings() {
    const [settings, setSettings] = useState<AppSettings>(getSettings())
    const [showApiKey, setShowApiKey] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
    const [isSaved, setIsSaved] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        // Reset test result when settings change
        setTestResult(null)
        setIsSaved(false)
    }, [settings.apiKey, settings.model, settings.useCustomApi])

    const handleSave = () => {
        saveSettings(settings)
        setIsSaved(true)
        // Navigate to chat after a short delay to show "Saved!" feedback
        setTimeout(() => navigate('/chat'), 500)
    }

    const handleTestApiKey = async () => {
        if (!settings.apiKey) return

        setIsTesting(true)
        setTestResult(null)

        const isValid = await testApiKey(settings.apiKey, settings.model)
        setTestResult(isValid ? 'success' : 'error')
        setIsTesting(false)
    }

    return (
        <div className="settings-container">
            {/* Ambient background effects */}
            <div className="ambient-bg">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            {/* Header */}
            <header className="settings-header">
                <Link to="/" className="back-btn">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </Link>
                <h1>Settings</h1>
            </header>

            {/* Settings Content */}
            <main className="settings-content">
                <div className="settings-card">
                    <div className="settings-section">
                        <div className="section-header">
                            <Zap size={20} />
                            <h2>API Configuration</h2>
                        </div>
                        <p className="section-description">
                            Use your own Gemini API key for direct access, or use the default backend service.
                        </p>

                        {/* Toggle Custom API */}
                        <div className="setting-row">
                            <div className="setting-info">
                                <label htmlFor="useCustomApi">Use my own API key</label>
                                <span className="setting-hint">Enable to use your personal Gemini API key</span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    id="useCustomApi"
                                    checked={settings.useCustomApi}
                                    onChange={(e) => setSettings({ ...settings, useCustomApi: e.target.checked })}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>

                        {/* API Key Input */}
                        {settings.useCustomApi && (
                            <>
                                <div className="setting-row vertical">
                                    <label htmlFor="apiKey">Gemini API Key</label>
                                    <div className="api-key-input-wrapper">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            id="apiKey"
                                            value={settings.apiKey}
                                            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                                            placeholder="Enter your Gemini API key"
                                            className="api-key-input"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-visibility-btn"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                        >
                                            {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <span className="setting-hint">
                                        Get your API key from{' '}
                                        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                                            Google AI Studio
                                        </a>
                                    </span>
                                </div>

                                {/* Model Selection */}
                                <div className="setting-row vertical">
                                    <label htmlFor="model">Model</label>
                                    <select
                                        id="model"
                                        value={settings.model}
                                        onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                        className="model-select"
                                    >
                                        {availableModels.map((model) => (
                                            <option key={model.id} value={model.id}>
                                                {model.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Test API Key Button */}
                                <div className="setting-row">
                                    <button
                                        className="test-btn"
                                        onClick={handleTestApiKey}
                                        disabled={!settings.apiKey || isTesting}
                                    >
                                        {isTesting ? (
                                            <>
                                                <Loader2 size={16} className="spin" />
                                                Testing...
                                            </>
                                        ) : testResult === 'success' ? (
                                            <>
                                                <CheckCircle size={16} />
                                                API Key Valid
                                            </>
                                        ) : testResult === 'error' ? (
                                            <>
                                                <XCircle size={16} />
                                                Invalid Key
                                            </>
                                        ) : (
                                            'Test API Key'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="settings-actions">
                        <button className="save-btn" onClick={handleSave}>
                            {isSaved ? (
                                <>
                                    <CheckCircle size={18} />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
