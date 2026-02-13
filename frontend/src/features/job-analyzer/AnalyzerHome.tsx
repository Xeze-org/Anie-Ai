import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { checkServerHealth } from './api';
import { loadSettings } from './storage';
import './AnalyzerHome.css';

function AnalyzerHome() {
    const navigate = useNavigate();
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [hasApiKey, setHasApiKey] = useState(false);

    useEffect(() => {
        const settings = loadSettings();
        setHasApiKey(settings.useOwnKey && !!settings.apiKey);
    }, []);

    useEffect(() => {
        const checkHealth = async () => {
            const isHealthy = await checkServerHealth();
            setServerStatus(isHealthy ? 'online' : 'offline');
        };
        checkHealth();
        const interval = setInterval(checkHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-page">
            <header className="home-header">
                <div className="logo">🔍</div>
                <h1>Job Document Analyzer</h1>
                <p>AI-powered analysis for employment agreements and resumes</p>

                <div className="header-badges">
                    <div className={`status-badge ${serverStatus}`}>
                        <span className="dot"></span>
                        {serverStatus === 'online' ? 'Server Online' : serverStatus === 'offline' ? 'Server Offline' : 'Connecting...'}
                    </div>
                    <button
                        className="settings-badge"
                        onClick={() => navigate('/')}
                        title="Back to Main Home"
                    >
                        🏠 Home
                    </button>
                    <button
                        className={`settings-badge ${hasApiKey ? 'configured' : ''}`}
                        onClick={() => navigate('/job-analyzer/settings')}
                    >
                        ⚙️ Settings {hasApiKey && <span className="check">✓</span>}
                    </button>
                </div>
            </header>

            <main className="home-content">
                {!hasApiKey && (
                    <div className="setup-prompt">
                        <span>⚠️</span>
                        <p>Configure your Gemini API key to get started</p>
                        <button onClick={() => navigate('/job-analyzer/settings')}>Configure API Key</button>
                    </div>
                )}

                <div className="scanner-options">
                    {/* Employment Agreement Card */}
                    <div className="scanner-card agreement" onClick={() => navigate('/job-analyzer/agreement')}>
                        <div className="card-icon">📋</div>
                        <h2>Employment Agreement Scanner</h2>
                        <p>Analyze job offers and contracts for scams, risky clauses, and red flags</p>
                        <ul className="features">
                            <li>🚨 Scam Detection</li>
                            <li>⚠️ Risky Clause Analysis</li>
                            <li>📊 Risk Scoring (0-100)</li>
                            <li>💡 Recommendations</li>
                        </ul>
                        <div className="card-action">
                            <span>Start Analysis</span>
                            <span className="arrow">→</span>
                        </div>
                    </div>

                    {/* Resume Analyzer Card */}
                    <div className="scanner-card resume" onClick={() => navigate('/job-analyzer/resume')}>
                        <div className="card-icon">📄</div>
                        <h2>Resume Analyzer</h2>
                        <p>Optimize your resume for ATS systems with AI-powered suggestions</p>
                        <ul className="features">
                            <li>💪 Action Verb Analysis</li>
                            <li>📈 Quantification Check</li>
                            <li>✏️ Spelling & Grammar</li>
                            <li>🏆 ATS Score (TOP 1%)</li>
                        </ul>
                        <div className="card-action">
                            <span>Analyze Resume</span>
                            <span className="arrow">→</span>
                        </div>
                    </div>
                </div>

                <div className="footer-links">
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                        Get Gemini API Key
                    </a>
                    <span>•</span>
                    <span>Powered by Google Gemini AI</span>
                </div>
            </main>
        </div>
    );
}

export default AnalyzerHome;
