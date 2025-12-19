
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Info, Sparkles, Loader2, User, HelpCircle, Handshake, ShieldCheck } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { AnalysisResult, SupportedLanguage } from '../types';

interface ChatInterfaceProps {
  analysis: AnalysisResult;
  language: SupportedLanguage;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ analysis, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = language === 'hi' 
        ? "नमस्ते! मैंने आपके कॉन्ट्रैक्ट को स्कैन कर लिया है। आप कुछ भी पूछ सकते हैं, जैसे: 'अगर मैं पेमेंट मिस कर दूँ तो क्या होगा?'"
        : "Hello! I've fully scanned your contract. Feel free to ask scenarios like 'What if I miss a payment?' or ask for negotiation tips.";
      setMessages([{ role: 'model', text: welcome }]);
    }
  }, [isOpen, language, messages.length]);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = geminiService.createChat(analysis, language);
    }
  }, [isOpen, analysis, language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);

    try {
      if (!chatRef.current) {
        chatRef.current = geminiService.createChat(analysis, language);
      }
      const response = await chatRef.current.sendMessage({ message: textToSend });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Technical error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const scenarios = [
    { label: language === 'hi' ? "पेमेंट मिस हुआ तो?" : "What if I miss a payment?", text: "What happens if I miss a payment according to this contract?" },
    { label: language === 'hi' ? "जल्दी छोड़ना है?" : "Early termination?", text: "What are the penalties if I want to terminate the contract early?" },
    { label: language === 'hi' ? "नेगोशिएशन टिप्स" : "Negotiation Tips", text: "Which clauses in this contract should I try to negotiate and what should I suggest instead?" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 p-5 rounded-[2rem] shadow-2xl transition-all duration-300 hover:scale-110 z-40 group ${isOpen ? 'bg-slate-900' : 'bg-blue-600'}`}
      >
        {isOpen ? <X className="text-white w-8 h-8" /> : <MessageSquare className="text-white w-8 h-8" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-4 md:right-8 w-[calc(100vw-2rem)] md:w-[450px] h-[650px] max-h-[80vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-12">
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl"><Sparkles className="w-5 h-5" /></div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">DocGuard AI</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Smart Compliance Mode</span>
              </div>
            </div>
            <button onClick={() => setMessages([])} title="Reset Chat" className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col gap-1 max-w-[90%]">
                    <div className={`p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                        m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                        {m.text}
                    </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Scenario Shortcuts */}
          {messages.length < 5 && !loading && (
            <div className="px-6 py-4 bg-white border-t border-slate-50 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
                {scenarios.map((sc, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(sc.text)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200"
                  >
                    {i === 2 ? <Handshake className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                    {sc.label}
                  </button>
                ))}
            </div>
          )}

          <div className="p-4 bg-white border-t border-slate-100">
             <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'hi' ? "सवालों के लिए यहाँ लिखें..." : "Ask a scenario or tip..."}
                className="w-full pl-5 pr-14 py-4 bg-slate-100 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl disabled:bg-slate-200 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-tight justify-center italic">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              Not legal advice • Decision support only
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInterface;
