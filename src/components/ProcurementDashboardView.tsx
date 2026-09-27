import React, { useState } from 'react';
import { 
  Tender, 
  Bidder, 
  BidEvaluation, 
  UserProfile, 
  CompanyApplication, 
  AiShortlistCandidate,
  TenderRequirement,
  TenderStatus
} from '../types';
import { 
  FileSpreadsheet, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Clock, 
  ChevronRight, 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Upload, 
  Save, 
  Send, 
  ShieldCheck, 
  Users, 
  Scale, 
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Award,
  Share2,
  FileCheck
} from 'lucide-react';
import { OfficialTenderDocumentView } from './OfficialTenderDocumentView';
import { BidderApplicationWorkspaceView } from './BidderApplicationWorkspaceView';

interface ProcurementDashboardViewProps {
  tenders: Tender[];
  bidders: Bidder[];
  applications: CompanyApplication[];
  evaluations: Record<string, BidEvaluation>;
  shortlistCandidates: Record<string, AiShortlistCandidate[]>;
  currentUser: UserProfile;
  selectedTender: Tender;
  onSelectTender: (tender: Tender) => void;
  onCreateTender: (newTender: Tender) => void;
  onUpdateTender: (updatedTender: Tender) => void;
  onNavigate: (tab: any, extraState?: any) => void;
  onLogAudit?: (action: string, module: any, details: string) => void;
}

export const ProcurementDashboardView: React.FC<ProcurementDashboardViewProps> = ({
  tenders,
  bidders,
  applications,
  evaluations,
  shortlistCandidates,
  currentUser,
  selectedTender,
  onSelectTender,
  onCreateTender,
  onUpdateTender,
  onNavigate,
  onLogAudit,
}) => {
  // Procurement Sub-views
  const [activeSubView, setActiveSubView] = useState<'dashboard' | 'create' | 'manage' | 'applications' | 'shortlist'>('dashboard');

  // Form State for Create / Draft Tender
  const [tenderTitle, setTenderTitle] = useState('');
  const [tenderCategory, setTenderCategory] = useState('Civil Infrastructure & Automated Systems');
  const [tenderDept, setTenderDept] = useState(currentUser.department || 'Ministry of Road Transport & Highways');
  const [tenderEstimatedValue, setTenderEstimatedValue] = useState('₹10.00 Crore');
  const [tenderNumericValue, setTenderNumericValue] = useState(10.0);
  const [tenderDescription, setTenderDescription] = useState('');
  const [tenderMinTurnover, setTenderMinTurnover] = useState('₹5.0 Crore');
  const [tenderExperienceReq, setTenderExperienceReq] = useState('3 Years in government highway or automation contracts');
  const [tenderOpeningDate, setTenderOpeningDate] = useState('2026-10-01');
  const [tenderClosingDate, setTenderClosingDate] = useState('2026-10-31');
  const [mandatoryDocsText, setMandatoryDocsText] = useState('GST Registration (Form REG-06)\nCorporate PAN Card\nMSME / Udyam Certificate\nAudited 3-Year Financial Statements with UDIN\nWork Experience Completion Certificates\nISO 9001:2015 Quality Certificate\nBank Solvency Certificate');
  const [technicalReqsText, setTechnicalReqsText] = useState('ISO 9001:2015 Quality Management Certified\nClass-1 Electrical / Civil Contractor Enlistment\nCertified Smart Mobility / SCADA Partner');
  const [requiredCertsText, setRequiredCertsText] = useState('ISO 9001:2015\nState PWD / NHAI Enlistment\nUdyam Certificate');

  // AI Tender Drafting State
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiDraftPrompt, setAiDraftPrompt] = useState('Automated Multi-Lane Free Flow (MLFF) Electronic Toll Collection and CCTV Surveillance on Western Ring Expressway');
  const [aiDraftGenerated, setAiDraftGenerated] = useState(false);

  // Application Drilldown State
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Filtered applications for current tender
  const tenderApplications = applications.filter((app) => app.tenderId === selectedTender.id);

  // Shortlist candidates for selected tender
  const currentShortlist = shortlistCandidates[selectedTender.id] || shortlistCandidates['tnd-001'] || [];

  // Handle AI Drafting Action
  const handleGenerateAiDraft = () => {
    setIsAiDrafting(true);
    setTimeout(() => {
      setTenderTitle(`Procurement & Implementation of ${aiDraftPrompt}`);
      setTenderCategory('Intelligent Transport Systems & Civil Works');
      setTenderEstimatedValue('₹16.80 Crore');
      setTenderNumericValue(16.8);
      setTenderDescription('Comprehensive EPC tender for supply, installation, testing and commissioning of RFID Fastag transceivers, ANPR high-speed cameras, weighing-in-motion (WIM) systems, and SCADA monitoring network under GFR 2017 Rules 144 & 173.');
      setTenderMinTurnover('₹6.00 Crore average annual turnover over past 3 financial years');
      setTenderExperienceReq('4 Years documented execution of electronic tolling, highway IT or smart city surveillance contracts');
      setTechnicalReqsText('ISO 9001:2015 Quality Certified\nISO 27001 Information Security Certified\nNHAI / State PWD Class-1 Contractor Enlistment\nProven High-Speed ANPR Accuracy (>98%)');
      setMandatoryDocsText('GST Registration Certificate (Form REG-06)\nCorporate PAN Card\nMSME / Udyam Certificate\nCA Certified 3-Year Audited Balance Sheets with UDIN\nSatisfactory Project Completion Certificates\nBank Solvency Certificate (Min ₹3.0 Cr)\nOriginal Manufacturer Authorization (OEM MAF)');
      setRequiredCertsText('ISO 9001:2015\nISO 27001:2022\nState PWD Enlistment');
      setIsAiDrafting(false);
      setAiDraftGenerated(true);

      if (onLogAudit) {
        onLogAudit(
          'AI Draft Generated for Tender',
          'Tender',
          `Procurement Officer generated preliminary AI structure for "${aiDraftPrompt}". Officer review pending before publish.`
        );
      }
    }, 1200);
  };

  // Official Tender Document Preview & Bidder Workspace State
  const [previewOfficialTender, setPreviewOfficialTender] = useState<Tender | null>(null);
  const [workspaceApplication, setWorkspaceApplication] = useState<CompanyApplication | null>(null);
  const [portalDispatchedNotification, setPortalDispatchedNotification] = useState<string | null>(null);

  // Helper to construct a dynamic Tender object from form values
  const getDraftTenderObject = (status: TenderStatus = 'Draft'): Tender => {
    const newTenderId = `tnd-${Date.now().toString().slice(-4)}`;
    const newTenderCode = `CPPP/${new Date().getFullYear()}/${tenderCategory.substring(0, 4).toUpperCase()}/${Math.floor(1000 + Math.random() * 9000)}`;

    const reqList: TenderRequirement[] = [
      {
        id: `req-${Date.now()}-1`,
        title: 'MSME / Statutory Registration',
        type: 'Eligibility',
        isMandatory: true,
        benchmarkValue: 'Valid Udyam Certificate or RoC Enlistment',
      },
      {
        id: `req-${Date.now()}-2`,
        title: 'Minimum Annual Turnover',
        type: 'Financial',
        isMandatory: true,
        benchmarkValue: tenderMinTurnover,
      },
      {
        id: `req-${Date.now()}-3`,
        title: 'Work Experience Benchmark',
        type: 'Experience',
        isMandatory: true,
        benchmarkValue: tenderExperienceReq,
      },
      {
        id: `req-${Date.now()}-4`,
        title: 'GST & Tax Filings',
        type: 'Statutory',
        isMandatory: true,
        benchmarkValue: 'Active Regular GSTIN with no return defaults',
      },
    ];

    return {
      id: newTenderId,
      tenderId: newTenderCode,
      title: tenderTitle || 'Procurement of Automated Infrastructure & Technology Systems',
      department: tenderDept,
      category: tenderCategory,
      estimatedValue: tenderEstimatedValue,
      numericValue: tenderNumericValue,
      publishedDate: new Date().toISOString().split('T')[0],
      openingDate: tenderOpeningDate,
      closingDate: tenderClosingDate,
      status: status,
      description: tenderDescription || 'Turnkey engineering, supply, testing, and commissioning under GFR 2017 Rules 144 and 173.',
      isAnalyzed: true,
      analyzedAt: new Date().toLocaleTimeString(),
      summary: (tenderDescription || 'Turnkey engineering and technology systems procurement.').slice(0, 160) + '...',
      requirements: reqList,
      mandatoryDocuments: mandatoryDocsText.split('\n').filter(Boolean),
      requiredCertificates: requiredCertsText.split('\n').filter(Boolean),
      minimumTurnover: tenderMinTurnover,
      experienceRequirements: tenderExperienceReq,
      technicalRequirements: technicalReqsText.split('\n').filter(Boolean),
      isAiDrafted: aiDraftGenerated,
    };
  };

  // Preview Document Handler
  const handleOpenPreviewDocument = () => {
    const draftTender = getDraftTenderObject('Draft');
    setPreviewOfficialTender(draftTender);
  };

  // Publish from Preview Handler
  const handlePublishFromPreview = () => {
    if (!previewOfficialTender) return;
    const publishedTender: Tender = {
      ...previewOfficialTender,
      status: 'Active',
      publishedDate: new Date().toISOString().split('T')[0],
    };
    const existingIndex = tenders.findIndex((t) => t.id === publishedTender.id);
    if (existingIndex >= 0) {
      onUpdateTender(publishedTender);
    } else {
      onCreateTender(publishedTender);
    }
    onSelectTender(publishedTender);
    setPreviewOfficialTender(publishedTender);

    if (onLogAudit) {
      onLogAudit(
        'Tender Formally Published from Document Preview',
        'Tender',
        `Tender ${publishedTender.tenderId} ("${publishedTender.title}") formally published by ${currentUser.name}.`
      );
    }
  };

  // Send to Company Portal Handler
  const handleSendToCompanyPortal = () => {
    if (!previewOfficialTender) return;
    const activeTender: Tender = {
      ...previewOfficialTender,
      status: 'Active',
      publishedDate: new Date().toISOString().split('T')[0],
    };
    const existingIndex = tenders.findIndex((t) => t.id === activeTender.id);
    if (existingIndex >= 0) {
      onUpdateTender(activeTender);
    } else {
      onCreateTender(activeTender);
    }
    onSelectTender(activeTender);
    setPreviewOfficialTender(activeTender);

    setPortalDispatchedNotification(
      `Tender ${activeTender.tenderId} successfully dispatched to Company Portal! Bidder organizations can now view the official document, run AI eligibility checks, and submit bids.`
    );
    setTimeout(() => setPortalDispatchedNotification(null), 6000);

    if (onLogAudit) {
      onLogAudit(
        'Tender Dispatched to Company Portal',
        'Tender',
        `Tender ${activeTender.tenderId} synchronized with Bidder Discovery Gateway. Visible to all registered contractors.`
      );
    }
  };

  // Handle Save Draft or Publish Tender
  const handleSaveTender = (status: TenderStatus) => {
    const createdTender = getDraftTenderObject(status);
    onCreateTender(createdTender);
    onSelectTender(createdTender);

    if (onLogAudit) {
      onLogAudit(
        status === 'Active' ? 'Tender Formally Published' : 'Tender Draft Saved',
        'Tender',
        `Tender ${createdTender.tenderId} ("${createdTender.title}") status set to ${status}. Total requirements: ${createdTender.requirements.length}.`
      );
    }

    if (status === 'Active') {
      setPortalDispatchedNotification(
        `Tender ${createdTender.tenderId} has been published and is now live in the Company Portal!`
      );
      setTimeout(() => setPortalDispatchedNotification(null), 6000);
    }

    setActiveSubView('manage');
  };

  // EARLY RETURN 1: Render Bidder Application Workspace
  if (workspaceApplication) {
    const matchedBidder = bidders.find((b) => b.id === workspaceApplication.companyId);
    const matchedTender = tenders.find((t) => t.id === workspaceApplication.tenderId) || selectedTender;
    const evalKey = `${workspaceApplication.tenderId}_${workspaceApplication.companyId}`;
    const matchedEval = evaluations[evalKey];

    return (
      <BidderApplicationWorkspaceView
        application={workspaceApplication}
        tender={matchedTender}
        bidder={matchedBidder}
        evaluation={matchedEval}
        currentUser={currentUser}
        onBack={() => setWorkspaceApplication(null)}
        onUpdateApplicationStatus={(appId, newStatus, notes) => {
          // Update local status
          setWorkspaceApplication((prev) => prev ? { ...prev, status: newStatus } : null);
        }}
        onLogAudit={onLogAudit}
      />
    );
  }

  // EARLY RETURN 2: Render Official Government Tender Document Preview
  if (previewOfficialTender) {
    return (
      <div className="space-y-4">
        {portalDispatchedNotification && (
          <div className="p-3 rounded-xl bg-[#EEF6F0] border border-[#C4DFC8] text-xs text-[#1E5732] flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#1E5732] shrink-0" />
            <span>{portalDispatchedNotification}</span>
          </div>
        )}
        <OfficialTenderDocumentView
          tender={previewOfficialTender}
          currentUser={currentUser}
          isProcurementOfficer={true}
          onEdit={() => {
            setTenderTitle(previewOfficialTender.title);
            setTenderCategory(previewOfficialTender.category);
            setTenderDept(previewOfficialTender.department);
            setTenderEstimatedValue(previewOfficialTender.estimatedValue);
            setTenderDescription(previewOfficialTender.description || '');
            setPreviewOfficialTender(null);
            setActiveSubView('create');
          }}
          onPublish={handlePublishFromPreview}
          onSendToCompanyPortal={handleSendToCompanyPortal}
          onClose={() => setPreviewOfficialTender(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Procurement Sub-Navigation */}
      <div className="glass-card rounded-2xl p-5 border border-[#E6DDD0] bg-white/95 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
                Procurement Authority
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
                Officer: {currentUser.name}
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#2D231C] tracking-tight mt-0.5">
              Procurement Officer Workspace & Tender Formulation
            </h1>
            <p className="text-xs text-[#736355]">
              Draft tenders, manage public notices, inspect received applications, and evaluate AI Top 5 Shortlist recommendations.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E2D8C8] text-center">
              <div className="text-[10px] text-[#8C6B52] font-semibold uppercase">Total Tenders</div>
              <div className="text-sm font-bold text-[#2D231C]">{tenders.length}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E2D8C8] text-center">
              <div className="text-[10px] text-[#8C6B52] font-semibold uppercase">Applications</div>
              <div className="text-sm font-bold text-[#8C5832]">{applications.length}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E2D8C8] text-center">
              <div className="text-[10px] text-[#8C6B52] font-semibold uppercase">Active Shortlists</div>
              <div className="text-sm font-bold text-[#25633A]">{currentShortlist.length}</div>
            </div>
          </div>
        </div>

        {/* Sub-view Navigation Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[#F0EAE0]">
          <button
            onClick={() => setActiveSubView('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'dashboard'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tender Dashboard</span>
          </button>

          <button
            onClick={() => setActiveSubView('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'create'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create & Draft Tender</span>
          </button>

          <button
            onClick={() => setActiveSubView('manage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'manage'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Tenders ({tenders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('applications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'applications'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Received Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('shortlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'shortlist'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Shortlist Recommendations</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EFE8DD] text-[#715038] font-bold">
              Top 5
            </span>
          </button>
        </div>
      </div>

      {/* ---------------- 1. TENDER DASHBOARD OVERVIEW ---------------- */}
      {activeSubView === 'dashboard' && (
        <div className="space-y-5">
          {/* Active Tender Selector Strip */}
          <div className="p-4 rounded-xl bg-white border border-[#E8E0D4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8C6B52] uppercase">Focused Tender:</span>
              <select
                value={selectedTender.id}
                onChange={(e) => {
                  const match = tenders.find((t) => t.id === e.target.value);
                  if (match) onSelectTender(match);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD3C4] text-xs font-bold text-[#2D231C]"
              >
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tenderId} — {t.title.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A6B5D]">Status:</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF6F0] text-[#1E5732] border border-[#C4DFC8]">
                {selectedTender.status}
              </span>
            </div>
          </div>

          {/* Quick Access Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Formulate New Tender */}
            <div 
              onClick={() => setActiveSubView('create')}
              className="p-5 rounded-2xl border border-[#E6DDD0] bg-white hover:border-[#8C5832] transition-all cursor-pointer shadow-xs space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#8C5832] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2D231C]">Create / Draft Tender</h3>
              <p className="text-xs text-[#736355] leading-relaxed">
                Formulate government tenders with custom eligibility, financial benchmarks, or leverage the AI-assisted structuring tool.
              </p>
              <div className="text-xs font-semibold text-[#8C5832] flex items-center gap-1 pt-1">
                <span>Start Drafting</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Received Applications */}
            <div 
              onClick={() => setActiveSubView('applications')}
              className="p-5 rounded-2xl border border-[#E6DDD0] bg-white hover:border-[#8C5832] transition-all cursor-pointer shadow-xs space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#8C5832] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2D231C]">Review Applications ({applications.length})</h3>
              <p className="text-xs text-[#736355] leading-relaxed">
                Step through submitted company files, OCR verification status, compliance matrices, and officer endorsement notes.
              </p>
              <div className="text-xs font-semibold text-[#8C5832] flex items-center gap-1 pt-1">
                <span>Inspect Submissions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: AI Shortlist Recommendations */}
            <div 
              onClick={() => setActiveSubView('shortlist')}
              className="p-5 rounded-2xl border border-[#E6DDD0] bg-white hover:border-[#8C5832] transition-all cursor-pointer shadow-xs space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#8C5832] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2D231C]">AI Top 5 Shortlist</h3>
              <p className="text-xs text-[#736355] leading-relaxed">
                Evidence-based preliminary candidate rankings with explainable "Why Recommended" justifications to support officer decision-making.
              </p>
              <div className="text-xs font-semibold text-[#8C5832] flex items-center gap-1 pt-1">
                <span>View Recommendations</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Current Tender Overview Summary Box */}
          <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                  Active Tender Spec Sheet
                </span>
                <h2 className="text-sm font-bold text-[#2D231C] mt-0.5">{selectedTender.title}</h2>
              </div>
              <span className="font-mono text-xs text-[#8C5832] font-semibold bg-[#FAF5EE] px-2.5 py-1 rounded border border-[#E2D8C8]">
                {selectedTender.tenderId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
                <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Department</div>
                <div className="font-semibold text-[#2D231C] mt-0.5 truncate">{selectedTender.department}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
                <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Estimated Value</div>
                <div className="font-bold text-[#8C5832] mt-0.5">{selectedTender.estimatedValue}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
                <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Closing Date</div>
                <div className="font-semibold text-[#2D231C] mt-0.5">{selectedTender.closingDate}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
                <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Requirements</div>
                <div className="font-semibold text-[#2D231C] mt-0.5">{selectedTender.requirements.length} Clauses</div>
              </div>
            </div>

            {selectedTender.description && (
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] text-xs text-[#554233] leading-relaxed">
                <strong>Scope Summary:</strong> {selectedTender.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 2. CREATE & DRAFT TENDER ---------------- */}
      {activeSubView === 'create' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDE5DA]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                Government Procurement Specifier
              </span>
              <h2 className="text-base font-bold text-[#2D231C] mt-0.5">
                Draft / Formulate New Tender Specification
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenPreviewDocument}
                className="px-3.5 py-1.5 rounded-lg border border-[#8C5832] bg-[#FAF5EE] text-[#8C5832] hover:bg-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Tender Document</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveTender('Draft')}
                className="px-3.5 py-1.5 rounded-lg border border-[#DDD3C4] text-[#4A3525] hover:bg-[#FAF8F5] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveTender('Active')}
                className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Tender</span>
              </button>
            </div>
          </div>

          {/* AI-Assisted Tender Drafting Section */}
          <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E6DDD0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#8C5832] text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#2D231C]">
                  AI-Assisted Tender Drafting Tool (GFR 2017 Framework)
                </span>
              </div>
              <span className="text-[10px] text-[#7A6B5D] italic">
                *Requires Officer review before publication
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={aiDraftPrompt}
                onChange={(e) => setAiDraftPrompt(e.target.value)}
                placeholder="Enter procurement scope (e.g., Highway surveillance, Cloud DR, Hospital equipment)..."
                className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              />
              <button
                type="button"
                disabled={isAiDrafting}
                onClick={handleGenerateAiDraft}
                className="px-4 py-2 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiDrafting ? 'Structuring Tender...' : 'Auto-Draft Tender Structure'}</span>
              </button>
            </div>

            {aiDraftGenerated && (
              <div className="text-[11px] text-[#1E5732] bg-[#EEF6F0] p-2 rounded-lg border border-[#C4DFC8] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>AI Tender structure generated successfully! Review, adjust parameters, and approve before publishing.</span>
              </div>
            )}
          </div>

          {/* Core Tender Formulation Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Tender Title:
              </label>
              <input
                type="text"
                value={tenderTitle}
                onChange={(e) => setTenderTitle(e.target.value)}
                placeholder="e.g., Turnkey Automated Toll Plaza Management & Highway AI Surveillance..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD3C4] text-xs font-medium text-[#2D231C]"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Issuing Department:
              </label>
              <input
                type="text"
                value={tenderDept}
                onChange={(e) => setTenderDept(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Tender Category:
              </label>
              <select
                value={tenderCategory}
                onChange={(e) => setTenderCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              >
                <option value="Civil Infrastructure & Automated Systems">Civil Infrastructure & Automated Systems</option>
                <option value="IT Hardware & Enterprise Software">IT Hardware & Enterprise Software</option>
                <option value="Medical Technology & Diagnostic Equipment">Medical Technology & Diagnostic Equipment</option>
                <option value="Security, Surveillance & Smart Cities">Security, Surveillance & Smart Cities</option>
                <option value="Power, Solar & Electrical Grids">Power, Solar & Electrical Grids</option>
              </select>
            </div>

            {/* Estimated Value */}
            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Estimated Contract Value:
              </label>
              <input
                type="text"
                value={tenderEstimatedValue}
                onChange={(e) => setTenderEstimatedValue(e.target.value)}
                placeholder="₹14.50 Crore"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-xs font-bold text-[#8C5832]"
              />
            </div>

            {/* Opening and Closing Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                  Opening Date:
                </label>
                <input
                  type="date"
                  value={tenderOpeningDate}
                  onChange={(e) => setTenderOpeningDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                  Closing Date:
                </label>
                <input
                  type="date"
                  value={tenderClosingDate}
                  onChange={(e) => setTenderClosingDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
                />
              </div>
            </div>

            {/* Scope / Description */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Description & Technical Scope:
              </label>
              <textarea
                rows={3}
                value={tenderDescription}
                onChange={(e) => setTenderDescription(e.target.value)}
                placeholder="Detailed scope, technical benchmarks, and statutory requirements..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              />
            </div>

            {/* Eligibility: Minimum Turnover */}
            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Minimum Annual Turnover Requirement:
              </label>
              <input
                type="text"
                value={tenderMinTurnover}
                onChange={(e) => setTenderMinTurnover(e.target.value)}
                placeholder="₹5.0 Crore average annual turnover"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              />
            </div>

            {/* Eligibility: Experience */}
            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Experience Requirements:
              </label>
              <input
                type="text"
                value={tenderExperienceReq}
                onChange={(e) => setTenderExperienceReq(e.target.value)}
                placeholder="3 Years in similar government projects"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              />
            </div>

            {/* Mandatory Documents Checklist */}
            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Mandatory Documents (One per line):
              </label>
              <textarea
                rows={4}
                value={mandatoryDocsText}
                onChange={(e) => setMandatoryDocsText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD3C4] text-xs font-mono text-[#2D231C]"
              />
            </div>

            {/* Technical Requirements */}
            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Technical Requirements & Standards (One per line):
              </label>
              <textarea
                rows={4}
                value={technicalReqsText}
                onChange={(e) => setTechnicalReqsText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD3C4] text-xs font-mono text-[#2D231C]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. MANAGE TENDERS LIST ---------------- */}
      {activeSubView === 'manage' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE5DA]">
            <div>
              <h2 className="text-base font-bold text-[#2D231C]">
                Official Government Tender Registry
              </h2>
              <p className="text-xs text-[#736355]">
                Active, Under Evaluation, and Draft tenders published on the portal.
              </p>
            </div>

            <button
              onClick={() => setActiveSubView('create')}
              className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Tender</span>
            </button>
          </div>

          <div className="divide-y divide-[#F0EAE0]">
            {tenders.map((tender) => {
              const isSelected = tender.id === selectedTender.id;
              const appCount = applications.filter((a) => a.tenderId === tender.id).length;

              return (
                <div key={tender.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#8C5832]">
                        {tender.tenderId}
                      </span>
                      <span className={`text-[10px] px-2 py-0.2 rounded font-semibold border ${
                        tender.status === 'Active'
                          ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                          : tender.status === 'Under Evaluation'
                          ? 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                          : 'bg-[#F2EDE4] text-[#553E2B] border-[#DDD3C4]'
                      }`}>
                        {tender.status}
                      </span>
                      {tender.isAiDrafted && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#8C5832] border border-[#E2D8C8] flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> AI Drafted
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-[#2D231C] text-sm">{tender.title}</div>
                    <div className="text-[#7A6B5D] text-[11px]">
                      {tender.department} • Closing: <strong>{tender.closingDate}</strong> • Value: <strong>{tender.estimatedValue}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#554233] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E8E0D4]">
                      {appCount} Bids Received
                    </span>

                    <button
                      onClick={() => setPreviewOfficialTender(tender)}
                      className="px-3 py-1 rounded-lg bg-[#FAF8F5] text-[#553E2B] border border-[#DDD3C4] hover:bg-white text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-[#8C5832]" />
                      <span>Official Document</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectTender(tender);
                        setActiveSubView('applications');
                      }}
                      className="px-3 py-1 rounded-lg bg-[#FAF5EE] text-[#553E2B] border border-[#DDD3C4] hover:bg-white text-xs font-medium cursor-pointer"
                    >
                      View Applications
                    </button>

                    <button
                      onClick={() => {
                        onSelectTender(tender);
                        setActiveSubView('shortlist');
                      }}
                      className="px-3 py-1 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI Shortlist</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- 4. RECEIVED APPLICATIONS WORKFLOW ---------------- */}
      {activeSubView === 'applications' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE5DA]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                Bid Applications Pipeline
              </span>
              <h2 className="text-base font-bold text-[#2D231C]">
                Applications Received for {selectedTender.tenderId}
              </h2>
            </div>

            <div className="text-xs text-[#7A6B5D]">
              Showing <strong>{tenderApplications.length}</strong> submitted application(s)
            </div>
          </div>

          {/* Workflow step indicator */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] flex items-center justify-between overflow-x-auto text-[11px] text-[#7A6B5D]">
            <span className="font-semibold text-[#8C5832]">Tender</span>
            <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
            <span className="font-semibold text-[#8C5832]">Applications</span>
            <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
            <span className="font-semibold text-[#8C5832]">Company</span>
            <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
            <span className="font-semibold text-[#8C5832]">Submitted Docs</span>
            <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
            <span className="font-semibold text-[#8C5832]">AI Verification</span>
            <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
            <span className="font-semibold text-[#8C5832]">Officer Review</span>
          </div>

          {/* Applications Table / Cards */}
          <div className="divide-y divide-[#F0EAE0]">
            {tenderApplications.map((app) => {
              const matchedBidder = bidders.find((b) => b.id === app.companyId);
              const evalKey = `${selectedTender.id}_${app.companyId}`;
              const evaluation = evaluations[evalKey];

              return (
                <div key={app.id} className="py-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2D231C]">{app.companyName}</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded font-semibold border ${
                          app.status === 'Verified'
                            ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                            : app.status === 'Clarification Required'
                            ? 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                            : 'bg-[#F2EDE4] text-[#553E2B] border-[#DDD3C4]'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7A6B5D] mt-0.5">
                        Submitted: {app.submittedDate} • Claimed Turnover: <strong>{app.turnoverClaim}</strong> • Experience: <strong>{app.experienceClaim}</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setWorkspaceApplication(app)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>Bidder Application Workspace</span>
                      </button>

                      <button
                        onClick={() => setSelectedApplicationId(selectedApplicationId === app.id ? null : app.id)}
                        className="px-3 py-1 rounded-lg bg-[#FAF5EE] text-[#553E2B] border border-[#DDD3C4] hover:bg-white text-xs font-semibold cursor-pointer"
                      >
                        {selectedApplicationId === app.id ? 'Hide Documents' : `Inspect Dossier (${app.documents.length})`}
                      </button>

                      <button
                        onClick={() => {
                          if (matchedBidder) {
                            onNavigate('case-workspace', { tenderId: selectedTender.id, bidderId: matchedBidder.id });
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-[#FAF8F5] text-[#553E2B] border border-[#DDD3C4] hover:bg-white text-xs font-medium cursor-pointer flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8C5832]" />
                        <span>Evidence Case</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  {app.eligibilitySummary && (
                    <div className="text-xs text-[#554233] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE5DA]">
                      <strong>AI Compliance Check:</strong> {app.eligibilitySummary}
                    </div>
                  )}

                  {/* Clarifications badge if any */}
                  {app.clarifications && app.clarifications.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#FFF9F5] border border-[#F0D0BE] text-xs text-[#8C4A1E] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Active Clarification Request: <strong>{app.clarifications[0].requestedInfo}</strong></span>
                      </div>
                      <span className="font-mono text-[10px] text-[#8C4A1E]">Deadline: {app.clarifications[0].deadline}</span>
                    </div>
                  )}

                  {/* Submitted Documents Drawer */}
                  {selectedApplicationId === app.id && (
                    <div className="mt-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DDD0] space-y-2 text-xs">
                      <div className="font-semibold text-[#8C6B52] uppercase text-[10px]">
                        Submitted Statutory & Technical Dossier:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {app.documents.map((doc, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-white border border-[#EDE5DA] flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-[#2D231C] truncate max-w-[180px]">{doc.name}</div>
                              <div className="text-[10px] text-[#8C7A6A]">{doc.category} • {doc.fileSize}</div>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-[#EEF6F0] text-[#1E5732]">
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {tenderApplications.length === 0 && (
              <div className="p-8 text-center text-xs text-[#8A7969]">
                No applications submitted yet for this tender.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 5. AI TOP 5 SHORTLIST RECOMMENDATIONS ---------------- */}
      {activeSubView === 'shortlist' && (
        <div className="space-y-5">
          {/* Statutory Advisory Notice */}
          <div className="p-4 rounded-2xl bg-[#FFF8EB] border border-[#E6C994] text-xs text-[#7A5013] flex items-start gap-3 shadow-2xs">
            <Info className="w-5 h-5 text-[#8C5D17] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-[#55380A] uppercase tracking-wider text-[11px]">
                Statutory Procurement Disclaimer (GFR 2017 Rule 173)
              </div>
              <div className="leading-relaxed">
                The AI Shortlist Recommendation provides evidence-based technical evaluation assistance to support authorized government officers. 
                <strong> The AI does NOT automatically declare a winner or award the contract.</strong> The final qualification and procurement decision remains strictly with the authorized Technical & Bid Evaluation Committee.
              </div>
            </div>
          </div>

          {/* Shortlist Header */}
          <div className="glass-card rounded-2xl p-5 border border-[#E6DDD0] bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#8C6B52] uppercase tracking-wider">
                  Algorithmic Technical Screening
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
                  Top 5 Candidates
                </span>
              </div>
              <h2 className="text-base font-bold text-[#2D231C] mt-0.5">
                AI Shortlist Recommendations for {selectedTender.tenderId}
              </h2>
            </div>

            <div className="text-xs text-[#7A6B5D] font-mono">
              Benchmark: ₹{selectedTender.minimumTurnover || '5.0 Cr'} Turnover • 3 Yrs Experience
            </div>
          </div>

          {/* Top 5 Candidates List */}
          <div className="space-y-4">
            {currentShortlist.map((candidate) => {
              const matchedBidder = bidders.find((b) => b.id === candidate.bidderId);

              return (
                <div 
                  key={candidate.bidderId} 
                  className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm hover:border-[#8C5832]/60 transition-all space-y-4"
                >
                  {/* Candidate Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE0]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#8C5832] text-white flex items-center justify-center font-bold text-xs font-mono shadow-2xs">
                        #{candidate.rank}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#2D231C] flex items-center gap-2">
                          {candidate.companyName}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEF6F0] text-[#1E5732] border border-[#C4DFC8] font-bold">
                            {candidate.complianceScore}% Score
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7A6B5D]">
                          Match: <strong>{candidate.requirementCoverage}</strong> • Files: <strong>{candidate.documentCompleteness}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (matchedBidder) {
                            onNavigate('case-workspace', { tenderId: selectedTender.id, bidderId: matchedBidder.id });
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#FAF5EE] text-[#553E2B] border border-[#DDD3C4] hover:bg-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8C5832]" />
                        <span>Case Workspace</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('reports', { tenderId: selectedTender.id, bidderId: candidate.bidderId });
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Bid Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
                      <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">Eligibility Match</div>
                      <div className="font-bold text-[#2D231C] mt-0.5">{candidate.eligibilityMatchPercent}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
                      <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">Experience Match</div>
                      <div className="font-semibold text-[#2D231C] mt-0.5 truncate">{candidate.experienceMatch}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
                      <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">Technical Match</div>
                      <div className="font-semibold text-[#2D231C] mt-0.5 truncate">{candidate.technicalMatch}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6]">
                      <div className="text-[10px] uppercase font-semibold text-[#8C6B52]">Issues / Flags</div>
                      <div className={`font-bold mt-0.5 ${candidate.issuesCount > 0 ? 'text-[#A0352A]' : 'text-[#1E5732]'}`}>
                        {candidate.issuesCount} Flag{candidate.issuesCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* "Why This Company is Recommended" Section */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DDD0] space-y-2 text-xs">
                    <div className="font-bold text-[#8C5832] uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Why This Company is Recommended:</span>
                    </div>

                    <div className="space-y-1.5">
                      {candidate.whyRecommended.pros.map((pro, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[#2D231C]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5732] shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </div>
                      ))}

                      {candidate.whyRecommended.warnings.map((warn, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[#8C4A1E]">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#8C4A1E] shrink-0 mt-0.5" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
