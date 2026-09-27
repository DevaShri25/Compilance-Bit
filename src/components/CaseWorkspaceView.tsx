import React, { useState } from 'react';
import { 
  Tender, 
  Bidder, 
  BidEvaluation, 
  UserProfile, 
  AuditLogItem, 
  ClauseEvidenceTrace,
  ReviewQueueItem
} from '../types';
import { 
  FolderKanban, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  Printer, 
  History, 
  FileCheck, 
  Coins, 
  Building2, 
  ArrowRight,
  Layers,
  Sparkles,
  GitBranch,
  Lock
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface CaseWorkspaceViewProps {
  tenders: Tender[];
  bidders: Bidder[];
  selectedTender: Tender;
  selectedBidder: Bidder;
  evaluations: Record<string, BidEvaluation>;
  clauseTraces: ClauseEvidenceTrace[];
  reviewItems: ReviewQueueItem[];
  auditLogs: AuditLogItem[];
  currentUser: UserProfile;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
  onSaveEvaluation: (evaluation: BidEvaluation) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const CaseWorkspaceView: React.FC<CaseWorkspaceViewProps> = ({
  tenders,
  bidders,
  selectedTender,
  selectedBidder,
  evaluations,
  clauseTraces,
  reviewItems,
  auditLogs,
  currentUser,
  onSelectTender,
  onSelectBidder,
  onSaveEvaluation,
  onNavigate,
  onLogAudit,
}) => {
  const evalKey = `${selectedTender.id}_${selectedBidder.id}`;
  const currentEvaluation = evaluations[evalKey];

  // Accordion state for the 9 ordered stages:
  // Tender -> Bidder -> Requirements -> Evidence -> Compliance -> Review -> Officer Decision -> Report -> Audit
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    tender: true,
    bidder: true,
    requirements: false,
    evidence: false,
    compliance: true,
    review: true,
    decision: true,
    report: false,
    audit: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setOpenSections({
      tender: true,
      bidder: true,
      requirements: true,
      evidence: true,
      compliance: true,
      review: true,
      decision: true,
      report: true,
      audit: true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      tender: false,
      bidder: false,
      requirements: false,
      evidence: false,
      compliance: false,
      review: false,
      decision: false,
      report: false,
      audit: false,
    });
  };

  const isEligible = currentEvaluation?.evaluationStatus === 'Eligible for Financial Bid';
  const isDisqualified = currentEvaluation?.evaluationStatus === 'Technically Disqualified';

  const relevantAuditLogs = auditLogs.filter(
    (l) => l.details.includes(selectedTender.tenderId) || l.details.includes(selectedBidder.name)
  );

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 3 • Unified Case Ingestion & Sign-Off
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Master Docket Architecture
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Unified Case Workspace
          </h2>
          <p className="text-xs text-[#736355]">
            Linear decision stream encompassing RFP parameters, vendor filings, OCR extractions, committee sign-off, and permanent audit
          </p>
        </div>

        {/* Dual Selectors & Expand Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-[#DDD3C4] rounded-lg px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] text-[#7A6B5D] font-medium">Tender:</span>
            <select
              value={selectedTender.id}
              onChange={(e) => {
                const t = tenders.find((item) => item.id === e.target.value);
                if (t) onSelectTender(t);
              }}
              className="text-xs font-semibold text-[#2D231C] outline-none bg-transparent max-w-[190px] truncate"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenderId}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-[#DDD3C4] rounded-lg px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] text-[#7A6B5D] font-medium">Bidder:</span>
            <select
              value={selectedBidder.id}
              onChange={(e) => {
                const b = bidders.find((item) => item.id === e.target.value);
                if (b) onSelectBidder(b);
              }}
              className="text-xs font-semibold text-[#2D231C] outline-none bg-transparent max-w-[190px] truncate"
            >
              {bidders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-[11px] font-medium text-[#4A3423] hover:bg-[#FAF6F0] cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-[11px] font-medium text-[#4A3423] hover:bg-[#FAF6F0] cursor-pointer"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* The 9-Stage Linear Sequence (As requested in prompt: Tender -> Bidder -> Requirements -> Evidence -> Compliance -> Review -> Officer Decision -> Report -> Audit) */}
      <div className="space-y-3.5">
        {/* STAGE 1: TENDER SUMMARY */}
        <div className="glass-card rounded-2xl border border-[#E6DDD0] bg-white/90 overflow-hidden shadow-2xs">
          <div
            onClick={() => toggleSection('tender')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EADECE] text-[#553E2B] flex items-center justify-center font-mono font-bold text-xs">
                1
              </span>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
                  Tender Summary Particulars
                </h3>
                <span className="text-[11px] text-[#7A6B5D] font-mono">
                  {selectedTender.tenderId} — {selectedTender.department}
                </span>
              </div>
            </div>
            {openSections.tender ? <ChevronUp className="w-4 h-4 text-[#8A7969]" /> : <ChevronDown className="w-4 h-4 text-[#8A7969]" />}
          </div>

          {openSections.tender && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA]">
                <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">Title & Scope</div>
                <div className="font-semibold text-[#2D231C] mt-1">{selectedTender.title}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA]">
                <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">Estimated Value & EMD</div>
                <div className="font-semibold text-[#2D231C] mt-1 font-mono">{selectedTender.estimatedValue}</div>
                <div className="text-[11px] text-[#7A6B5D] mt-0.5">Category: {selectedTender.category}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA]">
                <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">Closing & Evaluation Date</div>
                <div className="font-semibold text-[#2D231C] mt-1 font-mono">{selectedTender.closingDate}</div>
                <div className="text-[11px] text-[#25633A] font-medium mt-0.5">Status: {selectedTender.status}</div>
              </div>
            </div>
          )}
        </div>

        {/* STAGE 2: BIDDER SUMMARY */}
        <div className="glass-card rounded-2xl border border-[#E6DDD0] bg-white/90 overflow-hidden shadow-2xs">
          <div
            onClick={() => toggleSection('bidder')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EADECE] text-[#553E2B] flex items-center justify-center font-mono font-bold text-xs">
                2
              </span>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
                  Bidder Corporate Profile
                </h3>
                <span className="text-[11px] text-[#7A6B5D]">
                  {selectedBidder.name} ({selectedBidder.registrationNumber})
                </span>
              </div>
            </div>
            {openSections.bidder ? <ChevronUp className="w-4 h-4 text-[#8A7969]" /> : <ChevronDown className="w-4 h-4 text-[#8A7969]" />}
          </div>

          {openSections.bidder && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA]">
                <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">GST & PAN</div>
                <div className="font-mono font-semibold text-[#2D231C] mt-1">{selectedBidder.gstNumber}</div>
                <div className="text-[11px] font-mono text-[#7A6B5D]">PAN: {selectedBidder.panNumber}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA]">
                <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">MSME / Udyam</div>
                <div className="font-mono font-semibold text-[#2D231C] mt-1 truncate">{selectedBidder.msmeUdyamNumber}</div>
                <div className="text-[11px] text-[#25633A] font-medium">{selectedBidder.isMsmeRegistered ? 'MSME Registered' : 'Non-MSME'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA]">
                <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">Turnover (3-Yr Mean)</div>
                <div className="font-mono text-sm font-bold text-[#2D231C] mt-1">{selectedBidder.annualTurnover}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA]">
                <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">Contract Experience</div>
                <div className="font-mono text-sm font-bold text-[#2D231C] mt-1">{selectedBidder.yearsOfExperience} Years</div>
              </div>
            </div>
          )}
        </div>

        {/* STAGE 3: REQUIREMENTS */}
        <div className="glass-card rounded-2xl border border-[#E6DDD0] bg-white/90 overflow-hidden shadow-2xs">
          <div
            onClick={() => toggleSection('requirements')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EADECE] text-[#553E2B] flex items-center justify-center font-mono font-bold text-xs">
                3
              </span>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
                  Mandatory Tender Requirements Checklist
                </h3>
                <span className="text-[11px] text-[#7A6B5D]">
                  {selectedTender.requirements.length} GFR Benchmark Criteria
                </span>
              </div>
            </div>
            {openSections.requirements ? <ChevronUp className="w-4 h-4 text-[#8A7969]" /> : <ChevronDown className="w-4 h-4 text-[#8A7969]" />}
          </div>

          {openSections.requirements && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedTender.requirements.map((req) => (
                  <div key={req.id} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EDE5DA] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#2D231C]">{req.title}</div>
                      <div className="text-[11px] font-mono text-[#8C5832]">{req.benchmarkValue}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-white border border-[#DDD3C4]">
                      {req.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STAGE 4: EVIDENCE */}
        <div className="glass-card rounded-2xl border border-[#E6DDD0] bg-white/90 overflow-hidden shadow-2xs">
          <div
            onClick={() => toggleSection('evidence')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EADECE] text-[#553E2B] flex items-center justify-center font-mono font-bold text-xs">
                4
              </span>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
                  Extracted Evidence & Document Filings
                </h3>
                <span className="text-[11px] text-[#7A6B5D]">
                  {selectedBidder.documents.length} Uploaded Documents with OCR Citations
                </span>
              </div>
            </div>
            {openSections.evidence ? <ChevronUp className="w-4 h-4 text-[#8A7969]" /> : <ChevronDown className="w-4 h-4 text-[#8A7969]" />}
          </div>

          {openSections.evidence && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {selectedBidder.documents.map((d) => (
                  <div key={d.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                    <div className="font-semibold text-[#2D231C] truncate">{d.name}</div>
                    <div className="text-[11px] text-[#7A6B5D] flex items-center justify-between font-mono">
                      <span>{d.category}</span>
                      <span>{d.pages} Pgs • {d.fileSize}</span>
                    </div>
                    <div className="text-[10px] text-[#25633A] font-semibold pt-1">
                      ✓ OCR Extracted & Validated
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STAGE 5: COMPLIANCE MATRIX */}
        <div className="glass-card rounded-2xl border border-[#E6DDD0] bg-white/90 overflow-hidden shadow-2xs">
          <div
            onClick={() => toggleSection('compliance')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EADECE] text-[#553E2B] flex items-center justify-center font-mono font-bold text-xs">
                5
              </span>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
                  Compliance Matrix & Critical Discrepancies
                </h3>
                <span className="text-[11px] text-[#7A6B5D]">
                  {currentEvaluation ? `${currentEvaluation.compliancePercentage}% Compliance Score` : 'Evaluation Generated'}
                </span>
              </div>
            </div>
            {openSections.compliance ? <ChevronUp className="w-4 h-4 text-[#8A7969]" /> : <ChevronDown className="w-4 h-4 text-[#8A7969]" />}
          </div>

          {openSections.compliance && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] space-y-2 text-xs">
              {currentEvaluation?.matches.map((m, idx) => {
                const meets = m.matchStatus === 'Meets Requirement';
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-[#2D231C]">{m.requirementTitle}</div>
                      <div className="text-[11px] text-[#7A6B5D]">
                        Benchmark: <strong className="text-[#8C5832] font-mono">{m.tenderBenchmark}</strong> — Evidence: <strong className="text-[#2D231C] font-mono">{m.bidderEvidence}</strong>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                        meets
                          ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                          : 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
                      }`}
                    >
                      {meets ? '✓ Meets Requirement' : '✗ Does Not Meet'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STAGE 6: REVIEW QUEUE ITEMS */}
        <div className="glass-card rounded-2xl border border-[#E6DDD0] bg-white/90 overflow-hidden shadow-2xs">
          <div
            onClick={() => toggleSection('review')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EADECE] text-[#553E2B] flex items-center justify-center font-mono font-bold text-xs">
                6
              </span>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
                  Human Review & Flagged Queue Items
                </h3>
                <span className="text-[11px] text-[#7A6B5D]">
                  Priority Action Queue for Evaluation Committee
                </span>
              </div>
            </div>
            {openSections.review ? <ChevronUp className="w-4 h-4 text-[#8A7969]" /> : <ChevronDown className="w-4 h-4 text-[#8A7969]" />}
          </div>

          {openSections.review && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] space-y-2 text-xs">
              {reviewItems.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#2D231C]">{item.requirementTitle}</div>
                    <div className="text-[11px] text-[#7A6B5D]">{item.evidenceSummary}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-white border border-[#DDD3C4]">
                      {item.officerStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STAGE 7: OFFICER DECISION & DIGITAL SIGN-OFF */}
        <div className="glass-card rounded-2xl border-2 border-[#8C5832]/40 bg-white/95 overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection('decision')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#8C5832] text-white flex items-center justify-center font-mono font-bold text-xs">
                7
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C5832]">
                  Officer Review & Formal Decision Sign-Off
                </h3>
                <span className="text-[11px] text-[#7A6B5D]">
                  GFR Rule 173 Technical Evaluation Endorsement
                </span>
              </div>
            </div>
            {openSections.decision ? <ChevronUp className="w-4 h-4 text-[#8A7969]" /> : <ChevronDown className="w-4 h-4 text-[#8A7969]" />}
          </div>

          {openSections.decision && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#EADBCA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                    Current Committee Status
                  </div>
                  <div className="text-sm font-bold text-[#2D231C] mt-0.5">
                    {currentEvaluation?.evaluationStatus || 'Pending Decision'}
                  </div>
                  <div className="text-[11px] text-[#7A6B5D] mt-0.5">
                    Endorsed by: <strong>{currentEvaluation?.officerSignature?.officerName || currentUser.name}</strong> ({currentUser.role})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('compliance', { tenderId: selectedTender.id, bidderId: selectedBidder.id })}
                    className="px-3.5 py-1.5 rounded-lg bg-[#245D36] text-white text-xs font-semibold hover:bg-[#1B4729] cursor-pointer shadow-2xs"
                  >
                    Approve Bid
                  </button>
                  <button
                    onClick={() => onNavigate('compliance', { tenderId: selectedTender.id, bidderId: selectedBidder.id })}
                    className="px-3.5 py-1.5 rounded-lg bg-[#963028] text-white text-xs font-semibold hover:bg-[#7A2620] cursor-pointer shadow-2xs"
                  >
                    Disqualify Bid
                  </button>
                </div>
              </div>

              {currentEvaluation?.officerSignature?.decisionNote && (
                <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EDE5DA] text-xs text-[#554233] italic">
                  "{currentEvaluation.officerSignature.decisionNote}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* STAGE 8: REPORT */}
        <div className="glass-card rounded-2xl border border-[#E6DDD0] bg-white/90 overflow-hidden shadow-2xs">
          <div
            onClick={() => toggleSection('report')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EADECE] text-[#553E2B] flex items-center justify-center font-mono font-bold text-xs">
                8
              </span>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
                  Consolidated Bid Report Generation
                </h3>
                <span className="text-[11px] text-[#7A6B5D]">
                  Official Formal Evaluation Docket for Tender Committee
                </span>
              </div>
            </div>
            {openSections.report ? <ChevronUp className="w-4 h-4 text-[#8A7969]" /> : <ChevronDown className="w-4 h-4 text-[#8A7969]" />}
          </div>

          {openSections.report && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-[#2D231C]">
                  Division 1, 2 & 3 Consolidated Evaluation Docket
                </div>
                <div className="text-[11px] text-[#7A6B5D]">
                  Ready for instant preview, digital watermarking, and print export.
                </div>
              </div>

              <button
                onClick={() => onNavigate('reports', { tenderId: selectedTender.id, bidderId: selectedBidder.id })}
                className="px-3 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open Report Preview</span>
              </button>
            </div>
          )}
        </div>

        {/* STAGE 9: AUDIT */}
        <div className="glass-card rounded-2xl border border-[#E6DDD0] bg-white/90 overflow-hidden shadow-2xs">
          <div
            onClick={() => toggleSection('audit')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EADECE] text-[#553E2B] flex items-center justify-center font-mono font-bold text-xs">
                9
              </span>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
                  Cryptographic Audit Ledger Stream
                </h3>
                <span className="text-[11px] text-[#7A6B5D]">
                  Immutable Historical Record with SHA-256 Hashes
                </span>
              </div>
            </div>
            {openSections.audit ? <ChevronUp className="w-4 h-4 text-[#8A7969]" /> : <ChevronDown className="w-4 h-4 text-[#8A7969]" />}
          </div>

          {openSections.audit && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] divide-y divide-[#F0EAE0] text-xs">
              {relevantAuditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#2D231C]">{log.action}</span>
                    <span className="text-[#7A6B5D] ml-2">by {log.user} ({log.role})</span>
                    <div className="text-[11px] text-[#6E5D4F] mt-0.5">{log.details}</div>
                  </div>
                  <div className="text-right font-mono text-[10px] text-[#8C7A6A] shrink-0">
                    {log.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
