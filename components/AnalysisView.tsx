
import React, { useState } from 'react';
import { AnalysisResult, RiskLevel } from '../types';
import RiskBadge from './RiskBadge';
import { FileText, AlertTriangle, CheckCircle, Info, Scale, ChevronDown, FileWarning, HelpCircle, ShieldX, Handshake, ExternalLink, Phone, Mail, MapPin } from 'lucide-react';
import { LEGAL_DISCLAIMER } from '../constants';

interface AnalysisViewProps {
  analysis: AnalysisResult;
  fileName: string;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, fileName }) => {
  const [expandedClause, setExpandedClause] = useState<number | null>(0);
  const [showLawyers, setShowLawyers] = useState(false);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return "text-red-600 bg-red-50 border-red-100";
      case RiskLevel.MEDIUM: return "text-orange-600 bg-orange-50 border-orange-100";
      case RiskLevel.LOW: return "text-emerald-600 bg-emerald-50 border-emerald-100";
    }
  };

  const lawyers = [
    { name: "Sarah Jenkins", firm: "Jenkins & Associates", specialty: "Contract Law", phone: "555-0123", email: "s.jenkins@legalfirm.com", loc: "San Francisco, CA" },
    { name: "Robert Chen", firm: "Pacific Legal Group", specialty: "Business Compliance", phone: "555-0144", email: "r.chen@pacificlegal.com", loc: "New York, NY" },
    { name: "Aarav Sharma", firm: "Sharma Corporate Law", specialty: "SME Legal Advice", phone: "555-0199", email: "aarav@sharmalaw.in", loc: "Mumbai, MH" }
  ];

  return (
    <div className="space-y-10 px-4 md:px-0 pb-20">
      {/* Hero Summary Section */}
      <section className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none mb-1">{fileName}</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Compliance Audit Report</p>
                </div>
              </div>
              <p className="text-xl text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-6">
                {analysis.summary}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2rem] border border-slate-100 min-w-[200px] text-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Risk Health</span>
              <RiskBadge level={analysis.riskScore} className="text-xl py-2 px-6 shadow-md" />
              
              {analysis.riskScore === RiskLevel.HIGH && (
                <button 
                  onClick={() => setShowLawyers(!showLawyers)}
                  className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                  <Scale className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Consult a Lawyer
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="px-8 py-5 bg-blue-50 border-t border-blue-100 flex items-center gap-4">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-800 font-black uppercase tracking-tight leading-none">{LEGAL_DISCLAIMER}</p>
        </div>
      </section>

      {/* Lawyer Contact List (Visible if risk high or explicitly clicked) */}
      {(showLawyers || analysis.riskScore === RiskLevel.HIGH) && (
        <section className="animate-in slide-in-from-top-10 duration-500 bg-white rounded-[2rem] border border-red-100 p-8 shadow-xl shadow-red-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Scale className="w-6 h-6 text-red-600" />
                Trusted Legal Partners
              </h3>
              <p className="text-slate-500 font-medium mt-1 italic text-sm">Specialized in SMB contract risk and mitigation.</p>
            </div>
            <div className="bg-red-50 px-4 py-2 rounded-xl text-red-600 font-black text-xs uppercase tracking-widest border border-red-100">
              Decision Support Priority
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lawyers.map((lawyer, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-600 transition-all hover:bg-white hover:shadow-xl group">
                <h4 className="font-black text-lg text-slate-900 mb-1 group-hover:text-blue-600">{lawyer.name}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{lawyer.firm}</p>
                <div className="space-y-2 text-sm text-slate-600 font-medium">
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {lawyer.phone}</div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {lawyer.email}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {lawyer.loc}</div>
                </div>
                <button className="mt-6 w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">
                  Contact Now <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          
          {/* Main Content Breakdown */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 md:p-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <ShieldX className="w-6 h-6 text-blue-600" />
                Impact Assessment
              </h3>
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                {analysis.plainEnglishExplanation}
              </p>
            </div>
          </div>

          {/* Negotiable Points */}
          {analysis.negotiablePoints.length > 0 && (
            <div className="bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-600 text-white p-2 rounded-xl">
                  <Handshake className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-emerald-900 tracking-tight">Negotiation Suggestions</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.negotiablePoints.map((point, i) => (
                  <li key={i} className="bg-white p-4 rounded-2xl border border-emerald-200 text-sm font-bold text-emerald-800 flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clauses Accordion */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <Scale className="w-6 h-6 text-slate-900" />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Flagged Clauses</h3>
            </div>
            <div className="grid gap-4">
              {analysis.clauses.map((clause, idx) => (
                <div 
                  key={idx} 
                  className={`group bg-white rounded-[1.5rem] border-2 transition-all duration-300 ${expandedClause === idx ? 'border-blue-600 shadow-xl shadow-blue-100/50' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
                >
                  <div 
                    className="p-6 cursor-pointer flex justify-between items-center"
                    onClick={() => setExpandedClause(expandedClause === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-5 overflow-hidden">
                       <div className={`p-3 rounded-2xl shrink-0 ${getRiskColor(clause.riskLevel)}`}>
                          <FileWarning className="w-6 h-6" />
                       </div>
                       <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 truncate italic">"{clause.text}"</p>
                          <RiskBadge level={clause.riskLevel} className="mt-1" />
                       </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedClause === idx ? 'rotate-180 text-blue-600' : 'text-slate-300'}`} />
                  </div>
                  {expandedClause === idx && (
                    <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300 space-y-4">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-xs font-black uppercase text-blue-600 tracking-widest mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" /> Why this is a risk
                        </p>
                        <p className="text-slate-700 font-medium leading-relaxed">{clause.explanation}</p>
                      </div>
                      {clause.negotiationSuggestion && (
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                           <p className="text-xs font-black uppercase text-emerald-600 tracking-widest mb-2 flex items-center gap-2">
                            <Handshake className="w-4 h-4" /> How to negotiate
                          </p>
                          <p className="text-emerald-800 font-medium leading-relaxed">{clause.negotiationSuggestion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Execution & Breaches</h4>
            <div className="space-y-8">
              <div>
                <h5 className="font-black text-sm uppercase tracking-wider text-blue-400 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Obligations
                </h5>
                <ul className="space-y-3">
                  {analysis.obligations.map((item, i) => (
                    <li key={i} className="text-sm font-semibold text-slate-300 border-l-2 border-slate-800 pl-4">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-8 border-t border-slate-800">
                <h5 className="font-black text-sm uppercase tracking-wider text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Penalties
                </h5>
                <ul className="space-y-3">
                  {analysis.penalties.map((item, i) => (
                    <li key={i} className="text-sm font-semibold text-slate-300 border-l-2 border-slate-800 pl-4">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Side Banner CTA */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2rem] p-8 text-white shadow-xl">
             <h4 className="text-xl font-black mb-2 tracking-tight">Need deep legal help?</h4>
             <p className="text-blue-100 text-sm font-medium mb-6">Our partners offer discounted rates for SMBs using DocGuard AI.</p>
             <button 
                onClick={() => setShowLawyers(true)}
                className="w-full bg-white text-blue-700 font-black py-4 rounded-xl hover:bg-blue-50 transition-all uppercase tracking-widest text-xs"
             >
               View Member Directory
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
