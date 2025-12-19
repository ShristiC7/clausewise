
export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export type SupportedLanguage = 'en' | 'hi';

/* Added AppPage type to fix navigation type mismatches between App and Layout components */
export type AppPage = 'landing' | 'login' | 'dashboard' | 'analysis';

export interface ContractClause {
  text: string;
  riskLevel: RiskLevel;
  explanation: string;
  negotiationSuggestion?: string;
}

export interface AnalysisResult {
  riskScore: RiskLevel;
  summary: string;
  plainEnglishExplanation: string;
  clauses: ContractClause[];
  obligations: string[];
  penalties: string[];
  negotiablePoints: string[];
}

export interface DocumentMetadata {
  id: string;
  userId: string;
  fileName: string;
  fileUrl?: string;
  uploadedAt: number;
  status: 'pending' | 'completed' | 'failed';
  analysis?: AnalysisResult;
  language?: SupportedLanguage;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  createdAt: number;
  preferences: {
    language: SupportedLanguage;
  };
}
