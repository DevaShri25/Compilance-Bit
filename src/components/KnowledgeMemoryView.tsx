import React, { useState } from 'react';
import { KnowledgeMemoryCase, Tender, Bidder, UserProfile } from '../types';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  Scale, 
  UserCheck, 
  Calendar, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface KnowledgeMemoryViewProps {
  knowledgeCases: KnowledgeMemoryCase[];
  selectedTender: Tender;
  selectedBidder: Bidder;
  currentUser: UserProfile;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const KnowledgeMemoryView: React.FC<KnowledgeMemoryViewProps> = ({
  knowledgeCases,
  selectedTender,
  selectedBidder,
  currentUser,
  onNavigate,
  onLogAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('km-1024');

  const filteredCases = knowledgeCases.filter((c) =>
    c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.evidencePattern.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 3 • Precedent Intelligence
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Officer-Approved Precedent Bank
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Procurement Knowledge Memory
          </h2>
          <p className="text-xs text-[#736355]">
            Reference repository of historical procurement rulings and statutory GFR interpretations approved by senior officers
          </p>
        </div>

        <div className="text-xs text-[#7A6B5D] italic">
          * Strictly supporting reference — never automated adjudication.
        </div>
      </div>

      {/* "Similar Previous Case Found" Recommended Reference Banner (As specified in prompt) */}
      <div className="glass-panel rounded-2xl p-5 border-2 border-[#8C5832]/30 bg-[#FFFDF9] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8C5832]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C6B52]">
              Similar Previous Case Found for Current Evaluation
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF5EE] text-[#553E2B] border border-[#E2D8C8]">
            Reference: Previous Tender Case #1024
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-1">
            <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
              How it may help:
            </div>
            <div className="font-semibold text-[#2D231C] text-xs">
              Similar eligibility requirement and evidence pattern.
            </div>
            <p className="text-[11px] text-[#554233] leading-relaxed mt-1">
              Apex InfraTech Solutions has an entity abbreviation variance ("Pvt Ltd" on GST vs "Private Limited" on MCA). Case #1024 established precedence that universal statutory abbreviations with matching PAN & CIN are deemed responsive under GFR Rule 173(iv).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#DFD3C2] flex flex-col justify-between space-y-2">
            <div>
              <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                Officer-Approved Interpretation:
              </div>
              <div className="text-xs text-[#3D2C1F] italic leading-relaxed mt-1">
                "When alphanumeric PAN and RoC registration numbers match 100%, abbreviation variance between 'Pvt Ltd' and 'Private Limited' shall not constitute grounds for rejection."
              </div>
            </div>

            <div className="pt-2 border-t border-[#EADBCA] flex items-center justify-between text-[11px] text-[#7A6B5D]">
              <span>Rulings Officer: <strong>Dr. Rajeshwar Rao, IAS</strong></span>
              <span className="font-mono">14-Nov-2025</span>
            </div>
          </div>
        </div>

        {/* Regulatory disclaimer */}
        <div className="text-[11px] text-[#7A6B5D] bg-[#FAF8F5] p-2 rounded-lg border border-[#EDE5DA]">
          <strong>Statutory Principle:</strong> The procurement system provides previous cases solely as supporting references. The current evaluation committee remains independently responsible for the final award decision.
        </div>
      </div>

      {/* Search Precedent Bank */}
      <div className="glass-card rounded-2xl p-4 border border-[#E8E0D4] bg-white/90 shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8A7969] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search precedent database by case number (#1024), requirement, or legal issue..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
          />
        </div>
      </div>

      {/* Precedent Cases List (As specified in prompt: Case, Tender Type, Requirement, Evidence Pattern, Officer-Approved Interpretation, Date) */}
      <div className="space-y-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="glass-card rounded-2xl p-5 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EAE0] gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#FAF5EE] text-[#8C5832] border border-[#E2D8C8]">
                  {c.caseNumber}
                </span>
                <h3 className="text-xs font-semibold text-[#2D231C]">
                  {c.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#7A6B5D]">
                <span>Tender Type: <strong>{c.tenderType}</strong></span>
                <span>•</span>
                <span className="font-mono">{c.date}</span>
              </div>
            </div>

            {/* Grid of Case Particulars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Requirement */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                  Requirement
                </div>
                <div className="text-xs text-[#2D231C] font-medium leading-snug">
                  {c.requirement}
                </div>
                <div className="text-[10px] font-mono text-[#8C7A6A] pt-1">
                  {c.gfrRule}
                </div>
              </div>

              {/* Evidence Pattern */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                  Evidence Pattern
                </div>
                <div className="text-xs text-[#4E3D2F] leading-snug">
                  {c.evidencePattern}
                </div>
              </div>

              {/* Officer-Approved Interpretation */}
              <div className="p-3 rounded-xl bg-[#FAF5EE] border border-[#EADBCA] space-y-1">
                <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                  Officer-Approved Interpretation
                </div>
                <div className="text-xs text-[#2D231C] italic leading-snug">
                  "{c.approvedInterpretation}"
                </div>
                <div className="text-[10px] text-[#7A6B5D] pt-1">
                  Approved by: <strong>{c.officerName}</strong> ({c.officerRole})
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
