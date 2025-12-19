
import React, { useState, useEffect } from 'react';
import { mockFirebase } from './services/mockFirebase';
import { DocumentMetadata, UserProfile, AnalysisResult, RiskLevel, SupportedLanguage, AppPage } from './types';
import Layout from './components/Layout';
import AnalysisView from './components/AnalysisView';
import ChatInterface from './components/ChatInterface';
import { geminiService } from './services/geminiService';
import { Shield, Upload, FileText, Clock, AlertCircle, ChevronRight, CheckCircle2, Search, Plus, Languages, MessageSquare, Loader2, PlayCircle, Sparkles, Gavel, Scale, Library } from 'lucide-react';
import { SAMPLE_CONTRACT } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(mockFirebase.auth.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadata | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    if (user) {
      setLanguage(user.preferences?.language || 'en');
      const docs = mockFirebase.firestore.getDocuments(user.uid);
      setDocuments(docs);
      if (currentPage === 'landing') setCurrentPage('dashboard');
    }
  }, [user]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (user) {
      const updatedUser = mockFirebase.auth.updatePreferences(user.uid, { language: lang });
      setUser(updatedUser);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail) {
      const loggedInUser = mockFirebase.auth.login(loginEmail);
      setUser(loggedInUser);
      setLanguage(loggedInUser.preferences.language);
      setCurrentPage('dashboard');
    }
  };

  const handleGoogleLogin = () => {
    const loggedInUser = mockFirebase.auth.loginWithGoogle();
    setUser(loggedInUser);
    setLanguage(loggedInUser.preferences.language);
    setCurrentPage('dashboard');
  };

  const handleDemoMode = async () => {
    setIsUploading(true);
    setError(null);
    setCurrentPage('dashboard');

    const demoDoc: DocumentMetadata = {
      id: "demo_" + Date.now(),
      userId: user?.uid || "demo_user",
      fileName: "Sample Service Contract.txt",
      uploadedAt: Date.now(),
      status: 'pending'
    };

    if (user) {
        mockFirebase.firestore.saveDocument(demoDoc);
        setDocuments(prev => [demoDoc, ...prev]);
    } else {
        setDocuments([demoDoc]);
    }

    try {
      const analysis = await geminiService.analyzeContract(SAMPLE_CONTRACT, language);
      const updatedDoc = { ...demoDoc, status: 'completed' as const, analysis };
      
      if (user) {
        mockFirebase.firestore.updateDocument(demoDoc.id, { status: 'completed', analysis });
        setDocuments(prev => prev.map(d => d.id === demoDoc.id ? updatedDoc : d));
      } else {
        setDocuments([updatedDoc]);
      }
      
      setSelectedDoc(updatedDoc);
      setCurrentPage('analysis');
    } catch (err) {
      setError("Demo analysis failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    mockFirebase.auth.logout();
    setUser(null);
    setCurrentPage('landing');
    setDocuments([]);
    setLanguage('en'); 
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError(`❌ Unsupported format: .${fileExtension}. Please upload a PDF, DOCX, or TXT file.`);
      e.target.value = ''; 
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("❌ File is too large. Maximum size allowed is 2MB.");
      e.target.value = ''; 
      return;
    }

    setIsUploading(true);
    setError(null);

    const newDoc: DocumentMetadata = {
      id: "doc_" + Date.now(),
      userId: user.uid,
      fileName: file.name,
      uploadedAt: Date.now(),
      status: 'pending'
    };

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || "");
        reader.onerror = reject;
        
        if (fileExtension === 'txt') {
          reader.readAsText(file);
        } else {
          setTimeout(() => resolve("Simulated extracted contract text for " + file.name + " with sample clauses including liability, termination, and payment terms..."), 1000);
        }
      });

      if (!text.trim()) throw new Error("File appears to be empty or unreadable.");

      mockFirebase.firestore.saveDocument(newDoc);
      setDocuments(prev => [newDoc, ...prev]);

      const analysis = await geminiService.analyzeContract(text, language);
      
      mockFirebase.firestore.updateDocument(newDoc.id, { status: 'completed', analysis });
      setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'completed', analysis } : d));
      
      setSelectedDoc({ ...newDoc, status: 'completed', analysis });
      setCurrentPage('analysis');

    } catch (err: any) {
      setError(err.message || "Failed to analyze document. Please check the file content.");
      mockFirebase.firestore.updateDocument(newDoc.id, { status: 'failed' });
    } finally {
      setIsUploading(false);
      e.target.value = ''; 
    }
  };

  const openDoc = (doc: DocumentMetadata) => {
    setSelectedDoc(doc);
    setCurrentPage('analysis');
  };

  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        <Layout 
          user={user} 
          onLogout={handleLogout} 
          onNavigate={setCurrentPage}
          selectedLanguage={language}
          onLanguageChange={handleLanguageChange}
        >
          <div className="py-12 md:py-24 max-w-5xl mx-auto text-center px-4">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-amber-200 shadow-sm">
              <Gavel className="w-3.5 h-3.5" />
              Official Compliance Tribunal
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
              DEFEND YOUR <br/>
              <span className="text-amber-700 italic">BUSINESS.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Contracts hold the power of law. We use AI to level the judicial playing field—deciphering risks in moments.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button 
                onClick={() => setCurrentPage('login')}
                className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-amber-700 transition-all shadow-xl shadow-slate-300"
              >
                Appoint Counsel
              </button>
              <button 
                onClick={handleDemoMode}
                disabled={isUploading}
                className="bg-white border-2 border-amber-200 text-amber-900 px-10 py-5 rounded-2xl font-black text-xl hover:border-amber-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Library className="w-6 h-6" />}
                Enter Law Library
              </button>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  if (currentPage === 'login') {
    return (
      <Layout 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={setCurrentPage}
        selectedLanguage={language}
        onLanguageChange={handleLanguageChange}
      >
        <div className="flex items-center justify-center py-12 px-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-amber-100 p-10">
            <div className="text-center mb-10">
              <div className="bg-amber-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Gavel className="text-amber-100 w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Access Chambers</h2>
              <p className="text-slate-500 font-medium mt-2">Sign in to manage your petitions</p>
            </div>
            
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-amber-600 text-slate-700 font-bold py-4 rounded-xl transition-all mb-6 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Bar ID (Google)
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest italic">Judicial Portal</span></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Electronic Mail</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-amber-600 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  placeholder="lawyer@firm.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <button className="w-full bg-slate-900 hover:bg-amber-800 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-sm">
                Authenticate Credentials
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      onNavigate={setCurrentPage}
      selectedLanguage={language}
      onLanguageChange={handleLanguageChange}
    >
      {currentPage === 'dashboard' ? (
        <div className="animate-in fade-in duration-500">
          <SectionHeader 
            title="The Petition List" 
            subtitle={`Analyzed through the lens of ${language === 'en' ? 'British Common Law' : 'Hindi Statutes'}`}
            action={
              <label className={`relative group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3 bg-amber-700 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-amber-900/10">
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  SUBMIT NEW FILING
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx,.txt" 
                  onChange={handleFileUpload} 
                />
              </label>
            }
          />

          {error && (
            <div className="bg-red-50 border-2 border-red-100 rounded-[1.5rem] p-6 mb-8 flex gap-5 text-red-700 items-center animate-in slide-in-from-top-4">
              <div className="bg-red-100 p-3 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="font-serif font-black text-lg">Contempt of Document</p>
                <p className="text-sm font-medium opacity-80">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-xs font-black uppercase text-red-400 p-2 hover:bg-red-100 rounded-lg">Dismiss</button>
            </div>
          )}

          {documents.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-amber-100 rounded-[3rem] py-32 text-center shadow-inner">
              <Scale className="text-amber-100 w-24 h-24 mx-auto mb-10" />
              <h3 className="text-4xl font-serif font-black text-slate-900 mb-4 tracking-tight italic">Clear Docket</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                The court is ready for your submission. Upload a PDF, DOCX, or TXT contract to begin the inquiry.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => doc.status === 'completed' && openDoc(doc)}
                  className={`relative bg-white rounded-[2.5rem] border border-slate-100 p-8 transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer group flex flex-col min-h-[260px] ${doc.status === 'pending' ? 'animate-pulse' : ''}`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-slate-50 p-5 rounded-2xl group-hover:bg-amber-50 transition-colors border border-slate-50 group-hover:border-amber-100 shadow-sm">
                      <FileText className="w-8 h-8 text-slate-400 group-hover:text-amber-700" />
                    </div>
                    {doc.status === 'completed' && doc.analysis && (
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                        doc.analysis.riskScore === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {doc.analysis.riskScore} JURISDICTIONAL RISK
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif font-black text-2xl text-slate-900 mb-2 truncate group-hover:text-amber-700">{doc.fileName}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest"><Clock className="w-4 h-4" />Recorded {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    {doc.status === 'pending' ? (
                      <div className="flex items-center gap-2 text-amber-600 text-sm font-black italic">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        In Camera Review...
                      </div>
                    ) : doc.status === 'completed' ? (
                      <div className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.15em] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Verdict Delivered</div>
                    ) : (
                      <div className="text-red-500 text-sm font-black uppercase tracking-tight">Rejected by Court</div>
                    )}
                    <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-amber-700 group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        selectedDoc?.analysis && (
          <div className="animate-in fade-in slide-in-from-left-8 duration-500">
            <button 
              onClick={() => setCurrentPage('dashboard')} 
              className="group mb-8 inline-flex items-center gap-3 text-xs font-black text-slate-400 hover:text-amber-700 transition-all uppercase tracking-widest"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Docket
            </button>
            <AnalysisView analysis={selectedDoc.analysis} fileName={selectedDoc.fileName} />
            <ChatInterface analysis={selectedDoc.analysis} language={language} />
          </div>
        )
      )}
    </Layout>
  );
};

const SectionHeader = ({ title, subtitle, action }: { title: string, subtitle: string, action?: React.ReactNode }) => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
    <div>
      <h1 className="text-5xl font-serif font-black text-slate-900 tracking-tight">{title}</h1>
      <p className="text-slate-500 font-medium text-lg mt-2 italic">{subtitle}</p>
    </div>
    {action}
  </header>
);

export default App;
