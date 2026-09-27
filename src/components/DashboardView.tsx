import React from 'react';
import { UserProfile, Tender, Bidder, BidEvaluation, AuditLogItem } from '../types';
import { 
  FileText, 
  Building2, 
  FolderCheck, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Lock,
  UserCheck
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface DashboardViewProps {
  currentUser: UserProfile;
  tenders: Tender[];
  bidders: Bidder[];
  evaluations: Record<string, BidEvaluation>;
  auditLogs: AuditLogItem[];
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  tenders,
  bidders,
  evaluations,
  auditLogs,
  onNavigate,
  onSelectTender,
  onSelectBidder,
}) => {
  const activeTenders = tenders.filter((t) => t.status === 'Active' || t.status === 'Under Evaluation');
  const totalTenderValue = tenders.reduce((acc, t) => acc + (t.numericValue || 0), 0);
  const totalDocuments = bidders.reduce((acc, b) => acc + b.documents.length, 0);
  const evalsList = Object.values(evaluations);
  const qualifiedBids = evalsList.filter((e) => e.evaluationStatus === 'Eligible for Financial Bid');
  const disqualifiedBids = evalsList.filter((e) => e.evaluationStatus === 'Technically Disqualified');

  return (
    <div className="space-y-6">
      {/* Role Context Notification Bar */}
      <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border border-[#E4DCcf] bg-[#FFFDF9]/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EFE8DD] flex items-center justify-center text-[#5C3F2B] shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#8C6B52] uppercase tracking-wider">
              Active Role Dashboard: {currentUser.role}
            </div>
            <div className="text-sm font-medium text-[#2E241D]">
              {currentUser.role === 'Admin' && 'System Governance & Global Procurement Audit View'}
              {currentUser.role === 'Procurement Officer' && 'Tender Publishing & Requirement Extraction Pipeline'}
              {currentUser.role === 'Verification Officer' && 'Bidder Document Docket & Technical Evidence Verification'}
            </div>
          </div>
        </div>

        {/* Quick Workflow Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('review-queue')}
            className="px-3 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#EFE4D6]" />
            <span>Open Review Queue</span>
          </button>
          <button
            onClick={() => onNavigate('evidence-trace')}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#D8CEBF] text-[#3B291D] hover:bg-[#F7F2EA] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8C5832]" />
            <span>Evidence Chain</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card rounded-xl p-4 border border-[#E8E2D7] bg-white/70">
          <div className="flex items-center justify-between text-[#7E7063] mb-2">
            <span className="text-xs font-medium">Active Tenders</span>
            <FileText className="w-4 h-4 text-[#8C5832]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#2D231C] font-mono">
              {activeTenders.length}
            </span>
            <span className="text-xs text-[#7A6C5F]">
              ₹{totalTenderValue.toFixed(2)} Cr Est.
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A6C5F] flex items-center gap-1">
            <span className="text-[#2F663C] font-medium font-mono">{tenders.filter(t => t.isAnalyzed).length} Analyzed</span>
            <span>via AI Engine</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card rounded-xl p-4 border border-[#E8E2D7] bg-white/70">
          <div className="flex items-center justify-between text-[#7E7063] mb-2">
            <span className="text-xs font-medium">Registered Bidders</span>
            <Building2 className="w-4 h-4 text-[#8C5832]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#2D231C] font-mono">
              {bidders.length}
            </span>
            <span className="text-xs text-[#7A6C5F]">Entities</span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A6C5F] flex items-center gap-1">
            <span className="text-[#2F663C] font-medium font-mono">
              {bidders.filter(b => b.verificationStatus === 'Verified').length} Verified
            </span>
            <span>• {bidders.filter(b => b.verificationStatus === 'In Review').length} In Review</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card rounded-xl p-4 border border-[#E8E2D7] bg-white/70">
          <div className="flex items-center justify-between text-[#7E7063] mb-2">
            <span className="text-xs font-medium">Document Workspace</span>
            <FolderCheck className="w-4 h-4 text-[#8C5832]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#2D231C] font-mono">
              {totalDocuments}
            </span>
            <span className="text-xs text-[#7A6C5F]">Uploaded</span>
          </div>
          <div className="mt-2 text-[11px] text-[#2F663C] font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>100% OCR Processed</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card rounded-xl p-4 border border-[#E8E2D7] bg-white/70">
          <div className="flex items-center justify-between text-[#7E7063] mb-2">
            <span className="text-xs font-medium">Compliance Verdicts</span>
            <ShieldCheck className="w-4 h-4 text-[#8C5832]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#2D231C] font-mono">
              {evalsList.length}
            </span>
            <span className="text-xs text-[#7A6C5F]">Evaluated</span>
          </div>
          <div className="mt-2 text-[11px] flex items-center gap-2">
            <span className="text-[#235C35] font-medium">
              {qualifiedBids.length} Cleared
            </span>
            <span className="text-[#96352E] font-medium">
              {disqualifiedBids.length} Disqualified
            </span>
          </div>
        </div>
      </div>

      {/* Role-Specific Focus Section */}
      {currentUser.role === 'Verification Officer' && (
        <div className="glass-panel rounded-xl p-5 border border-[#DFD5C6]">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-sm font-semibold text-[#2F241C] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8C5832]" />
                Technical Verification Queue (GFR Rule 173 Compliance)
              </h2>
              <p className="text-xs text-[#736558] mt-0.5">
                Examine bidder evidence extracted from dockets against tender mandatory criteria
              </p>
            </div>
            <button
              onClick={() => onNavigate('compliance')}
              className="text-xs font-semibold text-[#8C5832] hover:text-[#643D21] flex items-center gap-1 cursor-pointer"
            >
              Open Full Compliance Matrix
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {evalsList.map((ev) => {
              const tender = tenders.find((t) => t.id === ev.tenderId);
              const bidder = bidders.find((b) => b.id === ev.bidderId);
              const isEligible = ev.evaluationStatus === 'Eligible for Financial Bid';
              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    onNavigate('compliance', { tenderId: ev.tenderId, bidderId: ev.bidderId });
                  }}
                  className="p-3.5 rounded-lg border border-[#E6DDD0] bg-white/90 hover:bg-white hover:border-[#8C5832]/50 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono text-[#876E5B] uppercase">
                        {tender?.tenderId}
                      </div>
                      <div className="text-xs font-semibold text-[#2D231C] mt-0.5 line-clamp-1">
                        {bidder?.name}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                        isEligible
                          ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                          : 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
                      }`}
                    >
                      {ev.evaluationStatus}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[#6F6052] pt-2 border-t border-[#F1EAE0]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-[#2D231C]">
                        {ev.metRequirements} / {ev.totalRequirements}
                      </span>
                      <span>Criteria Satisfied</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#8C5832]">
                      {ev.compliancePercentage}%
                    </span>
                  </div>

                  {ev.officerSignature?.decisionNote && (
                    <div className="mt-2 text-[11px] text-[#7A6B5C] bg-[#FAF7F2] p-2 rounded border border-[#EDE5DA] italic line-clamp-2">
                      "{ev.officerSignature.decisionNote}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentUser.role === 'Procurement Officer' && (
        <div className="glass-panel rounded-xl p-5 border border-[#DFD5C6]">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-sm font-semibold text-[#2F241C] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#8C5832]" />
                Tender Ingestion & Intelligence Status
              </h2>
              <p className="text-xs text-[#736558] mt-0.5">
                Upload tender tender PDFs to extract mandatory checklists and benchmark thresholds
              </p>
            </div>
            <button
              onClick={() => onNavigate('tenders')}
              className="text-xs font-semibold text-[#8C5832] hover:text-[#643D21] flex items-center gap-1 cursor-pointer"
            >
              Manage All Tenders
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tenders.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTender(t);
                  onNavigate('tenders');
                }}
                className="p-3.5 rounded-lg border border-[#E6DDD0] bg-white/90 hover:bg-white transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8C6B52]">
                  <span>{t.tenderId}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#FAF5EE] border border-[#E4D8C8]">
                    {t.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#2D231C] mt-1 line-clamp-2">
                  {t.title}
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#78695C] pt-2 border-t border-[#F2ECE2]">
                  <span>Est: {t.estimatedValue}</span>
                  {t.isAnalyzed ? (
                    <span className="text-[#27663B] font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Analyzed ({t.requirements.length} Req)
                    </span>
                  ) : (
                    <span className="text-[#8C5832] font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Ready to Analyze
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentUser.role === 'Admin' && (
        <div className="glass-panel rounded-xl p-5 border border-[#DFD5C6]">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-sm font-semibold text-[#2F241C] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8C5832]" />
                CPPP Cryptographic Audit Oversight
              </h2>
              <p className="text-xs text-[#736558] mt-0.5">
                Immutable records and SHA-256 integrity logs for tender officer actions
              </p>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs font-semibold text-[#8C5832] hover:text-[#643D21] flex items-center gap-1 cursor-pointer"
            >
              View Full Audit Ledger
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#EFE7DC] bg-white/80 rounded-lg border border-[#E8E0D4] overflow-hidden text-xs">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded bg-[#F4EFE6] flex items-center justify-center text-[#8C5832] shrink-0 text-[10px] font-mono font-semibold">
                    {log.module.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#2D231C]">
                      {log.action} <span className="font-normal text-[#756557]">by {log.user} ({log.role})</span>
                    </div>
                    <div className="text-[#68594C] text-[11px] mt-0.5">
                      {log.details}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-[#8C7A6A]">{log.timestamp}</div>
                  {log.documentHash && (
                    <div className="text-[9px] font-mono text-[#9B8877] mt-0.5">{log.documentHash}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Active Tenders List + Registered Bidders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenders Overview */}
        <div className="glass-card rounded-xl p-5 border border-[#E6DED2]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#2F241C]">Active Tender Dockets</h3>
              <p className="text-xs text-[#736558]">Open public notices and evaluation stages</p>
            </div>
            <button
              onClick={() => onNavigate('tenders')}
              className="text-xs text-[#8C5832] hover:text-[#643D21] font-medium flex items-center gap-1 cursor-pointer"
            >
              All Tenders <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {tenders.map((tender) => (
              <div
                key={tender.id}
                onClick={() => {
                  onSelectTender(tender);
                  onNavigate('tenders');
                }}
                className="p-3 rounded-lg border border-[#E9E2D7] bg-[#FAF8F5]/80 hover:bg-white hover:border-[#8C5832]/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-[#8C6B52]">
                    {tender.tenderId}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-[#F0EBE1] text-[#554030] border border-[#DDD3C4]">
                    {tender.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#2D231C] mt-1 truncate">
                  {tender.title}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#7A6C5F]">
                  <span>Dept: {tender.department}</span>
                  <span className="font-mono font-medium text-[#2E241D]">
                    {tender.estimatedValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bidders Overview */}
        <div className="glass-card rounded-xl p-5 border border-[#E6DED2]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#2F241C]">Bidder Registry</h3>
              <p className="text-xs text-[#736558]">Participating vendors & technical credentials</p>
            </div>
            <button
              onClick={() => onNavigate('bidders')}
              className="text-xs text-[#8C5832] hover:text-[#643D21] font-medium flex items-center gap-1 cursor-pointer"
            >
              All Bidders <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {bidders.map((bidder) => {
              const isVerified = bidder.verificationStatus === 'Verified';
              return (
                <div
                  key={bidder.id}
                  onClick={() => {
                    onSelectBidder(bidder);
                    onNavigate('bidders');
                  }}
                  className="p-3 rounded-lg border border-[#E9E2D7] bg-[#FAF8F5]/80 hover:bg-white hover:border-[#8C5832]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2D231C] truncate">
                      {bidder.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                        isVerified
                          ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                          : 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                      }`}
                    >
                      {bidder.verificationStatus}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#7A6C5F] flex items-center gap-2">
                    <span className="font-mono">GST: {bidder.gstNumber}</span>
                    <span>•</span>
                    <span className="font-mono">PAN: {bidder.panNumber}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#7A6C5F] pt-1.5 border-t border-[#F2ECE3]">
                    <span>Turnover: <strong className="text-[#2E241D] font-mono">{bidder.annualTurnover}</strong></span>
                    <span>Exp: <strong className="text-[#2E241D] font-mono">{bidder.yearsOfExperience} Yrs</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
