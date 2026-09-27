import React, { useState } from 'react';
import { Tender, Bidder, BidEvaluation, UserProfile, RepoDocument } from '../types';
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  Save, 
  Check, 
  FileCheck2,
  Lock,
  Layers,
  FileBarChart
} from 'lucide-react';

interface ReportsViewProps {
  tenders: Tender[];
  bidders: Bidder[];
  selectedTender: Tender;
  selectedBidder: Bidder;
  evaluations: Record<string, BidEvaluation>;
  currentUser: UserProfile;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
  onSaveReport?: (doc: RepoDocument) => void;
  onLogAudit?: (action: string, module: any, details: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  tenders,
  bidders,
  selectedTender,
  selectedBidder,
  evaluations,
  currentUser,
  onSelectTender,
  onSelectBidder,
  onSaveReport,
  onLogAudit,
}) => {
  const evalKey = `${selectedTender.id}_${selectedBidder.id}`;
  const evaluation = evaluations[evalKey];

  // Report Generator Modal State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [reportType, setReportType] = useState('Consolidated Bid Compliance Report');
  const [officerRemarks, setOfficerRemarks] = useState(
    evaluation?.officerSignature?.decisionNote || 
    'All mandatory documents and statutory requirements verified against primary government databases. Bidder meets qualifying technical benchmarks.'
  );
  const [officerDecision, setOfficerDecision] = useState<string>(
    evaluation?.evaluationStatus || 'Eligible for Financial Bid'
  );
  const [isSavedToRepo, setIsSavedToRepo] = useState(false);

  // Filtered Discrepancies
  const discrepancies = evaluation?.matches.filter(
    (m) => m.matchStatus === 'Does Not Meet' || m.matchStatus === 'Under Review'
  ) || [];

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmGenerateReport = () => {
    const reportId = `rep-${Date.now()}`;
    const filename = `CPPP_${selectedTender.tenderId.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedBidder.name.replace(/\s+/g, '_')}_EvalReport.pdf`;
    
    if (onSaveReport) {
      const newRepoDoc: RepoDocument = {
        id: reportId,
        name: filename,
        type: 'Consolidated Technical Bid Report',
        version: 'v1.0 (Signed)',
        folder: 'Generated Reports',
        uploadedBy: `${currentUser.name} (${currentUser.role})`,
        uploadDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        status: 'Signed',
        fileSize: '820 KB',
        tenderId: selectedTender.id,
        bidderId: selectedBidder.id,
        documentHash: `SHA256:${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      };
      onSaveReport(newRepoDoc);
    }

    if (onLogAudit) {
      onLogAudit(
        'Bid Report Generated & Signed',
        'Officer Review',
        `Generated consolidated technical bid report for ${selectedBidder.name} on ${selectedTender.tenderId}. Final Decision: "${officerDecision}". Stored in Document Repository.`
      );
    }

    setIsSavedToRepo(true);
    setTimeout(() => {
      setIsSavedToRepo(false);
      setIsGeneratorOpen(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header and Print Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 3 • Formal Documentation
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              GFR Rule 173
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Consolidated Bid Evaluation Report
          </h2>
          <p className="text-xs text-[#736355]">
            Formal government procurement compliance summary with evidence traceability and digital officer endorsement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selectors */}
          <select
            value={selectedTender.id}
            onChange={(e) => {
              const t = tenders.find((item) => item.id === e.target.value);
              if (t) onSelectTender(t);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-white border border-[#DDD3C4] text-[#2D231C]"
          >
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tenderId}
              </option>
            ))}
          </select>

          <select
            value={selectedBidder.id}
            onChange={(e) => {
              const b = bidders.find((item) => item.id === e.target.value);
              if (b) onSelectBidder(b);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-white border border-[#DDD3C4] text-[#2D231C]"
          >
            {bidders.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Generate Report Action */}
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Bid Report</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-[#3D2C1F] hover:bg-[#FAF8F5] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Official Report Document */}
      <div className="glass-card rounded-2xl p-8 border border-[#DFD5C6] bg-white shadow-sm max-w-4xl mx-auto space-y-6 text-[#2D231C]">
        {/* Government Header Banner */}
        <div className="text-center pb-6 border-b border-[#ECE3D6] space-y-1">
          <div className="text-xs uppercase tracking-widest font-bold text-[#8C6B52]">
            Government of India • Central Public Procurement Portal (CPPP)
          </div>
          <h1 className="text-base font-bold text-[#2D231C] tracking-tight">
            CONSOLIDATED TECHNICAL BID COMPLIANCE & ELIGIBILITY REPORT
          </h1>
          <div className="text-xs text-[#7A6B5D] font-mono">
            Document Reference: CPPP/EVAL/2026/{selectedTender.tenderId.replace(/[^a-zA-Z0-9]/g, '-')}/{selectedBidder.id}
          </div>
        </div>

        {/* Tender & Bidder Particulars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
            <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">1. Tender Particulars</div>
            <div><strong>Tender ID:</strong> {selectedTender.tenderId}</div>
            <div><strong>Title:</strong> {selectedTender.title}</div>
            <div><strong>Issuing Dept:</strong> {selectedTender.department}</div>
            <div><strong>Estimated Value:</strong> {selectedTender.estimatedValue}</div>
            <div><strong>Closing Date:</strong> {selectedTender.closingDate}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
            <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">2. Bidder Particulars</div>
            <div><strong>Company Name:</strong> {selectedBidder.name}</div>
            <div><strong>Corporate CIN:</strong> {selectedBidder.registrationNumber}</div>
            <div><strong>GSTIN:</strong> {selectedBidder.gstNumber}</div>
            <div><strong>PAN Number:</strong> {selectedBidder.panNumber}</div>
            <div><strong>MSME/Udyam:</strong> {selectedBidder.msmeUdyamNumber}</div>
          </div>
        </div>

        {/* Evaluation Verdict Highlight */}
        {evaluation && (
          <div className="p-4 rounded-xl border border-[#DFD3C2] bg-[#FAF5EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#8C6B52] uppercase">
                3. Verification Results & Verdict
              </div>
              <div className="text-sm font-bold text-[#2D231C] mt-0.5">
                {officerDecision} ({evaluation.compliancePercentage}% Compliance)
              </div>
              <div className="text-xs text-[#716153] mt-0.5">
                {evaluation.metRequirements} of {evaluation.totalRequirements} criteria satisfied under GFR Rule 173.
              </div>
            </div>

            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 text-center ${
                officerDecision === 'Eligible for Financial Bid'
                  ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                  : 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
              }`}
            >
              {officerDecision}
            </span>
          </div>
        )}

        {/* Discrepancy Callout (if any) */}
        {discrepancies.length > 0 && (
          <div className="p-4 rounded-xl border border-[#F2C9C5] bg-[#FDF7F6] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#932F27] uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-[#932F27]" />
              <span>4. Documented Discrepancies & Deficits</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#5C2B27]">
              {discrepancies.map((d, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white border border-[#F2C9C5]">
                    {d.requirementId}
                  </span>
                  <div>
                    <strong>{d.requirementTitle}:</strong> Required benchmark "{d.tenderBenchmark}". Provided evidence: "{d.bidderEvidence}".
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Compliance Evidence Table */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
            5. Tender Requirements & Evidence Verification Matrix
          </div>
          <div className="border border-[#ECE3D6] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#ECE3D6] text-[#716153] text-[11px] font-semibold">
                  <th className="py-2.5 px-3">Tender Criterion</th>
                  <th className="py-2.5 px-3">Tender Benchmark</th>
                  <th className="py-2.5 px-3">Bidder Evidence</th>
                  <th className="py-2.5 px-3">Document Source</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE0]">
                {evaluation?.matches.map((m, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-semibold text-[#2D231C]">
                      {m.requirementTitle}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#8C5832]">
                      {m.tenderBenchmark}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#2D231C]">
                      {m.bidderEvidence}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#7A6B5D]">
                      {m.sourceDocName} (P.{m.sourcePage})
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          m.matchStatus === 'Meets Requirement'
                            ? 'bg-[#EEF6F0] text-[#1E5732]'
                            : 'bg-[#FDF1EF] text-[#932F27]'
                        }`}
                      >
                        {m.matchStatus === 'Meets Requirement' ? '✓ Meets' : '✕ Deficit'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Digital Signature & Endorsement Stamp */}
        <div className="pt-6 border-t border-[#ECE3D6] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
              6. Officer Remarks
            </div>
            <p className="mt-1 text-[#6F6052] italic leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE5DA]">
              "{officerRemarks}"
            </p>
          </div>

          <div className="border border-dashed border-[#DDD3C4] rounded-xl p-4 bg-[#FAF8F5] text-right space-y-1">
            <div className="text-[10px] font-semibold uppercase text-[#8C6B52] flex items-center justify-end gap-1">
              <Lock className="w-3 h-3 text-[#8C5832]" />
              <span>Digitally Signed & Validated</span>
            </div>
            <div className="font-bold text-[#2D231C]">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-[#7A6B5D]">
              {currentUser.role} • {currentUser.department}
            </div>
            <div className="text-[10px] font-mono text-[#8C7A6A] pt-1">
              Timestamp: {evaluation?.officerSignature?.timestamp || '2026-09-24 16:30 IST'}
            </div>
            <div className="text-[9px] font-mono text-[#25633A]">
              Cryptographic Hash: SHA256:7f9a88e1...41cb
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Generation Configuration & Live Preview Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl max-w-2xl w-full border border-[#DFD5C6] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E8E0D4] bg-[#FAF7F2] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#8C6B52]">
                  Report Pre-Generation & Verification
                </span>
                <h3 className="text-sm font-bold text-[#2C211A] mt-0.5">
                  Generate Consolidated Bid Evaluation Report
                </h3>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="w-7 h-7 rounded-lg text-[#7A6B5D] hover:bg-[#EFE8DD] flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Report Category */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3525] mb-1">
                  Report Type / Template:
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-[#2D231C]"
                >
                  <option value="Consolidated Bid Compliance Report">Consolidated Bid Compliance Report (Full Stage 1)</option>
                  <option value="Tender Summary Evaluation">Tender Summary Evaluation (Committee Submission)</option>
                  <option value="Discrepancy & Gap Notice">Discrepancy & Gap Notice (Under GFR Rule 173)</option>
                  <option value="Technical Audit Record">Technical Audit Record (Forensic Record)</option>
                </select>
              </div>

              {/* Final Officer Decision */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3525] mb-1">
                  Final Officer Decision:
                </label>
                <select
                  value={officerDecision}
                  onChange={(e) => setOfficerDecision(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] font-semibold text-[#2D231C]"
                >
                  <option value="Eligible for Financial Bid">Eligible for Financial Bid (100% Meets Technical Criteria)</option>
                  <option value="Technically Disqualified">Technically Disqualified (Substantive Deficit)</option>
                  <option value="Clarification Required">Clarification Required (Pending Documentation)</option>
                  <option value="Qualified Subject to Undertaking">Qualified Subject to Undertaking (MSME Exemption)</option>
                </select>
              </div>

              {/* Officer Remarks */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3525] mb-1">
                  Officer Remarks & Committee Justification:
                </label>
                <textarea
                  rows={3}
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD3C4] text-[#2D231C] outline-none"
                  placeholder="Enter official justification and reference to GFR rules..."
                />
              </div>

              {/* Report Preview Summary Card */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDD0] space-y-1.5">
                <div className="text-[10px] font-semibold uppercase text-[#8C6B52] flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#8C5832]" />
                  <span>Report Output Particulars:</span>
                </div>
                <div className="text-[11px] text-[#554233] space-y-0.5">
                  <div>• Tender: <strong>{selectedTender.tenderId}</strong> — {selectedTender.title}</div>
                  <div>• Bidder: <strong>{selectedBidder.name}</strong></div>
                  <div>• Verified Criteria: <strong>{evaluation?.totalRequirements || 7} requirements checked</strong></div>
                  <div>• Status: <strong className="text-[#8C5832]">{officerDecision}</strong></div>
                  <div>• Destination: Secure Document Repository / Generated Reports</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#E8E0D4] bg-[#FAF7F2] flex items-center justify-between">
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-[#DDD3C4] text-xs font-semibold text-[#554233] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmGenerateReport}
                disabled={isSavedToRepo}
                className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                {isSavedToRepo ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Report Saved to Repository!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Confirm & Generate Official Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
