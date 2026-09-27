import React, { useState } from 'react';
import { 
  Tender, 
  Bidder, 
  CompanyApplication, 
  UserProfile, 
  BidEvaluation,
  DocumentCategory
} from '../types';
import { 
  ArrowLeft, 
  Building, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  HelpCircle, 
  FileCheck, 
  Search,
  Filter,
  Layers,
  ChevronRight,
  ExternalLink,
  Save,
  Check,
  X
} from 'lucide-react';

interface BidderApplicationWorkspaceViewProps {
  application: CompanyApplication;
  tender: Tender;
  bidder?: Bidder;
  evaluation?: BidEvaluation;
  currentUser: UserProfile;
  onBack: () => void;
  onUpdateApplicationStatus?: (appId: string, newStatus: CompanyApplication['status'], notes?: string) => void;
  onLogAudit?: (action: string, module: any, details: string) => void;
}

export const BidderApplicationWorkspaceView: React.FC<BidderApplicationWorkspaceViewProps> = ({
  application,
  tender,
  bidder,
  evaluation,
  currentUser,
  onBack,
  onUpdateApplicationStatus,
  onLogAudit,
}) => {
  // Active Inspector Modal for Document Detail / Extracted Metadata
  const [selectedDocForInspect, setSelectedDocForInspect] = useState<{
    name: string;
    category: string;
    format: string;
    fileSize: string;
    uploadedAt: string;
    status: 'Verified' | 'Pending' | 'Discrepancy';
    extractedText: string;
    metadata: Record<string, any>;
    matchingClause: string;
    extractedFigures: string;
    confidence: number;
  } | null>(null);

  // Per-document officer decisions (local state for immediate review action)
  const [docDecisions, setDocDecisions] = useState<Record<string, 'Accepted' | 'Rejected' | 'Clarification'>>({});
  
  // Officer Assessment Notes & Overall Application Decision
  const [officerNotes, setOfficerNotes] = useState(
    'Initial automated compliance screening verified all statutory certificates (PAN, GSTIN, Udyam). Turnover meets prescribed threshold under Rule 173. Recommended for Technical Evaluation Committee sign-off.'
  );
  const [overallDecision, setOverallDecision] = useState<
    'Eligible' | 'Under Review' | 'Disqualified' | 'Recommended for Shortlist'
  >(
    application.status === 'Verified' ? 'Eligible' : 'Recommended for Shortlist'
  );
  const [decisionSavedToast, setDecisionSavedToast] = useState(false);

  // Clarification request modal inside workspace
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [clarificationTargetDoc, setClarificationTargetDoc] = useState('');
  const [clarificationQuery, setClarificationQuery] = useState('');
  const [clarificationDeadline, setClarificationDeadline] = useState('2026-10-15');

  // Bidder Summary info fallback
  const companyReg = bidder?.registrationNumber || 'U72900DL2018PTC334512';
  const companyGst = bidder?.gstNumber || '07AABCA1234D1Z8';
  const companyPan = bidder?.panNumber || 'AABCA1234D';
  const companyMsme = bidder?.msmeUdyamNumber || 'UDYAM-DL-03-0012984';
  const companyTurnover = bidder?.annualTurnover || application.turnoverClaim || '₹14.80 Crore';
  const companyExp = bidder?.yearsOfExperience ? `${bidder.yearsOfExperience} Years` : application.experienceClaim || '6 Years';

  // Comprehensive categorized list of submitted documents for this tender
  // 5 Explicit Categories as requested:
  // 1. Company Documents
  // 2. Financial Documents
  // 3. Experience Documents
  // 4. Technical Documents
  // 5. Tender-Specific Documents

  const submittedDocsCategorized = [
    {
      groupTitle: 'Company Documents',
      description: 'Statutory registration, tax identity, and incorporation proofs',
      items: [
        {
          name: `${application.companyName.replace(/\s+/g, '_')}_GST_REG06.pdf`,
          category: 'GST Certificate',
          format: 'PDF (Class 3 Signed)',
          fileSize: '412 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `GSTIN: ${companyGst}\nLegal Name: ${application.companyName}\nDate of Registration: 14/06/2018\nStatus: Active Regular Taxpayer\nJurisdiction: Ward 42, Central Delhi`,
          metadata: {
            'GSTIN Number': companyGst,
            'Taxpayer Type': 'Regular',
            'Filing Frequency': 'Monthly (GSTR-3B Compliant)',
            'Tax Period Verified': 'FY 2025-26 Q1/Q2',
          },
          matchingClause: 'Clause 4.2: Mandatory active GST registration with zero defaults',
          extractedFigures: `100% Tax Filing Compliance (Nil Defaults)`,
          confidence: 99.4,
        },
        {
          name: `${application.companyName.replace(/\s+/g, '_')}_PAN_Card.pdf`,
          category: 'PAN Card',
          format: 'PDF',
          fileSize: '240 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Permanent Account Number: ${companyPan}\nName: ${application.companyName}\nCategory: Domestic Company\nIncorporation: 08/03/2018`,
          metadata: {
            'PAN Number': companyPan,
            'Entity Type': 'Company (Pvt Ltd)',
            'Income Tax Jurisdiction': 'DCIT Cir 3(1), New Delhi',
          },
          matchingClause: 'Clause 4.1: Statutory Identity & Corporate PAN',
          extractedFigures: `PAN: ${companyPan}`,
          confidence: 99.8,
        },
        {
          name: `Certificate_of_Incorporation_MCA21.pdf`,
          category: 'Company Registration',
          format: 'PDF (Digital Seal)',
          fileSize: '890 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Registrar of Companies, Ministry of Corporate Affairs, Govt of India.\nCIN: ${companyReg}\nAuthorized Capital: ₹5,00,00,000\nPaid-up Capital: ₹2,50,00,000`,
          metadata: {
            'CIN': companyReg,
            'RoC Office': 'RoC Delhi & Haryana',
            'Registration Date': '08-Mar-2018',
          },
          matchingClause: 'Clause 4.1: Valid Registration under Companies Act 2013',
          extractedFigures: `Paid-up Capital: ₹2.50 Cr`,
          confidence: 98.7,
        },
        {
          name: `Udyam_Registration_Certificate.pdf`,
          category: 'MSME/Udyam Certificate',
          format: 'PDF (Govt QR Verified)',
          fileSize: '345 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Ministry of Micro, Small and Medium Enterprises\nUdyam Reg Number: ${companyMsme}\nEnterprise Class: Medium Enterprise\nMajor Activity: Services & Manufacturing`,
          metadata: {
            'Udyam Number': companyMsme,
            'Classification': 'Medium Enterprise',
            'NIC Codes': '62020, 62090, 42101',
          },
          matchingClause: 'Clause 4.5: Public Procurement Policy for MSEs',
          extractedFigures: `Eligible for Tender Fee / EMD Exemption`,
          confidence: 99.2,
        },
      ],
    },
    {
      groupTitle: 'Financial Documents',
      description: 'Chartered accountant verified balance sheets, turnover and solvency statements',
      items: [
        {
          name: `Audited_Financial_Statements_3Yrs_with_UDIN.pdf`,
          category: 'Audited Financial Statements',
          format: 'PDF (CA Signed)',
          fileSize: '3.4 MB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Independent Auditor Report by M/s R.K. Agarwal & Associates (FRN 012894N).\nUDIN: 26048291AAAA1028.\nFY 2023-24 Turnover: ₹12.40 Cr | Profit: ₹1.45 Cr\nFY 2024-25 Turnover: ₹14.80 Cr | Profit: ₹2.10 Cr\nFY 2025-26 Turnover: ₹17.20 Cr | Profit: ₹2.80 Cr\n3-Year Average Turnover: ₹14.80 Crore`,
          metadata: {
            'UDIN': '26048291AAAA1028',
            'CA Membership': 'FCA #048291',
            'Average Turnover': '₹14.80 Crore',
            'Net Worth': '₹8.60 Crore (Positive)',
          },
          matchingClause: 'Clause 4.3: Minimum annual average turnover of ₹5.00 Crore',
          extractedFigures: `₹14.80 Cr (Surplus +₹9.80 Cr over benchmark)`,
          confidence: 99.1,
        },
        {
          name: `CA_Certified_Turnover_Certificate.pdf`,
          category: 'Turnover Certificate',
          format: 'PDF',
          fileSize: '512 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `To Whomsoever It May Concern: This is to certify that annual turnover of ${application.companyName} for consecutive 3 preceding years is verified from audited books.`,
          metadata: {
            'Auditor UDIN': '26048291AAAA1028',
            'Annual Turnover Claimed': companyTurnover,
          },
          matchingClause: 'Clause 4.3: CA Certified Turnover Certificate with UDIN',
          extractedFigures: `Average: ₹14.80 Cr`,
          confidence: 98.9,
        },
        {
          name: `Bank_Solvency_Certificate_StateBank.pdf`,
          category: 'Bank / Financial Evidence',
          format: 'PDF (Official Bank Letterhead)',
          fileSize: '620 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `State Bank of India, Commercial Branch, Parliament Street.\nSolvency Certificate Ref: SBI/CB/2026/SOL-4190.\nThis is to certify that ${application.companyName} maintains a solvent credit standing up to ₹5,00,00,000 (Rupees Five Crore only).`,
          metadata: {
            'Issuing Bank': 'State Bank of India',
            'Solvency Limit': '₹5.00 Crore',
            'Issue Date': '15-Aug-2026',
          },
          matchingClause: 'Clause 4.6: Solvency Certificate of minimum ₹3.00 Crore',
          extractedFigures: `Solvency: ₹5.00 Crore`,
          confidence: 97.8,
        },
      ],
    },
    {
      groupTitle: 'Experience Documents',
      description: 'Government and corporate completion certificates and past work orders',
      items: [
        {
          name: `NHAI_Expressway_Toll_WorkOrder_Completion.pdf`,
          category: 'Previous Work Orders & Completion',
          format: 'PDF',
          fileSize: '2.1 MB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `National Highways Authority of India (NHAI)\nContract: Supply & Maintenance of 12-Lane Toll Plaza & ANPR Cameras\nValue: ₹8.40 Crore\nExecution Period: 2023 - 2025\nPerformance: Satisfactorily completed without liquidated damages.`,
          metadata: {
            'Client Authority': 'NHAI Project Director PIU',
            'Project Value': '₹8.40 Crore',
            'Completion Status': 'Satisfactorily Executed',
          },
          matchingClause: 'Clause 4.4: 3 Years documented experience in highway / automated systems',
          extractedFigures: `Track Record: 6 Years verified`,
          confidence: 96.5,
        },
        {
          name: `State_PWD_Smart_Mobility_Certificate.pdf`,
          category: 'Completion Certificates',
          format: 'PDF',
          fileSize: '1.2 MB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `State Public Works Department (PWD)\nCompletion Certificate for Central Surveillance & Traffic Control System.\nContract Period: 24 Months.\nFinal Handover: Completed within stipulated contractual timeline.`,
          metadata: {
            'Issuing Officer': 'Executive Engineer, PWD Division II',
            'Project Value': '₹4.20 Crore',
          },
          matchingClause: 'Clause 4.4: Similar scope execution proof',
          extractedFigures: `100% Completion on time`,
          confidence: 95.8,
        },
      ],
    },
    {
      groupTitle: 'Technical Documents',
      description: 'Quality certifications, technical accreditations, and product catalogs',
      items: [
        {
          name: `ISO_9001_2015_Quality_Certificate.pdf`,
          category: 'Technical Certificates',
          format: 'PDF (Accredited Bureau)',
          fileSize: '680 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Certificate of Quality Management System ISO 9001:2015.\nScope: Design, Supply, Integration and Maintenance of Electronic Toll Systems, SCADA and CCTV.\nValid Until: 12-May-2027.`,
          metadata: {
            'Standard': 'ISO 9001:2015',
            'Accreditation Body': 'NABCB / IAF Accredited',
            'Validity': '12-May-2027',
          },
          matchingClause: 'Clause 3.1: ISO 9001:2015 Mandatory Quality Certification',
          extractedFigures: `Active until May 2027`,
          confidence: 99.0,
        },
        {
          name: `Class_1_Electrical_Contractor_Enlistment.pdf`,
          category: 'Technical Qualification Documents',
          format: 'PDF',
          fileSize: '540 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Central Electricity Licensing Board\nLicense Class: Class 1 (Extra High Tension & Automated Electronics)\nValidity: 31-Dec-2028`,
          metadata: {
            'License Grade': 'Class 1',
            'Enlistment ID': 'CELB/2021/CLASS1/8492',
          },
          matchingClause: 'Clause 3.2: Technical enlistment license',
          extractedFigures: `Class 1 Contractor`,
          confidence: 97.4,
        },
        {
          name: `ANPR_Camera_Technical_Datasheet_Specs.pdf`,
          category: 'Product / Service Documents',
          format: 'PDF',
          fileSize: '1.8 MB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Product Datasheet: High-Speed ANPR AI Camera Series Pro 4K.\nCapture Rate: Up to 180 km/h vehicle speed.\nAccuracy: 98.7% verified in ARAI testing.`,
          metadata: {
            'Manufacturer': 'Apex Intelligent Sensors OEM',
            'Accuracy': '>98% Benchmark Met',
          },
          matchingClause: 'Clause 2.0: High-speed ANPR camera technical standard',
          extractedFigures: `98.7% accuracy (exceeds 98% req)`,
          confidence: 96.2,
        },
      ],
    },
    {
      groupTitle: 'Tender-Specific Documents',
      description: 'Bid cover letters, technical proposal, BoQ submission, and integrity undertakings',
      items: [
        {
          name: `Technical_Proposal_Detailed_Architecture.pdf`,
          category: 'Technical Proposal',
          format: 'PDF',
          fileSize: '4.8 MB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Comprehensive Technical Proposal for ${tender.title}.\nIncludes architecture diagram, bill of materials, project implementation schedule, Gantt chart, and SLA warranty commitments.`,
          metadata: {
            'Pages': '48 Pages',
            'SLA Proposed': '99.8% Uptime with 2-Hour MTTR',
          },
          matchingClause: 'Section 2.0 & Section 7.0: Detailed Technical Dossier',
          extractedFigures: `48-page complete EPC methodology`,
          confidence: 98.4,
        },
        {
          name: `Commercial_Financial_Proposal_BoQ.pdf`,
          category: 'Financial Proposal',
          format: 'Encrypted PDF (Cover 2)',
          fileSize: '380 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Financial Price Bid / BoQ Schedule (Itemized unit rates and taxes).\nNote: Cover 2 encrypted and protected until Technical Committee clearance.`,
          metadata: {
            'Format': 'Standard CPPP BoQ Format',
            'Encryption Status': 'Encrypted Cover-2',
          },
          matchingClause: 'Section 7.1: Two-Cover Sealed Financial Bid',
          extractedFigures: `Submitted in Cover-2`,
          confidence: 100.0,
        },
        {
          name: `Integrity_Pact_&_Non_Debarment_Affidavit.pdf`,
          category: 'Supporting documents',
          format: 'PDF (Notarized e-Stamp)',
          fileSize: '520 KB',
          uploadedAt: application.submittedDate,
          status: 'Verified' as const,
          extractedText: `Solemn Non-Debarment Affidavit under GFR 2017 Rule 175.\nThe bidder hereby swears that neither the company nor any director is debarred or blacklisted by any government authority.`,
          metadata: {
            'e-Stamp Number': 'IN-DL849201948192K',
            'Notary Public Seal': 'Notary Delhi High Court',
          },
          matchingClause: 'Clause 8.0: Mandatory Non-Debarment Affidavit',
          extractedFigures: `Notarized e-Stamp Verified`,
          confidence: 99.6,
        },
      ],
    },
  ];

  // Save Officer Assessment Handler
  const handleSaveDecision = () => {
    if (onUpdateApplicationStatus) {
      onUpdateApplicationStatus(
        application.id,
        overallDecision === 'Disqualified' 
          ? 'Closed' 
          : overallDecision === 'Under Review' 
          ? 'Under Review' 
          : 'Verified',
        officerNotes
      );
    }

    if (onLogAudit) {
      onLogAudit(
        'Officer Assessment Completed in Application Workspace',
        'Officer Review',
        `Procurement Officer ${currentUser.name} signed assessment for ${application.companyName} (${tender.tenderId}): Decision="${overallDecision}". Officer Notes: "${officerNotes.slice(0, 100)}..."`
      );
    }

    setDecisionSavedToast(true);
    setTimeout(() => setDecisionSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="glass-card rounded-2xl p-5 border border-[#E6DDD0] bg-white/95 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-[#DDD3C4] text-[#553E2B] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              title="Back to Applications List"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                  Bidder Application Workspace
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  application.status === 'Verified'
                    ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                    : application.status === 'Clarification Required'
                    ? 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                    : 'bg-[#FAF5EE] text-[#553E2B] border-[#DDD3C4]'
                }`}>
                  {application.status}
                </span>
              </div>
              <h1 className="text-lg font-bold text-[#2D231C] tracking-tight mt-0.5">
                {application.companyName}
              </h1>
              <div className="text-xs text-[#736355] flex items-center gap-2 mt-0.5">
                <span>Tender: <strong>{tender.title}</strong></span>
                <span>•</span>
                <span className="font-mono text-[#8C5832] font-semibold">{tender.tenderId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDecision}
              className="px-4 py-2 rounded-xl bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Officer Decision</span>
            </button>
          </div>
        </div>

        {/* Workflow Breadcrumbs */}
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] flex items-center justify-between overflow-x-auto text-[11px] text-[#7A6B5D]">
          <span className="font-semibold text-[#8C5832]">Tender: {tender.tenderId}</span>
          <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
          <span className="font-semibold text-[#8C5832]">Applicant: {application.companyName}</span>
          <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
          <span className="font-semibold text-[#8C5832]">Submitted Dossier (15 Documents)</span>
          <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
          <span className="font-semibold text-[#8C5832]">AI Compliance Screener</span>
          <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
          <span className="font-semibold text-[#8C5832]">Officer Final Endorsement</span>
        </div>
      </div>

      {/* Confirmation Toast */}
      {decisionSavedToast && (
        <div className="p-3 rounded-xl bg-[#EEF6F0] border border-[#C4DFC8] text-xs text-[#1E5732] flex items-center justify-between font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E5732]" />
            <span>Officer decision and internal assessment notes saved successfully to audit log!</span>
          </div>
          <button onClick={() => setDecisionSavedToast(false)} className="text-[#1E5732] hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* ==================== 1. BIDDER SUMMARY CARD ==================== */}
      <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-[#8C5832] flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                Entity Profile & Statutory Identifiers
              </span>
              <h2 className="text-sm font-bold text-[#2D231C]">Bidder Statutory Summary</h2>
            </div>
          </div>

          <span className="font-mono text-xs text-[#8C5832] bg-[#FAF5EE] px-2.5 py-1 rounded-lg border border-[#E2D8C8]">
            CIN: {companyReg}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Company Name</div>
            <div className="font-bold text-[#2D231C] mt-0.5 truncate">{application.companyName}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Corporate PAN</div>
            <div className="font-mono font-bold text-[#2D231C] mt-0.5">{companyPan}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">GSTIN</div>
            <div className="font-mono font-bold text-[#2D231C] mt-0.5">{companyGst}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">MSME / Udyam</div>
            <div className="font-mono font-bold text-[#2D231C] mt-0.5 truncate">{companyMsme}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Application Date</div>
            <div className="font-semibold text-[#2D231C] mt-0.5 truncate">{application.submittedDate}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Status</div>
            <div className="font-bold text-[#1E5732] mt-0.5">{application.status}</div>
          </div>
        </div>
      </div>

      {/* ==================== 2. AI VERIFICATION SUMMARY ==================== */}
      <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-[#8C5832] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                Automated Screening & Evidence Benchmarking
              </span>
              <h2 className="text-sm font-bold text-[#2D231C]">AI Verification Summary</h2>
            </div>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full bg-[#EEF6F0] text-[#1E5732] border border-[#C4DFC8] font-bold">
            Preliminary Eligibility: 96% Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Turnover Check */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-1">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold flex items-center justify-between">
              <span>Turnover Check</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5732]" />
            </div>
            <div className="font-bold text-sm text-[#2D231C]">{companyTurnover}</div>
            <div className="text-[10px] text-[#1E5732] font-medium">
              Benchmark: {tender.minimumTurnover || '₹5.0 Cr'} (Passed)
            </div>
          </div>

          {/* Experience Check */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-1">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold flex items-center justify-between">
              <span>Experience Check</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5732]" />
            </div>
            <div className="font-bold text-sm text-[#2D231C]">{companyExp}</div>
            <div className="text-[10px] text-[#1E5732] font-medium">
              Benchmark: 3 Years (Passed)
            </div>
          </div>

          {/* Technical Compliance */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-1">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold flex items-center justify-between">
              <span>Technical Standards</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5732]" />
            </div>
            <div className="font-bold text-sm text-[#2D231C]">ISO 9001 & Class-1</div>
            <div className="text-[10px] text-[#1E5732] font-medium">
              Both Certificates Verified
            </div>
          </div>

          {/* Mandatory Completeness */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-1">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold flex items-center justify-between">
              <span>Mandatory Dossier</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5732]" />
            </div>
            <div className="font-bold text-sm text-[#2D231C]">100% Present</div>
            <div className="text-[10px] text-[#1E5732] font-medium">
              All 7 Clauses Furnished
            </div>
          </div>

          {/* Discrepancies */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-1">
            <div className="text-[10px] text-[#8C6B52] uppercase font-semibold flex items-center justify-between">
              <span>Discrepancies</span>
              <AlertTriangle className="w-3.5 h-3.5 text-[#8C5D17]" />
            </div>
            <div className="font-bold text-sm text-[#8C5D17]">1 Minor Notice</div>
            <div className="text-[10px] text-[#7A6B5D]">
              Entity abbreviation in GST vs RoC
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 3. ALL SUBMITTED DOCUMENTS (DEDICATED 5 CATEGORIES) ==================== */}
      <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE0]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
              Comprehensive Tender Submission File
            </span>
            <h2 className="text-base font-bold text-[#2D231C] mt-0.5">
              All Submitted Documents for {tender.tenderId}
            </h2>
            <p className="text-xs text-[#736355]">
              Every certificate, proposal, and financial exhibit uploaded by {application.companyName} organized by category.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] border border-[#E2D8C8] text-[#553E2B] font-semibold">
              Total 15 Files
            </span>
          </div>
        </div>

        {/* 5 Distinct Categories */}
        <div className="space-y-6">
          {submittedDocsCategorized.map((categoryGroup, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#EDE5DA]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#8C5832] text-white flex items-center justify-center font-bold text-[10px]">
                    {groupIdx + 1}
                  </span>
                  <h3 className="text-xs font-bold text-[#2D231C] uppercase tracking-wide">
                    {categoryGroup.groupTitle}
                  </h3>
                  <span className="text-[11px] text-[#7A6B5D]">({categoryGroup.items.length} files)</span>
                </div>
                <span className="text-[10px] text-[#8C6B52] italic">{categoryGroup.description}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryGroup.items.map((doc, docIdx) => {
                  const decision = docDecisions[doc.name];

                  return (
                    <div 
                      key={docIdx}
                      className="p-4 rounded-xl border border-[#E6DDD0] bg-[#FAF8F5] hover:border-[#8C5832]/60 hover:bg-white transition-all space-y-3 shadow-2xs group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[9px] uppercase font-bold text-[#8C6B52] bg-[#EFE9DF] px-2 py-0.5 rounded border border-[#E0D5C5]">
                            {doc.category}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                            doc.status === 'Verified'
                              ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                              : 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                          }`}>
                            {doc.status}
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-xs text-[#2D231C] truncate" title={doc.name}>
                            {doc.name}
                          </div>
                          <div className="text-[10px] text-[#7A6B5D] mt-0.5">
                            Format: <strong>{doc.format}</strong> • Size: {doc.fileSize}
                          </div>
                          <div className="text-[10px] text-[#7A6B5D]">
                            Uploaded: {doc.uploadedAt}
                          </div>
                        </div>

                        {/* Benchmark match pill */}
                        <div className="text-[10px] text-[#554233] bg-white p-2 rounded-lg border border-[#EDE5DA] leading-tight">
                          <strong>Match:</strong> {doc.matchingClause}
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="space-y-2 pt-2 border-t border-[#EDE5DA]">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedDocForInspect(doc)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAF5EE] border border-[#DDD3C4] text-[#4A3525] text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-[#8C5832]" />
                            <span>View Document</span>
                          </button>

                          <button
                            onClick={() => setSelectedDocForInspect(doc)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#FAF5EE] hover:bg-white border border-[#DDD3C4] text-[#4A3525] text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-[#8C5832]" />
                            <span>AI Details</span>
                          </button>
                        </div>

                        {/* Officer Quick Review buttons for this document */}
                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span className="text-[#8C6B52] font-semibold">Review:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDocDecisions(prev => ({ ...prev, [doc.name]: 'Accepted' }))}
                              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                                decision === 'Accepted'
                                  ? 'bg-[#1E5732] text-white'
                                  : 'bg-white text-[#1E5732] border border-[#C4DFC8] hover:bg-[#EEF6F0]'
                              }`}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => setDocDecisions(prev => ({ ...prev, [doc.name]: 'Rejected' }))}
                              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                                decision === 'Rejected'
                                  ? 'bg-[#A0352A] text-white'
                                  : 'bg-white text-[#A0352A] border border-[#E9C2BE] hover:bg-[#FDF2F1]'
                              }`}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                setClarificationTargetDoc(doc.name);
                                setClarificationQuery(`Clarification required regarding documentary evidence in ${doc.name} against ${doc.matchingClause}.`);
                                setIsClarificationModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded font-semibold bg-white text-[#8C5D17] border border-[#F0DDBE] hover:bg-[#FFF8EB] transition-colors cursor-pointer"
                            >
                              Clarify
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 4. OFFICER VERIFICATION & DECISION SECTION ==================== */}
      <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-[#8C5832] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                Authorized Officer Final Endorsement
              </span>
              <h2 className="text-sm font-bold text-[#2D231C]">Officer Verification & Decision</h2>
            </div>
          </div>

          <span className="text-xs text-[#7A6B5D] font-mono">
            Evaluator: {currentUser.name} ({currentUser.role})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Officer Decision Radio / Buttons */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-[#554233] uppercase tracking-wide">
              Overall Application Decision:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOverallDecision('Eligible')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  overallDecision === 'Eligible'
                    ? 'border-[#1E5732] bg-[#EEF6F0] text-[#1E5732] font-bold ring-1 ring-[#1E5732]'
                    : 'border-[#DDD3C4] bg-white text-[#554233] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Eligible</span>
                </div>
                <div className="text-[10px] font-normal text-[#6B5542] mt-0.5">
                  Meets all technical benchmarks
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOverallDecision('Recommended for Shortlist')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  overallDecision === 'Recommended for Shortlist'
                    ? 'border-[#8C5832] bg-[#FAF5EE] text-[#8C5832] font-bold ring-1 ring-[#8C5832]'
                    : 'border-[#DDD3C4] bg-white text-[#554233] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Shortlist Nominee</span>
                </div>
                <div className="text-[10px] font-normal text-[#6B5542] mt-0.5">
                  Recommended for Top 5 shortlist
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOverallDecision('Under Review')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  overallDecision === 'Under Review'
                    ? 'border-[#8C5D17] bg-[#FFF8EB] text-[#8C5D17] font-bold ring-1 ring-[#8C5D17]'
                    : 'border-[#DDD3C4] bg-white text-[#554233] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Under Review</span>
                </div>
                <div className="text-[10px] font-normal text-[#6B5542] mt-0.5">
                  Pending secondary evaluation
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOverallDecision('Disqualified')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  overallDecision === 'Disqualified'
                    ? 'border-[#A0352A] bg-[#FDF2F1] text-[#A0352A] font-bold ring-1 ring-[#A0352A]'
                    : 'border-[#DDD3C4] bg-white text-[#554233] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Disqualified</span>
                </div>
                <div className="text-[10px] font-normal text-[#6B5542] mt-0.5">
                  Fails mandatory statutory condition
                </div>
              </button>
            </div>
          </div>

          {/* Officer Assessment Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#554233] uppercase tracking-wide">
              Official Assessment Notes & Remarks:
            </label>
            <textarea
              rows={4}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C4] text-xs text-[#2D231C] leading-relaxed"
              placeholder="Record procurement officer assessment, statutory justifications, and committee recommendations..."
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#F0EAE0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-[#7A6B5D]">
            Decisions are recorded on the forensic audit ledger with Class-III digital signature stamping.
          </div>

          <button
            onClick={handleSaveDecision}
            className="px-5 py-2 rounded-xl bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submit Formal Assessment</span>
          </button>
        </div>
      </div>

      {/* ==================== 5. DOCUMENT VIEWER / EVIDENCE INSPECTOR MODAL ==================== */}
      {selectedDocForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="glass-card bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E6DDD0] shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#F0EAE0]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-[#8C6B52] tracking-wider">
                  Document Viewer & AI Evidence Inspector
                </span>
                <h3 className="text-sm font-bold text-[#2D231C]">
                  {selectedDocForInspect.name}
                </h3>
                <div className="text-[11px] text-[#7A6B5D]">
                  Category: <strong>{selectedDocForInspect.category}</strong> • Format: {selectedDocForInspect.format}
                </div>
              </div>

              <button
                onClick={() => setSelectedDocForInspect(null)}
                className="p-1 rounded-lg hover:bg-[#FAF8F5] text-[#553E2B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Extracted Metadata Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-[#8C6B52]">
                Extracted Metadata & Key Fields:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedDocForInspect.metadata).map(([key, val], idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6]">
                    <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">{key}</div>
                    <div className="font-semibold text-[#2D231C] mt-0.5 truncate">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matching Clause & Figures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#EEF6F0] border border-[#C4DFC8] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#1E5732]">
                  Matching Tender Clause
                </div>
                <div className="font-semibold text-[#1E5732]">
                  {selectedDocForInspect.matchingClause}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF5EE] border border-[#E2D8C8] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#8C5832]">
                  Extracted Figures & AI Confidence
                </div>
                <div className="font-semibold text-[#8C5832]">
                  {selectedDocForInspect.extractedFigures}
                </div>
                <div className="text-[10px] text-[#6B5542]">
                  Confidence: {selectedDocForInspect.confidence}%
                </div>
              </div>
            </div>

            {/* OCR Extracted Text Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-[#8C6B52]">
                OCR Raw Text & Parsed Stream:
              </span>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] font-mono text-xs text-[#2D231C] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedDocForInspect.extractedText}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-[#F0EAE0] flex items-center justify-between">
              <div className="text-[10px] text-[#7A6B5D]">
                Verified against Central MCA21 & GSTN electronic registries.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDocDecisions(prev => ({ ...prev, [selectedDocForInspect.name]: 'Accepted' }));
                    setSelectedDocForInspect(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#1E5732] text-white text-xs font-semibold cursor-pointer"
                >
                  Accept Document
                </button>
                <button
                  onClick={() => {
                    setDocDecisions(prev => ({ ...prev, [selectedDocForInspect.name]: 'Rejected' }));
                    setSelectedDocForInspect(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#A0352A] text-white text-xs font-semibold cursor-pointer"
                >
                  Reject Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. CLARIFICATION REQUEST MODAL ==================== */}
      {isClarificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="glass-card bg-white rounded-2xl max-w-lg w-full border border-[#E6DDD0] shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#F0EAE0]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8C6B52] tracking-wider">
                  Formal Clarification Notice (GFR 2017)
                </span>
                <h3 className="text-sm font-bold text-[#2D231C]">
                  Issue Clarification to {application.companyName}
                </h3>
              </div>
              <button
                onClick={() => setIsClarificationModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#FAF8F5] text-[#553E2B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#554233] mb-1">
                  Target Document:
                </label>
                <input
                  type="text"
                  value={clarificationTargetDoc}
                  readOnly
                  className="w-full p-2 rounded-lg bg-[#FAF8F5] border border-[#DDD3C4] font-semibold text-[#2D231C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#554233] mb-1">
                  Clarification Query / Missing Evidence:
                </label>
                <textarea
                  rows={3}
                  value={clarificationQuery}
                  onChange={(e) => setClarificationQuery(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#554233] mb-1">
                  Response Submission Deadline:
                </label>
                <input
                  type="date"
                  value={clarificationDeadline}
                  onChange={(e) => setClarificationDeadline(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EAE0] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsClarificationModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[#DDD3C4] text-xs font-semibold text-[#553E2B] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (onLogAudit) {
                    onLogAudit(
                      'Clarification Notice Formally Issued',
                      'Officer Review',
                      `Procurement Officer ${currentUser.name} issued clarification request to ${application.companyName} for doc "${clarificationTargetDoc}". Deadline: ${clarificationDeadline}.`
                    );
                  }
                  setIsClarificationModalOpen(false);
                  alert(`Clarification notice dispatched to ${application.companyName} with deadline ${clarificationDeadline}.`);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white text-xs font-semibold hover:bg-[#724523] cursor-pointer"
              >
                Send Formal Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
