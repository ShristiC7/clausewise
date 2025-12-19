
import React, { useState } from 'react';
import { 
  Shield, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Menu, 
  X, 
  Globe, 
  Scale, 
  Gavel, 
  BookOpen, 
  FileCheck, 
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { APP_NAME } from '../constants';
import { SupportedLanguage, AppPage } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  onNavigate: (page: AppPage) => void;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, selectedLanguage, onLanguageChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Courtroom Dashboard', icon: LayoutDashboard, page: 'dashboard' as AppPage },
    { label: 'Statutes & Library', icon: BookOpen, page: 'landing' as AppPage },
    { label: 'Active Petitions', icon: FileCheck, page: 'dashboard' as AppPage },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      {/* Top Fixed Header */}
      <header className="h-16 bg-white border-b border-amber-200/30 sticky top-0 z-[60] flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="bg-amber-700 p-2 rounded-lg shadow-inner group-hover:bg-amber-800 transition-colors">
              <Scale className="text-amber-100 w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {APP_NAME}
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Decision Support</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Global Language Toggle */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
            <Globe size={14} className="text-slate-400" />
            <select 
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer text-slate-700"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (HI)</option>
            </select>
          </div>

          {user && (
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black uppercase text-slate-400 leading-none">Counsel</p>
                <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-amber-600/20 flex items-center justify-center text-amber-700">
                <UserCircle size={28} strokeWidth={1.5} />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Sidebar */}
        <aside 
          className={`
            fixed inset-y-0 left-0 z-50 w-72 transform bg-slate-900 sidebar-gradient text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Branding - Mobile only */}
            <div className="p-6 border-b border-slate-800 lg:hidden flex items-center justify-between">
              <span className="font-serif text-xl font-bold">The Bench</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-8 space-y-2">
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Jurisdiction</p>
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { onNavigate(item.page); setIsSidebarOpen(false); }}
                  className="w-full group flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all text-slate-300 hover:text-amber-400"
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </nav>

            {/* Sidebar Footer */}
            {user && (
              <div className="p-4 border-t border-slate-800">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all font-bold text-sm group"
                >
                  <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                  Dismiss Court
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
            {children}
          </div>
          
          <footer className="mt-auto py-12 border-t border-amber-200/20 px-8 text-center md:text-left">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2 text-amber-800">
                  <Gavel size={16} />
                  <span className="font-serif font-black uppercase text-xs tracking-widest">{APP_NAME} TRIBUNAL</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                  Artificial Intelligence for Small Business Advocacy
                </p>
              </div>
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                <p>© {new Date().getFullYear()} Tribunal Decisions Engine. Purely Informative.</p>
                <p className="mt-1">Environment: {selectedLanguage === 'en' ? 'British Common Law Lexicon' : 'Devanagari Vernacular Lexicon'}</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
