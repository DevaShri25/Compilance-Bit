import React from 'react';
import { UserProfile, Tender, Bidder, BidEvaluation } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  TrendingUp, 
  FileCheck2, 
  ShieldCheck, 
  ArrowUpRight,
  GitCompare,
  BarChart2,
  PieChart,
  Scale
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface ComplianceDashboardViewProps {
  currentUser: UserProfile;
  tenders: Tender[];
  bidders: Bidder[];
  evaluations: Record<string, BidEvaluation>;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
}

export const ComplianceDashboardView: React.FC<ComplianceDashboardViewProps> = ({
  currentUser,
  tenders,
  bidders,
  evaluations,
  onNavigate,
  onSelectTender,
  onSelectBidder,
}) => {
  // Aggregate real + global portfolio statistics as specified in prompt
  const totalBiddersCount = 24;
  const requirementsCheckedCount = 186;
  const compliantCount = 142;
  const missingCount = 18;
  const discrepanciesCount = 14;
  const needsReviewCount = 12;

  const compliantPct = Math.round((compliantCount / requirementsCheckedCount) * 100);
  const progressPct = 76; // 76% of dockets verified

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 3 • Executive Procurement Oversight
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Real-time Portfolio Metrics
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Procurement Compliance Dashboard
          </h2>
          <p className="text-xs text-[#736355]">
            Consolidated technical compliance metrics across active tender packages and registered vendor dockets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('case-workspace')}
            className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Unified Case Workspace</span>
          </button>
        </div>
      </div>

      {/* Main 2 Highlight Cards (Total Bidders & Requirements Checked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Bidders */}
        <div className="glass-panel rounded-2xl p-5 border border-[#DFD5C6] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#7A6B5D] font-medium uppercase tracking-wider">
              Total Participating Bidders
            </div>
            <div className="text-3xl font-bold font-mono text-[#2D231C] mt-1">
              {totalBiddersCount} <span className="text-sm font-normal text-[#7A6B5D]">Vendor Entities</span>
            </div>
            <div className="text-xs text-[#6F5F51] mt-1.5 flex items-center gap-2">
              <span className="text-[#25633A] font-semibold">18 Micro/Small (MSME)</span>
              <span>•</span>
              <span>6 Large Enterprise</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FAF4ED] text-[#8C5832] flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Requirements Checked */}
        <div className="glass-panel rounded-2xl p-5 border border-[#DFD5C6] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#7A6B5D] font-medium uppercase tracking-wider">
              Total Requirements Checked
            </div>
            <div className="text-3xl font-bold font-mono text-[#2D231C] mt-1">
              {requirementsCheckedCount} <span className="text-sm font-normal text-[#7A6B5D]">Evaluated Parameters</span>
            </div>
            <div className="text-xs text-[#6F5F51] mt-1.5 flex items-center gap-2">
              <span className="text-[#8C5832] font-semibold">{compliantPct}% Pass Rate</span>
              <span>•</span>
              <span>GFR Clause 173 Verified</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FAF4ED] text-[#8C5832] flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4 Outcome Metrics Grid (As specified in prompt: Compliant, Missing, Discrepancies, Needs Review) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Compliant */}
        <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs">
          <div className="flex items-center justify-between text-[#7A6B5D]">
            <span className="text-xs font-semibold text-[#1E5732]">Compliant</span>
            <CheckCircle2 className="w-4 h-4 text-[#1E5732]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1E5732] mt-2">
            {compliantCount}
          </div>
          <div className="text-[11px] text-[#7A6B5D] mt-1">
            Requirements 100% satisfied
          </div>
        </div>

        {/* Missing */}
        <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs">
          <div className="flex items-center justify-between text-[#7A6B5D]">
            <span className="text-xs font-semibold text-[#932F27]">Missing</span>
            <XCircle className="w-4 h-4 text-[#932F27]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#932F27] mt-2">
            {missingCount}
          </div>
          <div className="text-[11px] text-[#7A6B5D] mt-1">
            Mandatory documents absent
          </div>
        </div>

        {/* Discrepancies */}
        <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs">
          <div className="flex items-center justify-between text-[#7A6B5D]">
            <span className="text-xs font-semibold text-[#9E4D14]">Discrepancies</span>
            <AlertTriangle className="w-4 h-4 text-[#9E4D14]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#9E4D14] mt-2">
            {discrepanciesCount}
          </div>
          <div className="text-[11px] text-[#7A6B5D] mt-1">
            Shortfalls & mismatch items
          </div>
        </div>

        {/* Needs Review */}
        <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs">
          <div className="flex items-center justify-between text-[#7A6B5D]">
            <span className="text-xs font-semibold text-[#8C5D17]">Needs Review</span>
            <HelpCircle className="w-4 h-4 text-[#8C5D17]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#8C5D17] mt-2">
            {needsReviewCount}
          </div>
          <div className="text-[11px] text-[#7A6B5D] mt-1">
            Committee review pending
          </div>
        </div>
      </div>

      {/* Clean Visual Summary Bar & Progress Indicator */}
      <div className="glass-panel rounded-2xl p-6 border border-[#DFD5C6] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
              Verification Progress & Compliance Distribution
            </h3>
            <p className="text-xs text-[#7A6B5D] mt-0.5">
              Portfolio verification standing across 3 active public tenders
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-base font-bold text-[#8C5832]">
              {progressPct}%
            </span>
            <div className="text-[10px] text-[#7A6B5D]">Overall Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#EFE8DD] overflow-hidden flex">
          <div style={{ width: '76%' }} className="h-full bg-[#1E5732]" title="Compliant (76%)" />
          <div style={{ width: '10%' }} className="h-full bg-[#932F27]" title="Missing (10%)" />
          <div style={{ width: '8%' }} className="h-full bg-[#9E4D14]" title="Discrepancies (8%)" />
          <div style={{ width: '6%' }} className="h-full bg-[#8C5D17]" title="Needs Review (6%)" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-[#EDE5DA]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E5732]" />
            <span className="text-[#554233]">Compliant (142)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#932F27]" />
            <span className="text-[#554233]">Missing (18)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9E4D14]" />
            <span className="text-[#554233]">Discrepancies (14)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C5D17]" />
            <span className="text-[#554233]">Needs Review (12)</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Division 3 Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Bidder Comparison */}
        <div
          onClick={() => onNavigate('bidder-comparison')}
          className="p-4 rounded-xl border border-[#E6DDD0] bg-white/90 hover:bg-white hover:border-[#8C5832]/50 transition-all cursor-pointer shadow-2xs space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#8C6B52]">Feature 2</span>
            <ArrowUpRight className="w-4 h-4 text-[#8C5832]" />
          </div>
          <h4 className="text-xs font-semibold text-[#2D231C]">Bidder Comparison Workspace</h4>
          <p className="text-[11px] text-[#7A6B5D]">
            Multi-select participating bidders for factual side-by-side compliance review without automatic ranking.
          </p>
        </div>

        {/* Card 2: Document Repository */}
        <div
          onClick={() => onNavigate('repository')}
          className="p-4 rounded-xl border border-[#E6DDD0] bg-white/90 hover:bg-white hover:border-[#8C5832]/50 transition-all cursor-pointer shadow-2xs space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#8C6B52]">Feature 4</span>
            <ArrowUpRight className="w-4 h-4 text-[#8C5832]" />
          </div>
          <h4 className="text-xs font-semibold text-[#2D231C]">Secure Document Repository</h4>
          <p className="text-[11px] text-[#7A6B5D]">
            Search and filter official tender dockets, bidder filings, evidence archives, and signed reports.
          </p>
        </div>

        {/* Card 3: What-If Simulator */}
        <div
          onClick={() => onNavigate('what-if')}
          className="p-4 rounded-xl border border-[#E6DDD0] bg-white/90 hover:bg-white hover:border-[#8C5832]/50 transition-all cursor-pointer shadow-2xs space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#8C6B52]">Feature 6</span>
            <ArrowUpRight className="w-4 h-4 text-[#8C5832]" />
          </div>
          <h4 className="text-xs font-semibold text-[#2D231C]">What-If Compliance Simulator</h4>
          <p className="text-[11px] text-[#7A6B5D]">
            Simulate hypothetical changes safely without altering the official evaluation record.
          </p>
        </div>
      </div>
    </div>
  );
};
