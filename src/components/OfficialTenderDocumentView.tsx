import React, { useRef } from 'react';
import { Tender, UserProfile } from '../types';
import { 
  Printer, 
  Download, 
  Edit3, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Building, 
  Scale, 
  ArrowLeft,
  Share2,
  Lock,
  ExternalLink
} from 'lucide-react';

interface OfficialTenderDocumentViewProps {
  tender: Tender;
  currentUser?: UserProfile;
  isProcurementOfficer?: boolean;
  onEdit?: () => void;
  onPublish?: () => void;
  onSendToCompanyPortal?: () => void;
  onClose?: () => void;
}

export const OfficialTenderDocumentView: React.FC<OfficialTenderDocumentViewProps> = ({
  tender,
  currentUser,
  isProcurementOfficer = false,
  onEdit,
  onPublish,
  onSendToCompanyPortal,
  onClose,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Trigger standard browser print/save as PDF dialog
    window.print();
  };

  // Derive dynamic reference codes and dates
  const tenderRefNo = tender.tenderId || `CPPP/2026/PROC/${tender.id.toUpperCase()}`;
  const tenderIssueDate = tender.publishedDate || tender.openingDate || new Date().toISOString().split('T')[0];
  const tenderClosingDate = tender.closingDate || '2026-10-31';
  const tenderOpeningDate = tender.openingDate || '2026-10-01';

  return (
    <div className="space-y-4">
      {/* Top Document Action Bar */}
      <div className="no-print glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/95 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#DDD3C4] text-[#553E2B] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              title="Return"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#8C6B52] uppercase tracking-wider">
                Official Document Preview
              </span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${
                tender.status === 'Active'
                  ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                  : 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
              }`}>
                {tender.status}
              </span>
            </div>
            <h2 className="text-sm font-bold text-[#2D231C]">
              {tender.tenderId} — Government Procurement Dossier
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isProcurementOfficer && onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 rounded-lg border border-[#DDD3C4] text-[#4A3525] hover:bg-[#FAF8F5] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#8C5832]" />
              <span>Edit Tender</span>
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-1.5 rounded-lg border border-[#DDD3C4] bg-[#FAF8F5] hover:bg-white text-[#4A3525] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#8C5832]" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg border border-[#DDD3C4] bg-white hover:bg-[#FAF8F5] text-[#4A3525] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#8C5832]" />
            <span>Print Official Notice</span>
          </button>

          {isProcurementOfficer && tender.status !== 'Active' && onPublish && (
            <button
              onClick={onPublish}
              className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publish Tender</span>
            </button>
          )}

          {isProcurementOfficer && onSendToCompanyPortal && (
            <button
              onClick={onSendToCompanyPortal}
              className="px-4 py-1.5 rounded-lg bg-[#25633A] text-white hover:bg-[#1E522E] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send to Company Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================== FORMAL GOVERNMENT TENDER DOCUMENT CONTAINER ==================== */}
      <div 
        ref={documentRef}
        className="official-document-sheet bg-[#FFFFFF] text-[#1A1A1A] p-8 md:p-12 rounded-xl shadow-md border border-[#D5C9B8] font-serif max-w-4xl mx-auto space-y-8 relative leading-relaxed"
        style={{
          boxShadow: '0 4px 20px rgba(78, 54, 34, 0.08)',
        }}
      >
        {/* Subtle Official Watermark Background */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none overflow-hidden"
          style={{ transform: 'rotate(-30deg)' }}
        >
          <div className="text-8xl font-black text-[#5C3E25] tracking-widest text-center uppercase">
            GOVERNMENT OF INDIA<br />CPPP E-PROCUREMENT
          </div>
        </div>

        {/* ==================== SECTION 1: GOVERNMENT / DEPARTMENT HEADER ==================== */}
        <div className="border-b-2 border-[#2D231C] pb-6 text-center space-y-2">
          <div className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#6B5542]">
            CENTRAL PUBLIC PROCUREMENT PORTAL (CPPP) • GOVERNMENT OF INDIA
          </div>

          <div className="text-xl md:text-2xl font-bold uppercase tracking-tight text-[#1A140F]">
            {tender.department || 'MINISTRY OF ROAD TRANSPORT & HIGHWAYS'}
          </div>

          <div className="text-xs font-sans text-[#524132] font-medium tracking-wide">
            PROCUREMENT & CONTRACT EVALUATION DIVISION • NEW DELHI - 110001
          </div>

          <div className="pt-2">
            <span className="inline-block px-4 py-1 bg-[#F5EFE6] border border-[#D0C2B0] text-[#4A321E] text-xs font-sans font-bold uppercase tracking-wider rounded">
              NOTICE INVITING TENDER (NIT) — TWO-STAGE OPEN E-TENDER
            </span>
          </div>
        </div>

        {/* ==================== SECTIONS 2, 3, 4, 5: TITLE, REF NO, TENDER ID, DATE ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans p-4 bg-[#FBF9F6] border border-[#E0D7C9] rounded-lg">
          <div className="space-y-1">
            <div>
              <span className="font-bold text-[#6B5542] uppercase text-[10px]">Tender Reference Number:</span>
              <div className="font-mono font-bold text-sm text-[#1A140F]">{tenderRefNo}</div>
            </div>
            <div>
              <span className="font-bold text-[#6B5542] uppercase text-[10px]">Portal Tender ID:</span>
              <div className="font-mono text-xs text-[#1A140F] font-semibold">{tender.tenderId}</div>
            </div>
            <div>
              <span className="font-bold text-[#6B5542] uppercase text-[10px]">Tender Category:</span>
              <div className="text-xs text-[#1A140F] font-semibold">{tender.category}</div>
            </div>
          </div>

          <div className="space-y-1 sm:text-right">
            <div>
              <span className="font-bold text-[#6B5542] uppercase text-[10px]">Date of Issue / Publication:</span>
              <div className="font-mono text-xs font-semibold text-[#1A140F]">{tenderIssueDate}</div>
            </div>
            <div>
              <span className="font-bold text-[#6B5542] uppercase text-[10px]">Bid Submission Opening Date:</span>
              <div className="font-mono text-xs font-semibold text-[#1A140F]">{tenderOpeningDate} (10:00 Hrs IST)</div>
            </div>
            <div>
              <span className="font-bold text-[#6B5542] uppercase text-[10px]">Bid Submission Closing Date:</span>
              <div className="font-mono text-xs font-bold text-[#8C3A27]">{tenderClosingDate} (17:30 Hrs IST)</div>
            </div>
          </div>
        </div>

        {/* SECTION 2: TENDER TITLE */}
        <div className="space-y-1">
          <h1 className="text-lg md:text-xl font-bold text-[#1A140F] text-center border-y border-[#DDD0BF] py-3 uppercase tracking-tight">
            {tender.title}
          </h1>
          <div className="text-center font-sans text-xs text-[#6B5542]">
            Estimated Procurement Value: <strong className="text-[#8C5832] font-bold text-sm">{tender.estimatedValue}</strong> (INR)
          </div>
        </div>

        {/* ==================== SECTION 6: TENDER DESCRIPTION & PREAMBLE ==================== */}
        <div className="space-y-2">
          <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[#3D2C1E] border-b border-[#E8DEC8] pb-1">
            1.0 Preamble & Tender Description
          </h3>
          <p className="text-xs text-[#2A2016] text-justify leading-relaxed">
            The Competent Authority on behalf of the President of India invites online electronic bids in two-cover 
            system (Technical Bid and Financial Bid) from qualified, eligible, and registered contractors / vendors 
            for the turnkey execution and supply as per General Financial Rules (GFR), 2017 Rules 144, 149, and 173.
          </p>
          {tender.description && (
            <p className="text-xs text-[#2A2016] text-justify leading-relaxed font-sans bg-[#FAF7F2] p-3 rounded border border-[#EBE2D5]">
              {tender.description}
            </p>
          )}
        </div>

        {/* ==================== SECTION 7: SCOPE OF WORK ==================== */}
        <div className="space-y-2">
          <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[#3D2C1E] border-b border-[#E8DEC8] pb-1">
            2.0 Scope of Work & Deliverables
          </h3>
          <p className="text-xs text-[#2A2016] text-justify">
            The scope of work encompasses turnkey design, supply, testing, deployment, and comprehensive commissioning 
            with statutory warranties and operation maintenance:
          </p>
          <ul className="list-decimal list-inside text-xs text-[#2A2016] space-y-1 font-sans pl-2">
            <li>End-to-end site survey, engineering preparation, and civil infrastructure readiness.</li>
            <li>Procurement and installation of certified hardware, controllers, sensors, and telemetry units.</li>
            <li>Integration with central state/national control interfaces and secure cloud SCADA data pipelines.</li>
            <li>24x7 SLA-backed monitoring, annual maintenance support (AMC) for a minimum period of 36 calendar months.</li>
            <li>Provision of technical documentation, standard operating manuals, and operational personnel training.</li>
          </ul>
        </div>

        {/* ==================== SECTION 8: TECHNICAL SPECIFICATIONS ==================== */}
        <div className="space-y-2">
          <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[#3D2C1E] border-b border-[#E8DEC8] pb-1">
            3.0 Technical Specifications & Standards Compliance
          </h3>
          <div className="font-sans text-xs space-y-1.5">
            <p className="text-[#2A2016]">All submitted equipment and works must strictly conform to national standards:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(tender.technicalRequirements && tender.technicalRequirements.length > 0 
                ? tender.technicalRequirements 
                : [
                    'ISO 9001:2015 Quality Management Systems Certified',
                    'ISO 27001 Information Security Management Standards',
                    'Class-1 Enlistment with Central / State Government Department',
                    'OEM Manufacturer Authorization Certificate (MAF) with valid warranty'
                  ]
              ).map((tech, i) => (
                <div key={i} className="p-2 rounded bg-[#F8F5EF] border border-[#E3D9C9] flex items-start gap-2">
                  <span className="font-bold text-[#8C5832] text-[10px]">3.{i+1}</span>
                  <span className="text-[#2D231C] text-xs">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== SECTION 9, 10, 11: ELIGIBILITY, FINANCIAL & EXPERIENCE CRITERIA ==================== */}
        <div className="space-y-3">
          <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[#3D2C1E] border-b border-[#E8DEC8] pb-1">
            4.0 Minimum Eligibility & Qualification Benchmarks
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans border-collapse border border-[#DDD3C4]">
              <thead>
                <tr className="bg-[#F0E8DC] text-[#3D2C1E] font-bold text-[11px]">
                  <th className="border border-[#DDD3C4] p-2 text-left w-12">Clause</th>
                  <th className="border border-[#DDD3C4] p-2 text-left">Evaluation Parameter</th>
                  <th className="border border-[#DDD3C4] p-2 text-left">Prescribed Mandatory Benchmark</th>
                  <th className="border border-[#DDD3C4] p-2 text-left">Documentary Evidence Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE2D5]">
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-mono font-bold text-[#6B5542]">4.1</td>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">Statutory Incorporation</td>
                  <td className="border border-[#DDD3C4] p-2">Duly registered under Companies Act 2013 or LLP Act</td>
                  <td className="border border-[#DDD3C4] p-2">Certificate of Incorporation & RoC MCA21 filing</td>
                </tr>
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-mono font-bold text-[#6B5542]">4.2</td>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">GSTIN & Tax Compliance</td>
                  <td className="border border-[#DDD3C4] p-2">Active regular GST registration with filed returns</td>
                  <td className="border border-[#DDD3C4] p-2">GST REG-06 Certificate and GSTR-3B filings</td>
                </tr>
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-mono font-bold text-[#6B5542]">4.3</td>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">Annual Financial Turnover</td>
                  <td className="border border-[#DDD3C4] p-2 font-bold text-[#8C5832]">
                    {tender.minimumTurnover || '₹5.00 Crore average over past 3 financial years'}
                  </td>
                  <td className="border border-[#DDD3C4] p-2">CA Audited Balance Sheets with UDIN</td>
                </tr>
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-mono font-bold text-[#6B5542]">4.4</td>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">Past Work Experience</td>
                  <td className="border border-[#DDD3C4] p-2 font-bold text-[#8C5832]">
                    {tender.experienceRequirements || 'Minimum 3 Years executing similar public contracts'}
                  </td>
                  <td className="border border-[#DDD3C4] p-2">Work Orders & Satisfactory Completion Certificates</td>
                </tr>
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-mono font-bold text-[#6B5542]">4.5</td>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">MSME / Public Preference</td>
                  <td className="border border-[#DDD3C4] p-2">Public Procurement Policy for Micro & Small Enterprises</td>
                  <td className="border border-[#DDD3C4] p-2">Valid Udyam Registration Certificate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================== SECTION 13: MANDATORY DOCUMENTS CHECKLIST ==================== */}
        <div className="space-y-2">
          <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[#3D2C1E] border-b border-[#E8DEC8] pb-1">
            5.0 Mandatory Documents Schedule (Cover-1: Technical Dossier)
          </h3>
          <p className="text-xs text-[#2A2016]">
            Bidders must upload clear, legible, digitally signed copies of the following documents:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
            {tender.mandatoryDocuments.map((doc, idx) => (
              <div key={idx} className="p-2.5 rounded bg-[#FAF8F5] border border-[#DDD3C4] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE2D5] text-[#553E2B] flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-[#2D231C]">{doc}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#8C5832] bg-[#F3EDE2] px-1.5 py-0.5 rounded border border-[#DECDB8]">
                  Mandatory
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== SECTION 14 & 15: TENDER SCHEDULE & IMPORTANT DATES ==================== */}
        <div className="space-y-2">
          <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[#3D2C1E] border-b border-[#E8DEC8] pb-1">
            6.0 Tender Schedule & Critical Milestones
          </h3>

          <div className="overflow-x-auto font-sans text-xs">
            <table className="w-full border-collapse border border-[#DDD3C4]">
              <thead>
                <tr className="bg-[#F0E8DC] text-[#3D2C1E] font-bold text-[11px]">
                  <th className="border border-[#DDD3C4] p-2 text-left">Event / Milestone</th>
                  <th className="border border-[#DDD3C4] p-2 text-left">Date & Time</th>
                  <th className="border border-[#DDD3C4] p-2 text-left">Venue / Medium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE2D5]">
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">Tender Publishing Date</td>
                  <td className="border border-[#DDD3C4] p-2 font-mono">{tenderIssueDate} (10:00 Hrs)</td>
                  <td className="border border-[#DDD3C4] p-2">Central Public Procurement Portal (CPPP)</td>
                </tr>
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">Document Download Start Date</td>
                  <td className="border border-[#DDD3C4] p-2 font-mono">{tenderOpeningDate} (10:00 Hrs)</td>
                  <td className="border border-[#DDD3C4] p-2">Online Portal (24x7)</td>
                </tr>
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">Pre-Bid Clarification Meeting</td>
                  <td className="border border-[#DDD3C4] p-2 font-mono">7 Days prior to closing (14:30 Hrs)</td>
                  <td className="border border-[#DDD3C4] p-2">Hybrid (Committee Room & Video Conference)</td>
                </tr>
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">Bid Submission End Date</td>
                  <td className="border border-[#DDD3C4] p-2 font-mono font-bold text-[#8C3A27]">{tenderClosingDate} (17:30 Hrs)</td>
                  <td className="border border-[#DDD3C4] p-2">Online e-Submission Portal</td>
                </tr>
                <tr>
                  <td className="border border-[#DDD3C4] p-2 font-semibold">Technical Bid Opening Date</td>
                  <td className="border border-[#DDD3C4] p-2 font-mono">{tenderClosingDate} + 1 Day (11:00 Hrs)</td>
                  <td className="border border-[#DDD3C4] p-2">Tender Opening Committee Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================== SECTION 16, 17: SUBMISSION & EVALUATION CRITERIA ==================== */}
        <div className="space-y-2">
          <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[#3D2C1E] border-b border-[#E8DEC8] pb-1">
            7.0 Bid Submission & Evaluation Procedure
          </h3>
          <div className="text-xs text-[#2A2016] space-y-1.5 text-justify">
            <p>
              <strong>7.1 Two-Cover Online System:</strong> Cover-1 shall contain technical and qualification 
              eligibility documents. Cover-2 shall contain the Price Bid / BoQ. Cover-2 of only technically 
              qualified bidders shall be opened.
            </p>
            <p>
              <strong>7.2 Algorithmic Verification & Clarification:</strong> Documents will undergo computerized 
              compliance checks against statutory registries. In case of ambiguous information, formal CPPP 
              Clarification Notices will be issued with fixed response deadlines.
            </p>
            <p>
              <strong>7.3 L-1 Determination:</strong> The contract will be awarded to the technically responsive, 
              eligible bidder quoting the lowest compliant commercial offer (L-1), subject to statutory approvals.
            </p>
          </div>
        </div>

        {/* ==================== SECTION 18, 19: TERMS, CONDITIONS & INSTRUCTIONS ==================== */}
        <div className="space-y-2">
          <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[#3D2C1E] border-b border-[#E8DEC8] pb-1">
            8.0 Standard Terms, Conditions & Instructions to Bidders
          </h3>
          <ul className="list-disc list-inside text-xs text-[#2A2016] space-y-1 font-sans pl-1">
            <li><strong>Bid Validity:</strong> Bids shall remain valid for 90 calendar days from the date of technical bid opening.</li>
            <li><strong>Performance Security (PBG):</strong> Successful bidder must furnish 3% of the contract value as PBG within 15 days of Award.</li>
            <li><strong>Liquidated Damages (LD):</strong> LD of 0.5% per week of delay subject to a ceiling of 10% of total contract value.</li>
            <li><strong>Corrupt / Fraudulent Practices:</strong> Non-disclosure or fabrication shall entail forfeiture and debarment under GFR Rule 175.</li>
          </ul>
        </div>

        {/* ==================== SECTION 20 & 21: CONTACT DETAILS & SIGNATURE SECTION ==================== */}
        <div className="pt-6 border-t-2 border-[#2D231C] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
          <div className="space-y-1">
            <span className="font-bold text-[#6B5542] uppercase text-[10px]">Contact & Procuring Authority:</span>
            <div className="font-semibold text-[#1A140F]">Office of the Procurement Officer</div>
            <div className="text-[#554233]">{tender.department || 'Central Public Procurement Division'}</div>
            <div className="text-[#554233]">Government of India, New Delhi</div>
            <div className="text-[#554233]">Helpdesk Email: <span className="underline">cppp-support@nic.in</span></div>
          </div>

          <div className="sm:text-right space-y-2 flex flex-col sm:items-end">
            <span className="font-bold text-[#6B5542] uppercase text-[10px]">Competent Authority Approval & Seal:</span>
            <div className="p-3 border border-[#C5B7A4] rounded bg-[#FAF7F2] inline-block text-left text-[11px] max-w-xs">
              <div className="flex items-center gap-1.5 text-[#1E5732] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#1E5732]" />
                <span>Digitally Authenticated Document</span>
              </div>
              <div className="text-[#4A382A] mt-1 font-mono text-[10px]">
                Signatory: {currentUser?.name || 'Authorized Procurement Officer'}
              </div>
              <div className="text-[#4A382A] font-mono text-[10px]">
                Role: {currentUser?.role || 'Procurement Officer'}
              </div>
              <div className="text-[#6B5542] text-[9px] mt-0.5">
                Timestamp: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </div>
            </div>
            <div className="text-[10px] text-[#7A6B5D] italic">
              (Document generated electronically via CPPP System)
            </div>
          </div>
        </div>

        {/* Footer Page Numbering Stamp */}
        <div className="pt-4 border-t border-[#DDD3C4] flex items-center justify-between text-[10px] font-sans text-[#7A6B5D]">
          <span>Central Public Procurement Portal (CPPP) • Government Tender Dossier</span>
          <span>Page 1 of 1 • Ref: {tenderRefNo}</span>
        </div>
      </div>
    </div>
  );
};
