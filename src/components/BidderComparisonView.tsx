import React, { useState } from 'react';
import { Bidder, Tender, BidEvaluation, UserProfile } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ShieldCheck, 
  Printer, 
  Check, 
  X,
  Scale,
  ArrowRight,
  Info
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface BidderComparisonViewProps {
  tenders: Tender[];
  bidders: Bidder[];
  selectedTender: Tender;
  evaluations: Record<string, BidEvaluation>;
  currentUser: UserProfile;
  onSelectTender: (tender: Tender) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const BidderComparisonView: React.FC<BidderComparisonViewProps> = ({
  tenders,
  bidders,
  selectedTender,
  evaluations,
  currentUser,
  onSelectTender,
  onNavigate,
  onLogAudit,
}) => {
  // Selected bidders to compare (default first two or three)
  const [selectedBidderIds, setSelectedBidderIds] = useState<string[]>([
    bidders[0]?.id || '',
    bidders[1]?.id || '',
  ]);

  const toggleBidder = (id: string) => {
    setSelectedBidderIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const comparedBidders = bidders.filter((b) => selectedBidderIds.includes(b.id));

  return (
    <div className="space-y-6">
      {/* Header and Tender Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 3 • Comparative Analysis
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Factual Comparative Statement
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Bidder Comparison Workspace
          </h2>
          <p className="text-xs text-[#736355]">
            Side-by-side factual evaluation without algorithmic ranking — procurement decisions remain exclusively with the authorized officer
          </p>
        </div>

        {/* Tender Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A6B5D] font-medium">Evaluation Docket:</span>
          <select
            value={selectedTender.id}
            onChange={(e) => {
              const t = tenders.find((item) => item.id === e.target.value);
              if (t) onSelectTender(t);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#DDD3C4] text-[#2D231C] outline-none shadow-2xs max-w-[220px] truncate"
          >
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tenderId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tender Benchmark Context Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-[#DFD5C6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">
            Tender Qualification Benchmarks ({selectedTender.tenderId})
          </div>
          <div className="font-semibold text-[#2D231C] mt-0.5">
            {selectedTender.title}
          </div>
          <div className="text-[11px] text-[#7A6B5D] mt-0.5 flex items-center gap-3">
            <span>Minimum Turnover: <strong>₹5.0 Cr</strong></span>
            <span>•</span>
            <span>Experience: <strong>3.0 Years</strong></span>
            <span>•</span>
            <span>Estimated Value: <strong>{selectedTender.estimatedValue}</strong></span>
          </div>
        </div>

        <div className="text-[11px] text-[#7A6B5D] italic">
          * GFR 2017: No automated algorithmic ranking applied.
        </div>
      </div>

      {/* Multi-Select Bidder Checkboxes */}
      <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8C6B52]">
          Select Bidders to Compare ({comparedBidders.length} Selected):
        </div>
        <div className="flex flex-wrap gap-2">
          {bidders.map((bidder) => {
            const isChecked = selectedBidderIds.includes(bidder.id);
            return (
              <button
                key={bidder.id}
                onClick={() => toggleBidder(bidder.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border ${
                  isChecked
                    ? 'bg-[#8C5832] text-white border-[#8C5832] shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#554233] border-[#DDD3C4] hover:bg-white'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                    isChecked ? 'bg-white text-[#8C5832]' : 'border border-[#C8BCAC]'
                  }`}
                >
                  {isChecked && '✓'}
                </div>
                <span>{bidder.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {comparedBidders.length > 0 ? (
        <div className="glass-card rounded-2xl border border-[#E6DDD0] overflow-hidden bg-white/95 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#ECE3D6] bg-[#F6F1E8]/80 text-[#6B5A4B] text-[11px] font-semibold">
                  <th className="py-3.5 px-4 w-48 bg-[#F2EDE4]/60 sticky left-0 z-10">
                    Procurement Parameter
                  </th>
                  {comparedBidders.map((bidder) => (
                    <th key={bidder.id} className="py-3.5 px-4 min-w-[240px] text-[#2D231C]">
                      <div className="font-bold text-xs truncate">{bidder.name}</div>
                      <div className="text-[10px] font-mono text-[#7A6B5D] mt-0.5">
                        {bidder.registrationNumber}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE0]">
                {/* 1. Company Profile */}
                <tr className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#8C6B52] bg-[#FAF8F5]/60 sticky left-0 z-10">
                    Company Legal Entity
                  </td>
                  {comparedBidders.map((b) => (
                    <td key={b.id} className="py-3 px-4 text-[#2D231C]">
                      <div>{b.entityType}</div>
                      <div className="text-[11px] text-[#7A6B5D] font-mono">
                        GST: {b.gstNumber} • PAN: {b.panNumber}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 2. Eligibility */}
                <tr className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#8C6B52] bg-[#FAF8F5]/60 sticky left-0 z-10">
                    Eligibility / MSME
                  </td>
                  {comparedBidders.map((b) => (
                    <td key={b.id} className="py-3 px-4 text-[#2D231C]">
                      <div className="font-mono text-xs font-semibold">
                        {b.msmeUdyamNumber}
                      </div>
                      <div className="text-[11px] text-[#7A6B5D]">
                        {b.isMsmeRegistered
                          ? 'Small Enterprise (EMD Exemption Eligible)'
                          : 'General Category (Non-exempt)'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 3. Turnover */}
                <tr className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#8C6B52] bg-[#FAF8F5]/60 sticky left-0 z-10">
                    Annual Turnover (3-Yr Mean)
                  </td>
                  {comparedBidders.map((b) => {
                    const satisfies = b.numericTurnover >= 5.0;
                    return (
                      <td key={b.id} className="py-3 px-4">
                        <div className="text-sm font-bold font-mono text-[#2D231C]">
                          {b.annualTurnover}
                        </div>
                        <div
                          className={`text-[11px] font-semibold mt-0.5 ${
                            satisfies ? 'text-[#1E5732]' : 'text-[#932F27]'
                          }`}
                        >
                          {satisfies
                            ? `✓ Exceeds benchmark (+₹${(b.numericTurnover - 5.0).toFixed(1)} Cr)`
                            : `✗ Deficit of ₹${(5.0 - b.numericTurnover).toFixed(1)} Cr`}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Experience */}
                <tr className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#8C6B52] bg-[#FAF8F5]/60 sticky left-0 z-10">
                    Contract Experience
                  </td>
                  {comparedBidders.map((b) => {
                    const satisfies = b.yearsOfExperience >= 3.0;
                    return (
                      <td key={b.id} className="py-3 px-4">
                        <div className="text-sm font-bold font-mono text-[#2D231C]">
                          {b.yearsOfExperience} Years
                        </div>
                        <div
                          className={`text-[11px] font-semibold mt-0.5 ${
                            satisfies ? 'text-[#1E5732]' : 'text-[#9E4D14]'
                          }`}
                        >
                          {satisfies
                            ? '✓ Fulfills 3-year threshold'
                            : `⚠ Shortfall: ${(3.0 - b.yearsOfExperience).toFixed(1)} Years`}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Technical Compliance */}
                <tr className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#8C6B52] bg-[#FAF8F5]/60 sticky left-0 z-10">
                    Technical Compliance
                  </td>
                  {comparedBidders.map((b) => (
                    <td key={b.id} className="py-3 px-4 text-xs space-y-1">
                      {b.certificates.slice(0, 2).map((cert, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[#3D2C1F]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#25633A] shrink-0" />
                          <span className="truncate">{cert}</span>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>

                {/* 6. Required Documents */}
                <tr className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#8C6B52] bg-[#FAF8F5]/60 sticky left-0 z-10">
                    Required Documents Submitted
                  </td>
                  {comparedBidders.map((b) => (
                    <td key={b.id} className="py-3 px-4">
                      <div className="font-semibold text-xs text-[#2D231C]">
                        {b.documents.length} of {selectedTender.mandatoryDocuments.length} mandatory documents
                      </div>
                      <div className="text-[11px] text-[#7A6B5D]">
                        All files OCR extracted & indexed
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 7. Compliance Status */}
                <tr className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#8C6B52] bg-[#FAF8F5]/60 sticky left-0 z-10">
                    Compliance Status
                  </td>
                  {comparedBidders.map((b) => {
                    const evalRecord = evaluations[`${selectedTender.id}_${b.id}`];
                    const status = evalRecord?.evaluationStatus || 'Under Review';
                    const isEligible = status === 'Eligible for Financial Bid';
                    return (
                      <td key={b.id} className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            isEligible
                              ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                              : status === 'Technically Disqualified'
                              ? 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
                              : 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                          }`}
                        >
                          {status}
                        </span>
                        {evalRecord && (
                          <div className="text-[10px] font-mono text-[#7A6B5D] mt-1">
                            Score: {evalRecord.compliancePercentage}% Compliance
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Verification Status & Officer Decision Action */}
                <tr className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#8C6B52] bg-[#FAF8F5]/60 sticky left-0 z-10">
                    Officer Decision
                  </td>
                  {comparedBidders.map((b) => (
                    <td key={b.id} className="py-3 px-4">
                      <button
                        onClick={() =>
                          onNavigate('compliance', {
                            tenderId: selectedTender.id,
                            bidderId: b.id,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#D5C9B8] hover:bg-[#FAF6F0] text-xs font-semibold text-[#4A3423] cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>Examine Evidence</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[#8A7969] bg-white rounded-2xl border border-[#E8E0D4]">
          Select at least one bidder to view the comparative statement.
        </div>
      )}
    </div>
  );
};
