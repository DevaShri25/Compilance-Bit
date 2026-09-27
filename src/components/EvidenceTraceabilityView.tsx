import React, { useState } from 'react';
import { 
  Tender, 
  Bidder, 
  ClauseEvidenceTrace, 
  DependencyNode, 
  UserProfile 
} from '../types';
import { 
  GitBranch, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Scale, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  Clock,
  Sparkles,
  GitCommit
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface EvidenceTraceabilityViewProps {
  tenders: Tender[];
  bidders: Bidder[];
  selectedTender: Tender;
  selectedBidder: Bidder;
  clauseTraces: ClauseEvidenceTrace[];
  dependencyNodes: DependencyNode[];
  currentUser: UserProfile;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const EvidenceTraceabilityView: React.FC<EvidenceTraceabilityViewProps> = ({
  tenders,
  bidders,
  selectedTender,
  selectedBidder,
  clauseTraces,
  dependencyNodes,
  currentUser,
  onSelectTender,
  onSelectBidder,
  onNavigate,
  onLogAudit,
}) => {
  const [expandedChainId, setExpandedChainId] = useState<string | null>(
    clauseTraces[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState<'mapping' | 'claim-vs-evidence' | 'time-aware' | 'dependencies'>('mapping');

  const toggleExpand = (id: string) => {
    setExpandedChainId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (res: ClauseEvidenceTrace['complianceResult']) => {
    switch (res) {
      case 'Compliant':
        return 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]';
      case 'Needs Review':
        return 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]';
      case 'Discrepancy':
        return 'bg-[#FDF3EB] text-[#9E4E16] border-[#F5DAC2]';
      case 'Not Met':
      case 'Missing':
        return 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Dual Context Pickers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 2 • Forensic Evidence Traceability
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              GFR Clause-to-Evidence Map
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Evidence Traceability & Explainable AI
          </h2>
          <p className="text-xs text-[#736355]">
            Unpack the complete chain from tender clauses to page-level extracted quotes and time-aware validity checks
          </p>
        </div>

        {/* Dual Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-[#DDD3C4] rounded-lg px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] text-[#7A6B5D] font-medium">Tender:</span>
            <select
              value={selectedTender.id}
              onChange={(e) => {
                const t = tenders.find((item) => item.id === e.target.value);
                if (t) onSelectTender(t);
              }}
              className="text-xs font-semibold text-[#2D231C] outline-none bg-transparent max-w-[200px] truncate"
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
              className="text-xs font-semibold text-[#2D231C] outline-none bg-transparent max-w-[200px] truncate"
            >
              {bidders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Division 2 Evidence Views */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          onClick={() => setActiveTab('mapping')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'mapping'
              ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
              : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
          }`}
        >
          Clause-to-Evidence Mapping ({clauseTraces.length})
        </button>
        <button
          onClick={() => setActiveTab('claim-vs-evidence')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'claim-vs-evidence'
              ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
              : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
          }`}
        >
          Bidder Claim vs Evidence Comparison
        </button>
        <button
          onClick={() => setActiveTab('time-aware')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'time-aware'
              ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
              : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
          }`}
        >
          Time-Aware Validity on Closing Date
        </button>
        <button
          onClick={() => setActiveTab('dependencies')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dependencies'
              ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
              : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
          }`}
        >
          Compliance Dependency Engine (Flow)
        </button>
      </div>

      {/* TAB 1: CLAUSE-TO-EVIDENCE MAPPING & EXPANDABLE EVIDENCE CHAIN */}
      {activeTab === 'mapping' && (
        <div className="space-y-4">
          <div className="text-xs text-[#7A6B5D] flex items-center justify-between">
            <span>
              Click on any requirement to inspect its full <strong>5-Stage Evidence Chain</strong> (Document → Page → Quote → Rule → AI Result).
            </span>
            <span className="font-mono text-[11px] text-[#8C5832]">
              Tender Closing: {selectedTender.closingDate}
            </span>
          </div>

          <div className="space-y-3.5">
            {clauseTraces.map((trace) => {
              const isExpanded = expandedChainId === trace.id;
              const isCompliant = trace.complianceResult === 'Compliant';
              return (
                <div
                  key={trace.id}
                  className="glass-card rounded-2xl border border-[#E6DDD0] bg-white/90 overflow-hidden shadow-2xs transition-all"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(trace.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isCompliant
                            ? 'bg-[#EEF6F0] text-[#1E5732]'
                            : 'bg-[#FDF1EF] text-[#932F27]'
                        }`}
                      >
                        {isCompliant ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-semibold text-[#8C6B52]">
                            {trace.clauseSection}
                          </span>
                          <span className="text-[11px] font-mono text-[#7A6B5D]">
                            ({trace.clauseId})
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#2D231C] mt-0.5">
                          {trace.tenderClause}
                        </h4>
                        <div className="text-[11px] text-[#7A6B5D] mt-1 flex items-center gap-2">
                          <FileText className="w-3 h-3 text-[#8C5832]" />
                          <span>
                            {trace.bidderDocument} (Page {trace.pageNumber})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${getStatusBadge(
                          trace.complianceResult
                        )}`}
                      >
                        {isCompliant ? '✓ Requirement Satisfied' : '⚠ Non-Compliant / Deficit'}
                      </span>
                      <button className="text-[#8A7969] hover:text-[#2D231C]">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Evidence Chain Panel (Feature 5 + Feature 11) */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-[#F0EAE0] bg-[#FAF8F5]/60 space-y-4 text-xs">
                      {/* 5-Step Visual Chain Flow */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0]">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6B52] mb-2 flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Auditable Evidence Chain</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                          {/* Step 1: Source Document */}
                          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6]">
                            <div className="text-[10px] text-[#7A6B5D] uppercase font-semibold">
                              1. Source Document
                            </div>
                            <div className="font-semibold text-[#2D231C] mt-1 truncate">
                              {trace.bidderDocument}
                            </div>
                          </div>

                          {/* Step 2: Page Number */}
                          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6]">
                            <div className="text-[10px] text-[#7A6B5D] uppercase font-semibold">
                              2. Page Citation
                            </div>
                            <div className="font-semibold font-mono text-[#8C5832] mt-1">
                              Page {trace.pageNumber}
                            </div>
                          </div>

                          {/* Step 3: Extracted Text */}
                          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6]">
                            <div className="text-[10px] text-[#7A6B5D] uppercase font-semibold">
                              3. OCR Extraction
                            </div>
                            <div className="text-[11px] text-[#2D231C] mt-1 truncate">
                              Verbatim text verified
                            </div>
                          </div>

                          {/* Step 4: Applied Rule */}
                          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6]">
                            <div className="text-[10px] text-[#7A6B5D] uppercase font-semibold">
                              4. Applied Rule
                            </div>
                            <div className="text-[11px] font-mono text-[#2D231C] mt-1 truncate">
                              {trace.appliedRule}
                            </div>
                          </div>

                          {/* Step 5: AI Result */}
                          <div
                            className={`p-2.5 rounded-lg border font-semibold ${
                              isCompliant
                                ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                                : 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
                            }`}
                          >
                            <div className="text-[10px] uppercase">5. AI Result</div>
                            <div className="mt-1">{trace.complianceResult}</div>
                          </div>
                        </div>
                      </div>

                      {/* Exact Extracted Quote & Explainable AI (Why?) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-1">
                          <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                            Verbatim Extracted Evidence Quote
                          </div>
                          <div className="text-xs text-[#2D231C] italic font-mono bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EDE5DA] leading-relaxed">
                            {trace.extractedEvidence}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-1">
                          <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                            Explainable AI Rationale (Why?)
                          </div>
                          <div className="text-xs text-[#4E3D2F] bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EDE5DA] leading-relaxed">
                            {trace.whyExplanation}
                          </div>
                        </div>
                      </div>

                      {/* Time-Aware snippet if present */}
                      {trace.timeAware && (
                        <div className="p-3 rounded-xl bg-[#FAF5EE] border border-[#EADBCA] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#8C5832]" />
                            <span className="font-semibold text-[#3D2C1F]">
                              Time-Aware Validity:
                            </span>
                            <span className="text-[#554233]">
                              {trace.timeAware.validFrom} to {trace.timeAware.validUntil}
                            </span>
                          </div>
                          <span className="font-semibold text-[#1E5732]">
                            {trace.timeAware.statusMessage}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BIDDER CLAIM VS EVIDENCE (Feature 6) */}
      {activeTab === 'claim-vs-evidence' && (
        <div className="space-y-4">
          <div className="text-xs text-[#7A6B5D]">
            Side-by-side reconciliation between the vendor's application declarations and certified third-party documentary proof.
          </div>

          <div className="space-y-3">
            {clauseTraces.map((trace) => {
              const isMatch = trace.claimDiscrepancyStatus === 'Verified';
              return (
                <div
                  key={trace.id}
                  className="glass-card rounded-2xl p-5 border border-[#E6DDD0] bg-white/90 shadow-2xs"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#8C6B52]">
                        {trace.clauseSection}
                      </span>
                      <h4 className="text-xs font-semibold text-[#2D231C]">
                        {trace.tenderClause}
                      </h4>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                        isMatch
                          ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                          : 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
                      }`}
                    >
                      {isMatch ? '✓ Verified Match' : '⚠ Discrepancy Detected'}
                    </span>
                  </div>

                  {/* Side-by-Side Comparison Component */}
                  <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Column 1: Bidder Claim */}
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                      <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                        Bidder Self-Declared Claim
                      </div>
                      <div className="text-sm font-semibold font-mono text-[#2D231C]">
                        {trace.bidderClaim}
                      </div>
                      <div className="text-[11px] text-[#7A6B5D]">
                        From: Bid Submission Form Docket
                      </div>
                    </div>

                    {/* Column 2: Documented Evidence */}
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                      <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                        Extracted Document Evidence
                      </div>
                      <div className="text-sm font-semibold font-mono text-[#2D231C]">
                        {trace.actualEvidence}
                      </div>
                      <div className="text-[11px] text-[#7A6B5D] flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#8C5832]" />
                        <span>
                          Source: {trace.bidderDocument} (Page {trace.pageNumber})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-[#5D4C3E] bg-[#FAF5EE] p-2.5 rounded-lg border border-[#EADBCA] leading-relaxed">
                    <strong>Reconciliation Note:</strong> {trace.whyExplanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TIME-AWARE VERIFICATION (Feature 8) */}
      {activeTab === 'time-aware' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FAF5EE] border border-[#EADBCA] text-xs text-[#4A3728] flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-[#8C5832] shrink-0 mt-0.5" />
            <div>
              <strong>Time-Aware Evaluation Mandate:</strong> In government procurement, certificates and bank instruments must be validated against the <strong>Tender Closing Date ({selectedTender.closingDate})</strong> rather than purely today's runtime date.
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-[#E6DDD0] overflow-hidden bg-white/90 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#ECE3D6] bg-[#F6F1E8]/70 text-[#6B5A4B] text-[11px] font-semibold">
                    <th className="py-3 px-4">Certificate / Instrument</th>
                    <th className="py-3 px-3">Valid From</th>
                    <th className="py-3 px-3">Valid Until</th>
                    <th className="py-3 px-3">Tender Closing Date</th>
                    <th className="py-3 px-4 text-center">Status on Tender Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE0]">
                  {clauseTraces
                    .filter((t) => t.timeAware)
                    .map((item, idx) => {
                      const t = item.timeAware!;
                      return (
                        <tr key={idx} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#2D231C]">
                            <div>{item.tenderClause}</div>
                            <div className="text-[11px] text-[#7A6B5D] font-mono">
                              {item.bidderDocument}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[#2D231C]">
                            {t.validFrom}
                          </td>
                          <td className="py-3 px-3 font-mono text-[#2D231C]">
                            {t.validUntil}
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-[#8C5832]">
                            {t.tenderClosingDate}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                t.isValidOnTenderDate
                                  ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                                  : 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
                              }`}
                            >
                              {t.isValidOnTenderDate ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {t.isValidOnTenderDate
                                  ? '✓ Valid on Tender Date'
                                  : '⚠ Lapsed / Expired'}
                              </span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE DEPENDENCY ENGINE (Feature 10) */}
      {activeTab === 'dependencies' && (
        <div className="space-y-4">
          <div className="text-xs text-[#7A6B5D]">
            Visualizes causal requirement chains. If an upstream mandatory eligibility document is missing or invalid, downstream eligibility requirements and bid progression are blocked.
          </div>

          {/* Simple Visual Flow Diagram (As specified in prompt) */}
          <div className="glass-panel rounded-2xl p-6 border border-[#DFD5C6] space-y-6">
            <div className="text-xs font-semibold text-[#8C6B52] uppercase tracking-wider">
              Rule Dependency Cascade Diagram
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
              {/* Node 1: Document */}
              <div className="flex-1 w-full p-4 rounded-xl bg-white border border-[#E6DDD0] text-center shadow-xs">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FAF5EE] text-[#8C5832] border border-[#E2D8C8]">
                  Upstream Document
                </span>
                <h4 className="text-xs font-semibold text-[#2D231C] mt-2">
                  Audited Balance Sheets & CA Turnover Form
                </h4>
                <div className="mt-2 text-[11px] text-[#25633A] font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Document Present & UDIN Verified</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center text-[#8C5832] shrink-0 rotate-90 md:rotate-0">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Node 2: Requirement Affected */}
              <div className="flex-1 w-full p-4 rounded-xl bg-white border border-[#E6DDD0] text-center shadow-xs">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FAF5EE] text-[#8C5832] border border-[#E2D8C8]">
                  Tender Requirement
                </span>
                <h4 className="text-xs font-semibold text-[#2D231C] mt-2">
                  Minimum Turnover Requirement (≥ ₹5.0 Cr)
                </h4>
                <div className="mt-2 text-[11px] text-[#25633A] font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Calculated: ₹5.80 Cr (Satisfied)</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center text-[#8C5832] shrink-0 rotate-90 md:rotate-0">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Node 3: Outcome */}
              <div className="flex-1 w-full p-4 rounded-xl bg-[#FAF5EE] border border-[#DFD3C2] text-center shadow-xs">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#EBF3ED] text-[#225732] border border-[#CFE1D4]">
                  Bid Stage Outcome
                </span>
                <h4 className="text-xs font-semibold text-[#2D231C] mt-2">
                  Cleared for Commercial Opening
                </h4>
                <div className="mt-2 text-[11px] text-[#25633A] font-medium flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Stage 1 Technical Bid Endorsed</span>
                </div>
              </div>
            </div>

            {/* Negative Scenario Example Flow */}
            <div className="pt-4 border-t border-[#ECE3D6]">
              <div className="text-[11px] font-semibold uppercase text-[#736355] mb-3">
                Failure Cascade Example (Zenith Systems):
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8DCD1] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-center md:text-left">
                  <span className="font-semibold text-[#963028]">
                    Missing/Deficient Turnover Document (₹3.8 Cr vs ₹5.0 Cr)
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C5832] shrink-0 rotate-90 md:rotate-0" />
                <div className="text-center md:text-left">
                  <span className="font-semibold text-[#9E4D14]">
                    Eligibility Clause 4.2 Benchmark Failed
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C5832] shrink-0 rotate-90 md:rotate-0" />
                <div className="text-center md:text-left">
                  <span className="font-semibold text-[#963028]">
                    Disqualification / Officer Sign-off Blocked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
