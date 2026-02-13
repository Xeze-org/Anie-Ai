import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadSettings, saveSettings, AVAILABLE_MODELS } from './storage';
import type { Settings } from './storage';
import { checkServerHealth } from './api';
import './Settings.css';

function SettingsPage() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<Settings>(() => loadSettings());
    const [showApiKey, setShowApiKey] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load settings on mount
        setSettings(loadSettings());
    }, []);

    const handleSave = () => {
        saveSettings(settings);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            navigate('/');
        }, 1000);
    };

    const handleTestApiKey = async () => {
        if (!settings.apiKey) return;

        setIsTesting(true);
        setTestResult(null);

        try {
            // First check if server is online
            const serverHealthy = await checkServerHealth();
            if (!serverHealthy) {
                setTestResult('error');
                return;
            }

            // Simple validation - check key format
            if (settings.apiKey.length > 20 && settings.apiKey.startsWith('AI')) {
                setTestResult('success');
            } else if (settings.apiKey.length > 10) {
                // Accept other formats too
                setTestResult('success');
            } else {
                setTestResult('error');
            }
        } catch {
            setTestResult('error');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="settings-page">
            <header className="settings-header">
                <button className="back-btn" onClick={() => navigate('/job-analyzer')}>
                    ← Back
                </button>
                <h1>Settings</h1>
            </header>

            <main className="settings-content">
                <div className="settings-card">
                    <div className="settings-card-header">
                        <span className="settings-icon">⚡</span>
                        <div>
                            <h2>API Configuration</h2>
                            <p>Use your own Gemini API key for direct access, or use the default backend service.</p>
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="toggle-row">
                            <div>
                                <label className="toggle-label">Use my own API key</label>
                                <p className="toggle-description">Enable to use your personal Gemini API key</p>
                            </div>
                            <button
                                className={`toggle-switch ${settings.useOwnKey ? 'active' : ''}`}
                                onClick={() => setSettings({ ...settings, useOwnKey: !settings.useOwnKey })}
                            >
                                <span className="toggle-knob"></span>
                            </button>
                        </div>
                    </div>

                    {settings.useOwnKey && (
                        <>
                            <div className="settings-section">
                                <label className="field-label">Gemini API Key</label>
                                <div className="api-key-row">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        className="settings-input"
                                        placeholder="Enter your Gemini API key..."
                                        value={settings.apiKey}
                                        onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                                    />
                                    <button
                                        className="visibility-btn"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                    >
                                        {showApiKey ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                <p className="field-hint">
                                    Get your API key from{' '}
                                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                                        Google AI Studio
                                    </a>
                                </p>
                            </div>

                            <div className="settings-section">
                                <label className="field-label">Model</label>
                                <select
                                    className="settings-select"
                                    value={settings.model}
                                    onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                >
                                    {AVAILABLE_MODELS.map((model) => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="settings-section">
                                <button
                                    className="test-btn"
                                    onClick={handleTestApiKey}
                                    disabled={!settings.apiKey || isTesting}
                                >
                                    {isTesting ? 'Testing...' : 'Test API Key'}
                                </button>
                                {testResult === 'success' && (
                                    <span className="test-result success">✓ API key looks valid</span>
                                )}
                                {testResult === 'error' && (
                                    <span className="test-result error">✗ Invalid API key or server offline</span>
                                )}
                            </div>
                        </>
                    )}

                    <div className="settings-actions">
                        <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
                            {saved ? '✓ Saved!' : '💾 Save Settings'}
                        </button>
                    </div>
                </div>

                {/* Future Features Section */}
                <div className="settings-card future-features">
                    <h2>🚀 Coming Soon</h2>
                    <ul className="features-list">
                        <li>
                            <span className="feature-icon">📄</span>
                            <div>
                                <strong>Resume Analyzer</strong>
                                <p>AI-powered resume analysis and improvement suggestions</p>
                            </div>
                        </li>
                        <li>
                            <span className="feature-icon">📋</span>
                            <div>
                                <strong>Contract Comparison</strong>
                                <p>Compare multiple agreements side by side</p>
                            </div>
                        </li>
                        <li>
                            <span className="feature-icon">📁</span>
                            <div>
                                <strong>Analysis History</strong>
                                <p>Save and review past document analyses</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}

export default SettingsPage;
