
import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = "" }) => {
  const configs = {
    [RiskLevel.HIGH]: {
      style: "bg-red-50 text-red-700 border-red-200 shadow-sm",
      icon: <ShieldX className="w-3.5 h-3.5" />
    },
    [RiskLevel.MEDIUM]: {
      style: "bg-orange-50 text-orange-700 border-orange-200 shadow-sm",
      icon: <ShieldAlert className="w-3.5 h-3.5" />
    },
    [RiskLevel.LOW]: {
      style: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
      icon: <ShieldCheck className="w-3.5 h-3.5" />
    },
  };

  const config = configs[level] || configs[RiskLevel.LOW];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.style} ${className}`}>
      {config.icon}
      {level.toUpperCase()} RISK
    </span>
  );
};

export default RiskBadge;
