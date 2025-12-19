
import { DocumentMetadata, UserProfile, SupportedLanguage } from "../types";

const STORAGE_KEY_DOCS = "docguard_documents";
const STORAGE_KEY_USER = "docguard_user";

export const mockFirebase = {
  auth: {
    getCurrentUser: (): UserProfile | null => {
      const user = localStorage.getItem(STORAGE_KEY_USER);
      if (!user) return null;
      
      const parsed = JSON.parse(user);
      // Robustness check: Ensure preferences exists and has a language
      if (!parsed.preferences) {
        parsed.preferences = { language: 'en' };
      }
      return parsed;
    },
    login: (email: string): UserProfile => {
      const existing = localStorage.getItem(STORAGE_KEY_USER);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.email === email) {
          if (!parsed.preferences || !parsed.preferences.language) {
            parsed.preferences = { language: 'en' };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
      
      const user: UserProfile = { 
        uid: "user_" + Date.now(), 
        email, 
        createdAt: Date.now(),
        preferences: { language: 'en' }
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      return user;
    },
    loginWithGoogle: (): UserProfile => {
      // Simulate Google Login
      const email = "google_user@gmail.com";
      const existing = localStorage.getItem(STORAGE_KEY_USER);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.email === email) return parsed;
      }

      const user: UserProfile = { 
        uid: "google_" + Date.now(), 
        email, 
        createdAt: Date.now(),
        preferences: { language: 'en' }
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      return user;
    },
    updatePreferences: (uid: string, preferences: UserProfile['preferences']): UserProfile => {
      const user = JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || '{}');
      const updated = { ...user, preferences };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      return updated;
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  },
  firestore: {
    getDocuments: (userId: string): DocumentMetadata[] => {
      const docs = localStorage.getItem(STORAGE_KEY_DOCS);
      const parsed: DocumentMetadata[] = docs ? JSON.parse(docs) : [];
      return parsed.filter(d => d.userId === userId);
    },
    saveDocument: (doc: DocumentMetadata) => {
      const docs = localStorage.getItem(STORAGE_KEY_DOCS);
      const parsed: DocumentMetadata[] = docs ? JSON.parse(docs) : [];
      const updated = [doc, ...parsed];
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated));
    },
    updateDocument: (id: string, updates: Partial<DocumentMetadata>) => {
      const docs = localStorage.getItem(STORAGE_KEY_DOCS);
      let parsed: DocumentMetadata[] = docs ? JSON.parse(docs) : [];
      parsed = parsed.map(d => d.id === id ? { ...d, ...updates } : d);
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(parsed));
    }
  }
};
