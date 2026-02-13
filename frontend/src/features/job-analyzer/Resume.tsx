import { useState, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Resume.css';
import type { ResumeAnalysisResult } from './types';
import { analyzeResume, fileToBase64, checkServerHealth } from './api';
import { loadSettings } from './storage';
import { getResumeHistory, saveResumeAnalysis, deleteResumeAnalysis, clearResumeHistory, type ResumeHistoryItem } from './historyDb';

function ResumePage() {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [history, setHistory] = useState<ResumeHistoryItem[]>([]);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<ResumeHistoryItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const settings = loadSettings();
        if (settings.useOwnKey && settings.apiKey) {
            setApiKey(settings.apiKey);
        }
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

    useEffect(() => { loadHistory(); }, []);

    const loadHistory = async () => {
        try {
            const items = await getResumeHistory();
            setHistory(items);
        } catch (err) { console.error('Failed to load history:', err); }
    };

    const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => { setIsDragOver(false); };
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) { setFile(droppedFile); setResult(null); setError(null); }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) { setFile(selectedFile); setResult(null); setError(null); }
    };

    const handleAnalyze = async () => {
        if (!apiKey || !file) return;
        setIsLoading(true); setError(null); setResult(null);

        try {
            const base64 = await fileToBase64(file);
            const analysisResult = await analyzeResume({
                api_key: apiKey, document: base64, filename: file.name,
            });
            setResult(analysisResult);
            await saveResumeAnalysis(file.name, analysisResult);
            await loadHistory();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreClass = (category: string) => {
        if (category.includes('1%')) return 'top1';
        if (category.includes('5%')) return 'top5';
        if (category.includes('14%')) return 'top14';
        if (category.includes('30%')) return 'top30';
        return 'needs-work';
    };

    const getStatusClass = (status: string) => status.toLowerCase().replace('_', '-');

    const handleViewHistory = (item: ResumeHistoryItem) => {
        setViewingHistoryItem(item);
        setResult(item.result);
        setFile(null);
    };

    const handleDeleteHistory = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        await deleteResumeAnalysis(id);
        await loadHistory();
        if (viewingHistoryItem?.id === id) {
            setViewingHistoryItem(null);
            setResult(null);
        }
    };

    const handleClearHistory = async () => {
        if (confirm('Clear all resume analysis history?')) {
            await clearResumeHistory();
            setHistory([]);
            setViewingHistoryItem(null);
            setResult(null);
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getScoreColorClass = (score: number) => {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'needs-work';
        return 'poor';
    };

    return (
        <div className="resume-page">
            <header className="resume-header">
                <button className="back-btn" onClick={() => navigate('/job-analyzer')}>← Back</button>
                <h1>📄 Resume Analyzer</h1>
                <div className={`server-status ${serverStatus}`}>
                    <span className="status-dot"></span>
                    {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : '...'}
                </div>
            </header>

            <main className="resume-content">
                {!apiKey && (
                    <div className="api-prompt">
                        <p>Configure your API key in settings first</p>
                        <button onClick={() => navigate('/job-analyzer/settings')}>⚙️ Settings</button>
                    </div>
                )}

                <div className="card">
                    <h2>📄 Upload Resume</h2>
                    <div
                        className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                        onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                        onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="upload-icon">{file ? '✅' : '📄'}</div>
                        <h3>{file ? file.name : 'Drop your resume here'}</h3>
                        <p>TXT, PDF, or DOCX</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx"
                        onChange={handleFileSelect} style={{ display: 'none' }} />
                </div>

                <button className="analyze-btn" onClick={handleAnalyze}
                    disabled={!apiKey || !file || isLoading || serverStatus === 'offline'}>
                    {isLoading ? (<><div className="loading-spinner"></div>Analyzing...</>) : '🔍 Analyze Resume'}
                </button>

                {error && <div className="error-message">⚠️ {error}</div>}

                {result && (
                    <div className="results-section">
                        {/* Score Card */}
                        <div className={`score-card ${getScoreClass(result.score_category)}`}>
                            <div className="score-circle">
                                <span className="score-value">{result.overall_score}</span>
                                <span className="score-max">/100</span>
                            </div>
                            <div className="score-category">{result.score_category.replace('_', ' ')}</div>
                            <p className="summary">{result.summary}</p>
                        </div>

                        {/* Section Scores */}
                        <div className="section-scores">
                            {[
                                { name: 'Action Verbs', data: result.action_verb_score, icon: '💪' },
                                { name: 'Quantification', data: result.quantification_score, icon: '📊' },
                                { name: 'Spelling & Grammar', data: result.spelling_grammar, icon: '✏️' },
                                { name: 'Section Structure', data: result.section_structure, icon: '📋' },
                                { name: 'Word Variety', data: result.word_variety, icon: '🔤' },
                            ].map(({ name, data, icon }) => (
                                <div key={name} className={`section-card ${getStatusClass(data.status)}`}>
                                    <div className="section-header">
                                        <span>{icon} {name}</span>
                                        <span className="section-score">{data.score}/100</span>
                                    </div>
                                    <div className={`status-badge ${getStatusClass(data.status)}`}>{data.status.replace('_', ' ')}</div>
                                    <p className="feedback">{data.feedback}</p>
                                    {data.issues.length > 0 && (
                                        <ul className="issues">{data.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Suggestions */}
                        {result.suggestions && result.suggestions.length > 0 && (
                            <div className="card suggestions-card">
                                <h2>💡 Suggestions</h2>
                                {result.suggestions.map((sug, i) => (
                                    <div key={i} className={`suggestion ${sug.priority.toLowerCase()}`}>
                                        <span className="priority">{sug.priority}</span>
                                        <div className="suggestion-content">
                                            <strong>{sug.category}</strong>
                                            {sug.current && <p className="current">Current: "{sug.current}"</p>}
                                            <p className="suggested">→ {sug.suggested}</p>
                                            <p className="explanation">{sug.explanation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Checklist */}
                        {result.checklist && result.checklist.length > 0 && (
                            <div className="card checklist-card">
                                <h2>✅ Quick Checklist</h2>
                                <ul className="checklist">
                                    {result.checklist.map((item, i) => (
                                        <li key={i} className={item.status ? 'pass' : 'fail'}>
                                            <span className="check-icon">{item.status ? '✓' : '✗'}</span>
                                            <span>{item.item}</span>
                                            {item.note && <span className="note">{item.note}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* History Section */}
                {history.length > 0 && (
                    <div className="history-section">
                        <div className="history-header">
                            <h2>📜 Previous Analyses</h2>
                            <button className="clear-history-btn" onClick={handleClearHistory}>
                                🗑️ Clear All
                            </button>
                        </div>
                        <div className="history-list">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className={`history-card ${viewingHistoryItem?.id === item.id ? 'active' : ''}`}
                                    onClick={() => handleViewHistory(item)}
                                >
                                    <div className="history-card-main">
                                        <span className="history-filename">📄 {item.filename}</span>
                                        <span className={`history-score ${getScoreColorClass(item.result.overall_score)}`}>
                                            {item.result.score_category.replace('_', ' ')} ({item.result.overall_score})
                                        </span>
                                    </div>
                                    <div className="history-card-meta">
                                        <span className="history-date">{formatDate(item.analyzedAt)}</span>
                                        <button
                                            className="history-delete-btn"
                                            onClick={(e) => handleDeleteHistory(item.id, e)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ResumePage;
