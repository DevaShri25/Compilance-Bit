import React, { useState } from 'react';
import { 
  Tender, 
  Bidder, 
  MultiSourceVerification, 
  CrossDocValidationItem, 
  UserProfile 
} from '../types';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Globe, 
  Building2, 
  Scale, 
  ShieldCheck, 
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface MultiSourceValidationViewProps {
  tenders: Tender[];
  bidders: Bidder[];
  selectedTender: Tender;
  selectedBidder: Bidder;
  multiSources: MultiSourceVerification[];
  crossDocChecks: CrossDocValidationItem[];
  currentUser: UserProfile;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const MultiSourceValidationView: React.FC<MultiSourceValidationViewProps> = ({
  tenders,
  bidders,
  selectedTender,
  selectedBidder,
  multiSources,
  crossDocChecks,
  currentUser,
  onSelectTender,
  onSelectBidder,
  onNavigate,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'multi-source' | 'cross-doc'>('multi-source');

  const mismatchesCount = crossDocChecks.filter((c) => c.hasMismatch).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Dual Context Pickers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 2 • Multi-Source Cross-Check
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Cross-Document Validation Engine
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Multi-Source Verification & Document Cross-Checking
          </h2>
          <p className="text-xs text-[#736355]">
            Cross-references bidder documentation against live government registries (MCA21, GSTN, MSME, ICAI UDIN)
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

      {/* Mode Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          onClick={() => setActiveTab('multi-source')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'multi-source'
              ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
              : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
          }`}
        >
          Multi-Source Registry Comparison ({multiSources.length})
        </button>
        <button
          onClick={() => setActiveTab('cross-doc')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'cross-doc'
              ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
              : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
          }`}
        >
          <span>Cross-Document Validation Matrix ({crossDocChecks.length})</span>
          {mismatchesCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FFF4EC] text-[#9E4D14] border border-[#F3D9C3] font-mono">
              {mismatchesCount} Variances
            </span>
          )}
        </button>
      </div>

      {/* SECTION 1: MULTI-SOURCE VERIFICATION (Feature 2) */}
      {activeTab === 'multi-source' && (
        <div className="space-y-4">
          <div className="text-xs text-[#7A6B5D]">
            For every crucial criterion, values are cross-checked across 4 independent sources: <strong>Bidder Document</strong>, <strong>Government Verification API</strong>, <strong>Tender Requirement Benchmark</strong>, and <strong>Financial/Technical Evidence</strong>.
          </div>

          <div className="grid grid-cols-1 gap-4">
            {multiSources.map((ms) => {
              const isVerified = ms.status === 'Verified';
              return (
                <div
                  key={ms.id}
                  className="glass-card rounded-2xl p-5 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#F0EAE0]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6B52]">
                        {ms.field}
                      </span>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                        isVerified
                          ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                          : 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                      }`}
                    >
                      {isVerified ? '✓ Verified Source Match' : '⚠ Potential Mismatch / Variance'}
                    </span>
                  </div>

                  {/* 4 Source Columns Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Source 1: Bidder Document */}
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                      <div className="text-[10px] font-semibold uppercase text-[#8C6B52] flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>1. Bidder Document</span>
                      </div>
                      <div className="font-semibold text-[#2D231C] text-xs">
                        {ms.bidderDocValue}
                      </div>
                      <div className="text-[11px] text-[#7A6B5D] truncate">
                        {ms.bidderDocSource}
                      </div>
                    </div>

                    {/* Source 2: Government Verification Source */}
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                      <div className="text-[10px] font-semibold uppercase text-[#8C6B52] flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[#1B5277]" />
                        <span>2. Government Registry</span>
                      </div>
                      <div className="font-semibold text-[#2D231C] text-xs">
                        {ms.govtValue}
                      </div>
                      <div className="text-[11px] text-[#7A6B5D] truncate">
                        {ms.govtSource}
                      </div>
                    </div>

                    {/* Source 3: Tender Requirement */}
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                      <div className="text-[10px] font-semibold uppercase text-[#8C6B52] flex items-center gap-1">
                        <Scale className="w-3 h-3 text-[#8C5832]" />
                        <span>3. Tender Requirement</span>
                      </div>
                      <div className="font-semibold text-[#2D231C] text-xs">
                        {ms.tenderBenchmark}
                      </div>
                      <div className="text-[11px] text-[#7A6B5D]">
                        Tender RFP Clause
                      </div>
                    </div>

                    {/* Source 4: Financial/Technical Evidence */}
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                      <div className="text-[10px] font-semibold uppercase text-[#8C6B52] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#25633A]" />
                        <span>4. Third-Party Audit</span>
                      </div>
                      <div className="font-semibold text-[#2D231C] text-xs">
                        {ms.financialOrTechEvidence}
                      </div>
                      <div className="text-[11px] text-[#7A6B5D]">
                        CA / Testing Lab / UDIN
                      </div>
                    </div>
                  </div>

                  {/* Officer Remarks / Guidance */}
                  {ms.officerRemarks && (
                    <div className="p-2.5 rounded-lg bg-[#FAF5EE] border border-[#EADBCA] text-xs text-[#523E2E] leading-relaxed">
                      <strong>Committee Analysis:</strong> {ms.officerRemarks}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: CROSS-DOCUMENT VALIDATION (Feature 3) */}
      {activeTab === 'cross-doc' && (
        <div className="space-y-4">
          <div className="text-xs text-[#7A6B5D]">
            Automated cross-document consistency audit comparing <strong>Company Name</strong>, <strong>GST</strong>, <strong>PAN</strong>, <strong>Registration Number</strong>, <strong>Turnover</strong>, <strong>Dates</strong>, <strong>Experience</strong>, and <strong>Certificate numbers</strong> across separate uploaded documents.
          </div>

          <div className="glass-card rounded-2xl border border-[#E6DDD0] overflow-hidden bg-white/90 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#ECE3D6] bg-[#F6F1E8]/70 text-[#6B5A4B] text-[11px] font-semibold">
                    <th className="py-3 px-4 w-[18%]">Audited Parameter</th>
                    <th className="py-3 px-4 w-[30%]">Document 1 Record</th>
                    <th className="py-3 px-4 w-[30%]">Document 2 Record</th>
                    <th className="py-3 px-4 w-[22%] text-center">Consistency Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE0]">
                  {crossDocChecks.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                        item.hasMismatch ? 'bg-[#FFFDF9]' : ''
                      }`}
                    >
                      {/* Parameter */}
                      <td className="py-3.5 px-4 font-semibold text-[#2D231C] align-top">
                        <div>{item.field}</div>
                      </td>

                      {/* Doc 1 */}
                      <td className="py-3.5 px-4 align-top space-y-0.5">
                        <div className="font-mono font-semibold text-xs text-[#2D231C]">
                          {item.doc1Value}
                        </div>
                        <div className="text-[11px] text-[#7A6B5D] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#8C5832] shrink-0" />
                          <span>{item.doc1Name}</span>
                        </div>
                      </td>

                      {/* Doc 2 */}
                      <td className="py-3.5 px-4 align-top space-y-0.5">
                        <div className="font-mono font-semibold text-xs text-[#2D231C]">
                          {item.doc2Value}
                        </div>
                        <div className="text-[11px] text-[#7A6B5D] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#8C5832] shrink-0" />
                          <span>{item.doc2Name}</span>
                        </div>
                      </td>

                      {/* Consistency Result with Subtle Warning (Not Alarming) */}
                      <td className="py-3.5 px-4 align-top text-center">
                        {item.hasMismatch ? (
                          <div className="space-y-1 inline-block text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFF8EB] text-[#8C5D17] border border-[#F0DDBE]">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{item.field} variance detected</span>
                            </span>
                            {item.mismatchMessage && (
                              <div className="text-[10px] text-[#7A6B5D] leading-tight max-w-[200px]">
                                {item.mismatchMessage}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#EEF6F0] text-[#1E5732] border border-[#C4DFC8]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>100% Identical</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
