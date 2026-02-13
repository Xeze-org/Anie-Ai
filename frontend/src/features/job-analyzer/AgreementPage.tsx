import { useState, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgreementPage.css';
import type { AnalysisResult } from './types';
import { analyzeDocument, fileToBase64, checkServerHealth } from './api';
import { loadSettings } from './storage';
import { getAgreementHistory, saveAgreementAnalysis, deleteAgreementAnalysis, clearAgreementHistory, type AgreementHistoryItem } from './historyDb';

function AgreementPage() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [history, setHistory] = useState<AgreementHistoryItem[]>([]);
  const [viewingHistoryItem, setViewingHistoryItem] = useState<AgreementHistoryItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from localStorage
  useEffect(() => {
    const settings = loadSettings();
    if (settings.useOwnKey && settings.apiKey) {
      setApiKey(settings.apiKey);
      setHasApiKey(true);
    }
  }, []);

  // Check server health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkServerHealth();
      setServerStatus(isHealthy ? 'online' : 'offline');
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const items = await getAgreementHistory();
      setHistory(items);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey || !file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64 = await fileToBase64(file);
      const analysisResult = await analyzeDocument({
        api_key: apiKey,
        document: base64,
        filename: file.name,
      });
      setResult(analysisResult);
      // Save to history
      await saveAgreementAnalysis(file.name, analysisResult);
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskClass = (level: string) => level.toLowerCase();

  const handleViewHistory = (item: AgreementHistoryItem) => {
    setViewingHistoryItem(item);
    setResult(item.result);
    setFile(null);
  };

  const handleDeleteHistory = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteAgreementAnalysis(id);
    await loadHistory();
    if (viewingHistoryItem?.id === id) {
      setViewingHistoryItem(null);
      setResult(null);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear all analysis history?')) {
      await clearAgreementHistory();
      setHistory([]);
      setViewingHistoryItem(null);
      setResult(null);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app">
      <header className="header page-header">
        <button className="back-btn" onClick={() => navigate('/job-analyzer')}>← Back</button>
        <div className="header-title">
          <h1>📋 Employment Agreement Scanner</h1>
          <p>AI-powered analysis to detect scams and risky clauses</p>
        </div>
        <div className="header-actions">
          <div className={`server-status ${serverStatus}`}>
            <span className="status-dot"></span>
            {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : '...'}
          </div>
          <button className="settings-btn" onClick={() => navigate('/job-analyzer/settings')}>
            ⚙️ {hasApiKey && <span className="api-indicator">✓</span>}
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Server Offline Warning */}
        {serverStatus === 'offline' && (
          <div className="warning-banner">
            ⏳ Server is warming up (cold start). Please wait a moment and refresh...
          </div>
        )}

        {/* API Key Status */}
        {!hasApiKey ? (
          <div className="card api-key-prompt">
            <h2>🔑 API Key Required</h2>
            <p>Configure your Gemini API key in settings to start analyzing documents.</p>
            <button className="configure-btn" onClick={() => navigate('/job-analyzer/settings')}>
              ⚙️ Configure API Key
            </button>
          </div>
        ) : (
          <div className="api-configured">
            <span className="check-icon">✓</span> API Key configured
            <button className="edit-settings" onClick={() => navigate('/job-analyzer/settings')}>Edit</button>
          </div>
        )}

        {/* File Upload Section */}
        <div className="card">
          <h2>📄 Upload Agreement</h2>
          <div
            className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">{file ? '✅' : '📁'}</div>
            <h3>{file ? 'File Selected' : 'Drop your agreement here'}</h3>
            <p>or click to browse (TXT, PDF, DOCX)</p>
            {file && (
              <div className="file-name">
                📎 {file.name}
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Analyze Button */}
        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={!apiKey || !file || isLoading || serverStatus === 'offline'}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              Analyzing...
            </>
          ) : (
            <>🔍 Analyze Agreement</>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="results-section">
            {/* Risk Score */}
            <div className="card risk-score-card">
              <h2>📊 Risk Assessment</h2>
              <div className="risk-meter">
                <div className={`risk-circle ${getRiskClass(result.risk_level)}`}>
                  <span className="risk-score-value">{result.risk_score}</span>
                  <span className="risk-score-label">/ 100</span>
                </div>
              </div>
              <div className={`risk-level-badge ${getRiskClass(result.risk_level)}`}>
                {result.risk_level} RISK
              </div>
              {result.summary && (
                <div className="summary">{result.summary}</div>
              )}
            </div>

            {/* AI Insights Section */}
            <div className="card insights-card">
              <h2>🤖 AI Insights</h2>
              <ul className="insights-list">
                <li className={`insight-item ${getRiskClass(result.risk_level)}`}>
                  <strong>Overall Assessment:</strong> This agreement has a {result.risk_level.toLowerCase()} risk score of {result.risk_score}/100
                </li>
                {result.scam_indicators && result.scam_indicators.length > 0 && (
                  <li className="insight-item critical">
                    <strong>⚠️ Warning:</strong> {result.scam_indicators.length} potential scam indicator(s) detected
                  </li>
                )}
                {result.risky_clauses && result.risky_clauses.length > 0 && (
                  <li className="insight-item high">
                    <strong>📋 Clauses:</strong> {result.risky_clauses.length} risky clause(s) need review
                  </li>
                )}
                {result.missing_elements && result.missing_elements.length > 0 && (
                  <li className="insight-item medium">
                    <strong>❓ Missing:</strong> {result.missing_elements.length} expected element(s) not found
                  </li>
                )}
                {result.risk_score <= 25 && (
                  <li className="insight-item low">
                    <strong>✅ Good news:</strong> This agreement appears to be standard with no major concerns
                  </li>
                )}
                {result.risk_score > 75 && (
                  <li className="insight-item critical">
                    <strong>🚫 Action Required:</strong> Consider consulting a legal professional before signing
                  </li>
                )}
              </ul>
            </div>

            {/* Findings Grid */}
            <div className="findings-grid">
              {/* Scam Indicators */}
              {result.scam_indicators && result.scam_indicators.length > 0 && (
                <div className="card findings-card scam">
                  <h2>🚨 Scam Indicators</h2>
                  <div className="findings-list">
                    {result.scam_indicators.map((finding, i) => (
                      <div key={i} className={`finding-item ${getRiskClass(finding.severity)}`}>
                        <div className="finding-header">
                          <span className="finding-category">{finding.category}</span>
                          <span className={`severity-badge ${getRiskClass(finding.severity)}`}>
                            {finding.severity}
                          </span>
                        </div>
                        <p className="finding-description">{finding.description}</p>
                        {finding.quote && (
                          <p className="finding-quote">"{finding.quote}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risky Clauses */}
              {result.risky_clauses && result.risky_clauses.length > 0 && (
                <div className="card findings-card risky">
                  <h2>⚠️ Risky Clauses</h2>
                  <div className="findings-list">
                    {result.risky_clauses.map((finding, i) => (
                      <div key={i} className={`finding-item ${getRiskClass(finding.severity)}`}>
                        <div className="finding-header">
                          <span className="finding-category">{finding.category}</span>
                          <span className={`severity-badge ${getRiskClass(finding.severity)}`}>
                            {finding.severity}
                          </span>
                        </div>
                        <p className="finding-description">{finding.description}</p>
                        {finding.quote && (
                          <p className="finding-quote">"{finding.quote}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Elements */}
              {result.missing_elements && result.missing_elements.length > 0 && (
                <div className="card findings-card missing">
                  <h2>❓ Missing Elements</h2>
                  <ul className="simple-list">
                    {result.missing_elements.map((element, i) => (
                      <li key={i}>{element}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="card findings-card recommendations">
                  <h2>💡 Recommendations</h2>
                  <ul className="simple-list">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
                    <span className={`history-risk ${getRiskClass(item.result.risk_level)}`}>
                      {item.result.risk_level} ({item.result.risk_score})
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

export default AgreementPage;
