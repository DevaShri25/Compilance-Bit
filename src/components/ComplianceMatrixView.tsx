import React, { useState, useEffect } from 'react';
import { Tender, Bidder, BidEvaluation, RequirementMatch, UserProfile } from '../types';
import { evaluateBidderAgainstTender } from '../services/aiService';
import { 
  GitCompare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  FileCheck, 
  Award, 
  UserCheck, 
  Download, 
  Printer, 
  Check, 
  X,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface ComplianceMatrixViewProps {
  tenders: Tender[];
  bidders: Bidder[];
  selectedTender: Tender;
  selectedBidder: Bidder;
  evaluations: Record<string, BidEvaluation>;
  currentUser: UserProfile;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
  onSaveEvaluation: (evaluation: BidEvaluation) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const ComplianceMatrixView: React.FC<ComplianceMatrixViewProps> = ({
  tenders,
  bidders,
  selectedTender,
  selectedBidder,
  evaluations,
  currentUser,
  onSelectTender,
  onSelectBidder,
  onSaveEvaluation,
  onNavigate,
  onLogAudit,
}) => {
  const evalKey = `${selectedTender.id}_${selectedBidder.id}`;
  const [currentEvaluation, setCurrentEvaluation] = useState<BidEvaluation | null>(
    evaluations[evalKey] || null
  );

  const [decisionNotes, setDecisionNotes] = useState(
    currentEvaluation?.officerSignature?.decisionNote || ''
  );
  const [isSigning, setIsSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  // Re-evaluate when tender or bidder changes
  useEffect(() => {
    if (evaluations[evalKey]) {
      setCurrentEvaluation(evaluations[evalKey]);
      setDecisionNotes(evaluations[evalKey].officerSignature?.decisionNote || '');
    } else {
      // Auto-compute Tender-Aware matching
      const computed = evaluateBidderAgainstTender(
        selectedTender,
        selectedBidder,
        currentUser.name
      );
      setCurrentEvaluation(computed);
      setDecisionNotes(computed.officerSignature?.decisionNote || '');
    }
    setSignSuccess(false);
  }, [selectedTender.id, selectedBidder.id]);

  const handleManualStatusToggle = (matchIndex: number) => {
    if (!currentEvaluation) return;
    const updatedMatches = [...currentEvaluation.matches];
    const target = updatedMatches[matchIndex];
    target.matchStatus =
      target.matchStatus === 'Meets Requirement' ? 'Does Not Meet' : 'Meets Requirement';
    target.isManuallyOverridden = true;

    const met = updatedMatches.filter((m) => m.matchStatus === 'Meets Requirement').length;
    const failed = updatedMatches.filter((m) => m.matchStatus === 'Does Not Meet' && m.isMandatory).length;
    const total = updatedMatches.length;
    const pct = total > 0 ? Math.round((met / total) * 100) : 0;

    const updated: BidEvaluation = {
      ...currentEvaluation,
      matches: updatedMatches,
      metRequirements: met,
      failedRequirements: failed,
      compliancePercentage: pct,
      evaluationStatus:
        failed > 0
          ? 'Technically Disqualified'
          : pct === 100
          ? 'Eligible for Financial Bid'
          : 'Clarification Required',
    };

    setCurrentEvaluation(updated);
    onSaveEvaluation(updated);
    onLogAudit(
      'Compliance Override',
      'Compliance',
      `Manual status override for ${target.requirementTitle} (${selectedBidder.name} on ${selectedTender.tenderId}).`
    );
  };

  const handleSignOff = (verdict: BidEvaluation['evaluationStatus']) => {
    if (!currentEvaluation) return;
    setIsSigning(true);

    setTimeout(() => {
      const signedEval: BidEvaluation = {
        ...currentEvaluation,
        evaluationStatus: verdict,
        officerSignature: {
          officerName: currentUser.name,
          officerRole: currentUser.role,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
          decisionNote: decisionNotes || `${verdict} recorded by ${currentUser.name}.`,
        },
      };

      setCurrentEvaluation(signedEval);
      onSaveEvaluation(signedEval);
      setIsSigning(false);
      setSignSuccess(true);

      onLogAudit(
        'Officer Sign-off',
        'Compliance',
        `Official sign-off recorded for ${selectedBidder.name}: ${verdict}. Endorsed by ${currentUser.name} (${currentUser.role}).`
      );
    }, 450);
  };

  const isEligible = currentEvaluation?.evaluationStatus === 'Eligible for Financial Bid';
  const isDisqualified = currentEvaluation?.evaluationStatus === 'Technically Disqualified';

  return (
    <div className="space-y-6">
      {/* Top Header & Dual Context Pickers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#8C5832]" />
            Tender-Aware AI: Requirements vs Bidder Evidence
          </h2>
          <p className="text-xs text-[#736355]">
            Directly correlates uploaded bidder evidence against tender mandatory benchmarks with GFR compliance validation
          </p>
        </div>

        {/* Dual Selectors: Tender & Bidder */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tender Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DDD3C4] rounded-lg px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] text-[#7A6B5D] font-medium">Tender:</span>
            <select
              value={selectedTender.id}
              onChange={(e) => {
                const t = tenders.find((item) => item.id === e.target.value);
                if (t) onSelectTender(t);
              }}
              className="text-xs font-semibold text-[#2D231C] outline-none bg-transparent max-w-[210px] truncate"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenderId}
                </option>
              ))}
            </select>
          </div>

          {/* Bidder Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DDD3C4] rounded-lg px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] text-[#7A6B5D] font-medium">Bidder:</span>
            <select
              value={selectedBidder.id}
              onChange={(e) => {
                const b = bidders.find((item) => item.id === e.target.value);
                if (b) onSelectBidder(b);
              }}
              className="text-xs font-semibold text-[#2D231C] outline-none bg-transparent max-w-[210px] truncate"
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

      {/* Evaluation Summary Verdict Card */}
      {currentEvaluation && (
        <div className="glass-panel rounded-2xl p-5 border border-[#DFD5C6] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#EFE9DF] text-[#5A3F2A]">
                {selectedTender.tenderId}
              </span>
              <span className="text-xs text-[#7A6B5D]">vs</span>
              <span className="text-xs font-semibold text-[#2D231C]">
                {selectedBidder.name}
              </span>
            </div>
            <div className="text-base font-semibold text-[#2D231C]">
              Technical Compliance Score: <strong className="font-mono text-[#8C5832]">{currentEvaluation.compliancePercentage}%</strong>
            </div>
            <div className="text-xs text-[#6F6052] flex items-center gap-3">
              <span>
                Satisfied: <strong className="text-[#1E5732] font-mono">{currentEvaluation.metRequirements}</strong> / {currentEvaluation.totalRequirements} criteria
              </span>
              {currentEvaluation.failedRequirements > 0 && (
                <span className="text-[#932F27] font-semibold">
                  • {currentEvaluation.failedRequirements} Mandatory Deficit(s)
                </span>
              )}
            </div>
          </div>

          {/* Verdict Status Indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                isEligible
                  ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                  : isDisqualified
                  ? 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
                  : 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
              }`}
            >
              {isEligible ? (
                <CheckCircle2 className="w-4 h-4 text-[#1E5732]" />
              ) : isDisqualified ? (
                <XCircle className="w-4 h-4 text-[#932F27]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#8C5D17]" />
              )}
              <div className="leading-tight">
                <div>{currentEvaluation.evaluationStatus}</div>
                <div className="text-[10px] font-normal opacity-85">
                  {isEligible ? 'GFR Section 4.2 Approved' : isDisqualified ? 'Disqualified from Commercial Stage' : 'Officer Review Pending'}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('reports', { tenderId: selectedTender.id, bidderId: selectedBidder.id })}
              className="px-3 py-2 rounded-xl border border-[#D5C9B8] bg-white text-xs font-medium text-[#4A3423] hover:bg-[#FAF6F0] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#8C5832]" />
              <span>Official Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Clean "Tender Requirements vs Bidder Evidence" Interface (Requested core) */}
      <div className="glass-card rounded-2xl border border-[#E6DDD0] overflow-hidden bg-white/90 shadow-2xs">
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-b border-[#E6DDD0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8C5832]" />
            <h3 className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
              Tender Requirements vs Bidder Evidence Matrix
            </h3>
          </div>
          <span className="text-[11px] text-[#7A6B5D]">
            Official AI-Verified Comparison
          </span>
        </div>

        {currentEvaluation && currentEvaluation.matches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ECE3D6] bg-[#F6F1E8]/70 text-[#6B5A4B] text-[11px] font-semibold">
                  <th className="py-3 px-4 w-[28%]">Tender Requirement</th>
                  <th className="py-3 px-4 w-[38%]">Bidder Evidence (Extracted)</th>
                  <th className="py-3 px-4 w-[20%]">Status</th>
                  <th className="py-3 px-3 text-center w-[14%]">Officer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE0]">
                {currentEvaluation.matches.map((item, idx) => {
                  const meets = item.matchStatus === 'Meets Requirement';
                  return (
                    <tr key={idx} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Column 1: Tender Requirement */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-[#2D231C]">
                          {item.requirementTitle}
                        </div>
                        <div className="text-[11px] font-mono text-[#8C5832] mt-0.5 font-medium">
                          {item.tenderBenchmark}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                          <span className="px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#553E2B] border border-[#E2D8C8]">
                            {item.requirementType}
                          </span>
                          {item.isMandatory && (
                            <span className="text-[#96382E] font-medium font-mono">
                              Mandatory
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Bidder Evidence */}
                      <td className="py-3.5 px-4 align-top space-y-1">
                        <div className="font-mono text-xs font-semibold text-[#2D231C]">
                          {item.bidderEvidence}
                        </div>

                        {/* Source Document Citation */}
                        <div className="text-[11px] text-[#7A6B5D] flex items-center gap-1 pt-0.5">
                          <FileText className="w-3 h-3 text-[#8C5832] shrink-0" />
                          <span className="truncate">
                            Source: <strong className="text-[#4E3929]">{item.sourceDocName} — Page {item.sourcePage}</strong>
                          </span>
                        </div>

                        {item.officerRemarks && (
                          <div className="text-[11px] text-[#6E5E50] bg-[#FAF8F5] p-1.5 rounded border border-[#EFE8DD] italic">
                            {item.officerRemarks}
                          </div>
                        )}
                      </td>

                      {/* Column 3: Verification & Compliance Result (4-tier flow: Requirement -> Evidence -> Verification -> Compliance Result) */}
                      <td className="py-3.5 px-4 align-top space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              meets
                                ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                                : item.bidderEvidence.includes('Shortfall') || item.bidderEvidence.includes('continuous')
                                ? 'bg-[#FDF3EB] text-[#9E4E16] border-[#F5DAC2]'
                                : 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
                            }`}
                          >
                            {meets ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>✓ Compliant</span>
                              </>
                            ) : item.bidderEvidence.includes('Shortfall') ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>⚠ Discrepancy</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>✗ Not Met</span>
                              </>
                            )}
                          </span>

                          <span className="text-[10px] text-[#8A7969] font-mono">
                            OCR: {(item.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="text-[11px] text-[#7A6B5D] leading-tight">
                          Verification: GFR Benchmark Check
                        </div>
                      </td>

                      {/* Column 4: Officer Action (Manual Toggle & Trace Link) */}
                      <td className="py-3.5 px-3 text-center align-top space-y-1">
                        <button
                          onClick={() => handleManualStatusToggle(idx)}
                          className="w-full px-2 py-1 rounded text-[11px] border border-[#D5C9B8] bg-white hover:bg-[#F9F5EE] text-[#4A3423] font-medium transition-colors cursor-pointer"
                        >
                          {meets ? 'Flag Deficit' : 'Pass Criteria'}
                        </button>
                        <button
                          onClick={() => onNavigate('evidence-trace')}
                          className="w-full text-[10px] text-[#8C5832] hover:text-[#5F3819] font-medium block pt-0.5 cursor-pointer"
                        >
                          Inspect Chain →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#8A7969]">
            Please ensure tender is analyzed to generate criteria benchmarks.
          </div>
        )}
      </div>

      {/* Verification Officer Sign-off & Decision Panel */}
      <div className="glass-panel rounded-2xl p-5 border border-[#DFD5C6] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE3D6]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#8C5832]" />
            <h3 className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
              Verification Officer Formal Decision & Sign-Off
            </h3>
          </div>
          <span className="text-[11px] text-[#7A6B5D]">
            GFR Rule 173 Technical Evaluation Endorsement
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Decision Notes */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B]">
              Official Decision Note / Evaluation Comments
            </label>
            <textarea
              rows={3}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Enter official committee reasoning, GFR clauses satisfied, or grounds for disqualification..."
              className="w-full p-2.5 text-xs rounded-xl glass-input text-[#2D231C] leading-relaxed"
            />
          </div>

          {/* Officer Credentials & Action Buttons */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] text-xs">
              <div className="text-[10px] text-[#8C6B52] font-semibold uppercase">
                Endorsing Officer
              </div>
              <div className="font-semibold text-[#2D231C] mt-0.5">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-[#7A6B5D]">
                Role: {currentUser.role}
              </div>
              {currentEvaluation?.officerSignature?.timestamp && (
                <div className="text-[10px] font-mono text-[#8C7A6A] mt-1">
                  Signed: {currentEvaluation.officerSignature.timestamp}
                </div>
              )}
            </div>

            {/* Sign-off Actions */}
            <div className="flex items-center gap-2">
              <button
                disabled={isSigning}
                onClick={() => handleSignOff('Eligible for Financial Bid')}
                className="flex-1 py-2 px-3 rounded-lg bg-[#245D36] text-white hover:bg-[#1B4729] text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
              >
                Approve (Qualified)
              </button>
              <button
                disabled={isSigning}
                onClick={() => handleSignOff('Technically Disqualified')}
                className="flex-1 py-2 px-3 rounded-lg bg-[#963028] text-white hover:bg-[#7A2620] text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
              >
                Disqualify Bid
              </button>
            </div>
          </div>
        </div>

        {signSuccess && (
          <div className="p-3 rounded-lg bg-[#EEF6F0] border border-[#C4DFC8] text-xs text-[#1E5732] font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E5732]" />
            <span>
              Official verification decision signed and committed to the CPPP immutable audit ledger.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
