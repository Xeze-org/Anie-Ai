export interface Finding {
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    quote: string;
}

export interface AnalysisResult {
    risk_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    summary: string;
    scam_indicators: Finding[];
    risky_clauses: Finding[];
    missing_elements: string[];
    recommendations: string[];
}

export interface AnalyzeRequest {
    api_key: string;
    document: string;
    filename: string;
}

export interface ApiError {
    error: string;
    details?: string;
}

// Resume Analysis Types
export interface ResumeAnalyzeRequest {
    api_key: string;
    document: string;
    filename: string;
}

export interface ScoreSection {
    score: number;
    status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
    feedback: string;
    issues: string[];
    suggestions: string[];
}

export interface ResumeSuggestion {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    current: string;
    suggested: string;
    explanation: string;
}

export interface ChecklistItem {
    item: string;
    status: boolean;
    note: string;
}

export interface ResumeAnalysisResult {
    overall_score: number;
    score_category: string;
    summary: string;
    action_verb_score: ScoreSection;
    quantification_score: ScoreSection;
    spelling_grammar: ScoreSection;
    section_structure: ScoreSection;
    word_variety: ScoreSection;
    suggestions: ResumeSuggestion[];
    checklist: ChecklistItem[];
}
