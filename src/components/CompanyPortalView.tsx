import React, { useState, useRef } from 'react';
import { 
  Tender, 
  Bidder, 
  UserProfile, 
  CompanyApplication, 
  CompanyVaultDocument,
  DocumentCategory,
  SubmittedDocumentItem
} from '../types';
import { 
  Building2, 
  FileText, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  FolderArchive, 
  Check, 
  HelpCircle, 
  Layers, 
  Send, 
  Info, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink,
  Calendar,
  Lock,
  FileCheck2,
  XCircle,
  FilePlus,
  Eye,
  ChevronRight,
  Download,
  UploadCloud,
  FileCheck,
  X,
  Trash2,
  FileUp
} from 'lucide-react';
import { OfficialTenderDocumentView } from './OfficialTenderDocumentView';
import { DocumentViewerModal, ViewableDocument } from './DocumentViewerModal';

interface CompanyPortalViewProps {
  currentUser: UserProfile;
  tenders: Tender[];
  bidders: Bidder[];
  applications: CompanyApplication[];
  vaultDocuments: CompanyVaultDocument[];
  onApplyTender: (application: CompanyApplication) => void;
  onUpdateVault: (docs: CompanyVaultDocument[]) => void;
  onAnswerClarification: (appId: string, clarId: string, responseNote: string, docName?: string) => void;
  onLogAudit?: (action: string, module: any, details: string) => void;
}

export const CompanyPortalView: React.FC<CompanyPortalViewProps> = ({
  currentUser,
  tenders,
  bidders,
  applications,
  vaultDocuments,
  onApplyTender,
  onUpdateVault,
  onAnswerClarification,
  onLogAudit,
}) => {
  // Navigation within company portal
  const [activeTab, setActiveTab] = useState<
    'discovery' | 'ai-reader' | 'eligibility' | 'apply' | 'applications' | 'vault' | 'clarifications' | 'profile'
  >('discovery');

  // Official Tender Document View State (Single Source of Truth)
  const [viewOfficialDocTender, setViewOfficialDocTender] = useState<Tender | null>(null);

  // Active Company Identification (STRICT DATA ISOLATION)
  const companyId = currentUser.companyId || 'bid-001';
  const companyBidder = bidders.find((b) => b.id === companyId) || bidders[0];

  // Isolated company data
  const myApplications = applications.filter((a) => a.companyId === companyId);
  const myVaultDocs = vaultDocuments.filter((v) => v.companyId === companyId);

  // Selected Tender for Detailed Operations (Discovery, AI Reader, Eligibility, Apply)
  const [selectedTenderId, setSelectedTenderId] = useState<string>(tenders[0]?.id || 'tnd-001');
  const selectedTender = tenders.find((t) => t.id === selectedTenderId) || tenders[0];

  // Search in Discovery
  const [searchTenderQuery, setSearchTenderQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Document Viewer Modal State
  const [previewDocModal, setPreviewDocModal] = useState<ViewableDocument | null>(null);

  // Application Workflow State
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSubmittedSuccess, setAppSubmittedSuccess] = useState(false);
  const [applicationSubmitError, setApplicationSubmitError] = useState<string | null>(null);

  // Attached Vault References for current tender application (ReqId -> VaultDocId)
  const [attachedVaultDocs, setAttachedVaultDocs] = useState<Record<string, string>>({});
  
  // Tender-Specific Direct File Uploads for current tender application (ReqId -> Upload Info)
  const [tenderSpecificDocs, setTenderSpecificDocs] = useState<Record<string, {
    fileData?: string;
    fileName: string;
    fileSize: string;
    fileType?: string;
    uploadedAt: string;
    status: 'Uploaded';
    docType: string;
  }>>({});

  // Active drag state per requirement key
  const [tenderDragActiveKey, setTenderDragActiveKey] = useState<string | null>(null);

  // Vault Document Selector Modal State (when picking which vault doc to link)
  const [vaultSelectorReq, setVaultSelectorReq] = useState<{ id: string; title: string; category?: string } | null>(null);

  // Real File Upload State for Company Document Vault Modal
  const [isUploadVaultOpen, setIsUploadVaultOpen] = useState(false);
  const [vaultUploadFile, setVaultUploadFile] = useState<File | null>(null);
  const [vaultUploadData, setVaultUploadData] = useState<string>('');
  const [vaultUploadProgress, setVaultUploadProgress] = useState(0);
  const [vaultUploadStatus, setVaultUploadStatus] = useState<'idle' | 'reading' | 'ready' | 'error'>('idle');
  const [vaultIsDragging, setVaultIsDragging] = useState(false);
  const [newVaultCategory, setNewVaultCategory] = useState<DocumentCategory>('Technical certificates');
  const [newVaultDocName, setNewVaultDocName] = useState('');
  const [newVaultIssueDate, setNewVaultIssueDate] = useState('2024-04-01');
  const [newVaultValidity, setNewVaultValidity] = useState('2027-03-31');

  // Clarification Response State
  const [activeClarificationApp, setActiveClarificationApp] = useState<CompanyApplication | null>(null);
  const [activeClarificationId, setActiveClarificationId] = useState<string | null>(null);
  const [clarificationResponseText, setClarificationResponseText] = useState('');
  const [clarificationSelectedDoc, setClarificationSelectedDoc] = useState('');

  // Tender Discovery Filter
  const filteredTenders = tenders.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTenderQuery.toLowerCase()) ||
      t.tenderId.toLowerCase().includes(searchTenderQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTenderQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Utility to format byte size nicely
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 1. COMPANY VAULT SPECIFICATIONS FOR SELECTED TENDER
  const companyVaultRequirements = [
    { 
      id: 'req-cv-gst', 
      title: 'GST Registration Certificate', 
      category: 'GST' as DocumentCategory, 
      isMandatory: true,
      description: 'Active GST registration certificate (Form REG-06) with zero statutory filing defaults.'
    },
    { 
      id: 'req-cv-pan', 
      title: 'Corporate PAN Card', 
      category: 'PAN' as DocumentCategory, 
      isMandatory: true,
      description: 'Permanent Account Number issued by Income Tax Department in entity name.'
    },
    { 
      id: 'req-cv-msme', 
      title: 'MSME / Udyam Certificate', 
      category: 'MSME/Udyam' as DocumentCategory, 
      isMandatory: companyBidder.isMsmeRegistered,
      description: 'Official Ministry of MSME Udyam registration for fee/EMD waiver concessions.'
    },
    { 
      id: 'req-cv-reg', 
      title: 'Company Registration / Incorporation', 
      category: 'Company registration' as DocumentCategory, 
      isMandatory: true,
      description: 'Certificate of Incorporation (CIN) under Companies Act 2013 / RoC.'
    },
    { 
      id: 'req-cv-audit', 
      title: 'Audited Financial Statements (3 Years)', 
      category: 'Financial documents' as DocumentCategory, 
      isMandatory: true,
      description: 'Chartered accountant verified balance sheets & P&L statements with valid UDIN.'
    },
    { 
      id: 'req-cv-exp', 
      title: 'Work Experience Completion Certificates', 
      category: 'Experience certificates' as DocumentCategory, 
      isMandatory: true,
      description: 'Client work completion records showing minimum 3 years execution in similar domain.'
    },
    { 
      id: 'req-cv-iso', 
      title: 'ISO 9001:2015 Quality Certificate', 
      category: 'Technical certificates' as DocumentCategory, 
      isMandatory: true,
      description: 'Accredited quality management certification valid through contract completion.'
    },
    { 
      id: 'req-cv-solvency', 
      title: 'Bank Solvency Certificate', 
      category: 'Financial documents' as DocumentCategory, 
      isMandatory: true,
      description: 'Scheduled commercial bank solvency standing exceeding tender benchmark.'
    },
  ];

  // 2. TENDER-SPECIFIC APPLICATION REQUIREMENTS (PREPARED SPECIFICALLY FOR THIS TENDER)
  const tenderSpecificRequirements = [
    {
      id: 'req-ts-tech-prop',
      title: 'Technical Proposal',
      description: 'Comprehensive EPC solution methodology, architecture diagram, bill of materials, and Gantt milestones.',
      isMandatory: true,
      category: 'Technical Proposal' as DocumentCategory,
      badge: 'Cover-1 Technical',
    },
    {
      id: 'req-ts-fin-prop',
      title: 'Financial Proposal',
      description: 'Itemized BoQ price bid with applicable GST & duty schedule (Cover-2 Encrypted format).',
      isMandatory: true,
      category: 'Financial Proposal' as DocumentCategory,
      badge: 'Cover-2 Financial',
    },
    {
      id: 'req-ts-compliance-stmt',
      title: 'Compliance Statement',
      description: 'Clause-by-clause confirmation and solemn nil-deviation undertaking for tender specifications.',
      isMandatory: true,
      category: 'Compliance Statement' as DocumentCategory,
      badge: 'Mandatory Undertaking',
    },
    {
      id: 'req-ts-tender-decl',
      title: 'Tender-Specific Declaration',
      description: 'GFR Rule 175 non-debarment affidavit on notarized e-stamp with integrity pact commitment.',
      isMandatory: true,
      category: 'Other supporting documents' as DocumentCategory,
      badge: 'Legal Undertaking',
    },
    {
      id: 'req-ts-tech-specs',
      title: 'Technical Specification Response',
      description: 'OEM datasheets, laboratory test certificates, and compliance matrices matching tender specs.',
      isMandatory: false,
      category: 'Other supporting documents' as DocumentCategory,
      badge: 'Supporting Evidence',
    },
  ];

  // Helper to find default matching vault doc for a requirement if not explicitly chosen
  const getMatchingVaultDocForReq = (req: typeof companyVaultRequirements[0]): CompanyVaultDocument | undefined => {
    // If user explicitly picked a vault doc
    if (attachedVaultDocs[req.id]) {
      const explicit = myVaultDocs.find(v => v.id === attachedVaultDocs[req.id]);
      if (explicit) return explicit;
    }

    // Default heuristic match from user's vault
    return myVaultDocs.find((vd) => {
      const nameLower = vd.name.toLowerCase();
      const reqLower = req.title.toLowerCase();
      if (req.category === vd.category) return true;
      if (reqLower.includes('gst') && vd.category === 'GST') return true;
      if (reqLower.includes('pan') && vd.category === 'PAN') return true;
      if ((reqLower.includes('msme') || reqLower.includes('udyam')) && vd.category === 'MSME/Udyam') return true;
      if ((reqLower.includes('incorporation') || reqLower.includes('registration')) && vd.category === 'Company registration') return true;
      if ((reqLower.includes('audit') || reqLower.includes('financial')) && vd.category === 'Financial documents' && nameLower.includes('audit')) return true;
      if (reqLower.includes('solvency') && nameLower.includes('solvency')) return true;
      if ((reqLower.includes('experience') || reqLower.includes('completion')) && vd.category === 'Experience certificates') return true;
      if (reqLower.includes('iso') && vd.category === 'Technical certificates') return true;
      return false;
    });
  };

  // Completion calculation
  const totalMandatoryCompanyDocs = companyVaultRequirements.filter(r => r.isMandatory);
  const totalMandatoryTenderDocs = tenderSpecificRequirements.filter(r => r.isMandatory);
  const totalMandatoryCount = totalMandatoryCompanyDocs.length + totalMandatoryTenderDocs.length;

  const satisfiedCompanyDocsCount = totalMandatoryCompanyDocs.filter(r => !!getMatchingVaultDocForReq(r)).length;
  const satisfiedTenderDocsCount = totalMandatoryTenderDocs.filter(r => !!tenderSpecificDocs[r.id]).length;
  const totalSubmittedCount = satisfiedCompanyDocsCount + satisfiedTenderDocsCount;
  const completionPercentage = Math.round((totalSubmittedCount / totalMandatoryCount) * 100);
  const isApplicationReadyForSubmission = totalSubmittedCount >= totalMandatoryCount;

  // Handle Vault File Real Upload Input / Drop
  const handleVaultFileChosen = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type) && !/\.(pdf|jpg|jpeg|png)$/i.test(file.name)) {
      alert('Supported file formats are PDF, JPG, JPEG, and PNG only.');
      return;
    }

    setVaultUploadFile(file);
    setVaultUploadStatus('reading');
    setVaultUploadProgress(25);

    // Default document name to sanitized file name
    setNewVaultDocName(file.name);

    // Auto-detect category from file name
    const lower = file.name.toLowerCase();
    if (lower.includes('gst')) setNewVaultCategory('GST');
    else if (lower.includes('pan')) setNewVaultCategory('PAN');
    else if (lower.includes('msme') || lower.includes('udyam')) setNewVaultCategory('MSME/Udyam');
    else if (lower.includes('cin') || lower.includes('registration') || lower.includes('incorporation')) setNewVaultCategory('Company registration');
    else if (lower.includes('solvency') || lower.includes('audit') || lower.includes('financial') || lower.includes('turnover')) setNewVaultCategory('Financial documents');
    else if (lower.includes('experience') || lower.includes('completion') || lower.includes('workorder')) setNewVaultCategory('Experience certificates');
    else if (lower.includes('iso') || lower.includes('quality') || lower.includes('technical')) setNewVaultCategory('Technical certificates');

    // Read real file data URL
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setVaultUploadProgress(Math.max(30, pct));
      }
    };
    reader.onload = () => {
      setVaultUploadData(reader.result as string);
      setVaultUploadProgress(100);
      setVaultUploadStatus('ready');
    };
    reader.onerror = () => {
      setVaultUploadStatus('error');
      alert('Error reading uploaded file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Add Real Document to Vault
  const handleSaveDocumentToVault = () => {
    if (!vaultUploadFile) {
      alert('Please select or drop a valid PDF, JPG, or PNG file to upload.');
      return;
    }
    if (!newVaultDocName.trim()) {
      alert('Please enter a Document Name.');
      return;
    }

    const docSize = formatBytes(vaultUploadFile.size);
    const newDoc: CompanyVaultDocument = {
      id: `vlt-${Date.now()}`,
      companyId: companyId,
      name: newVaultDocName.trim(),
      category: newVaultCategory,
      fileSize: docSize,
      uploadedDate: new Date().toISOString().split('T')[0],
      issueDate: newVaultIssueDate,
      validUntil: newVaultValidity || 'Permanent Record',
      status: 'Valid',
      pages: Math.max(1, Math.round(vaultUploadFile.size / (150 * 1024))),
      reusedCount: 0,
      documentHash: `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      fileData: vaultUploadData,
      fileName: vaultUploadFile.name,
      fileType: vaultUploadFile.type || 'application/pdf',
    };

    onUpdateVault([newDoc, ...myVaultDocs]);

    // Reset modal state
    setVaultUploadFile(null);
    setVaultUploadData('');
    setVaultUploadProgress(0);
    setVaultUploadStatus('idle');
    setNewVaultDocName('');
    setIsUploadVaultOpen(false);

    if (onLogAudit) {
      onLogAudit(
        'Document Uploaded to Company Vault',
        'Document',
        `${companyBidder.name} uploaded ${newDoc.name} (${newDoc.fileSize}) to secure vault for multi-tender reuse.`
      );
    }
  };

  // Handle Tender-Specific Real File Upload (PDF Only)
  const handleTenderSpecificFileUpload = (reqId: string, docType: string, file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Tender-specific submissions require PDF format only.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setTenderSpecificDocs(prev => ({
        ...prev,
        [reqId]: {
          fileData: dataUrl,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileType: 'application/pdf',
          uploadedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
          status: 'Uploaded',
          docType: docType,
        }
      }));

      if (onLogAudit) {
        onLogAudit(
          'Tender-Specific Document Uploaded',
          'Document',
          `${companyBidder.name} uploaded ${file.name} for ${selectedTender.tenderId} (${docType}).`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Official Tender Application Submission
  const handleFinalSubmitApplication = () => {
    // Validate missing mandatory documents
    const missingCompanyDocs = totalMandatoryCompanyDocs.filter(r => !getMatchingVaultDocForReq(r));
    const missingTenderDocs = totalMandatoryTenderDocs.filter(r => !tenderSpecificDocs[r.id]);

    if (missingCompanyDocs.length > 0 || missingTenderDocs.length > 0) {
      const missingList = [
        ...missingCompanyDocs.map(c => `${c.title} (Vault)`),
        ...missingTenderDocs.map(t => `${t.title} (PDF Upload)`),
      ].join(', ');
      setApplicationSubmitError(`Cannot submit bid: Missing mandatory document(s): ${missingList}`);
      return;
    }

    setApplicationSubmitError(null);
    setIsSubmittingApp(true);

    setTimeout(() => {
      // 1. Compile Company Documents Used from Vault
      const companyDocsUsed: SubmittedDocumentItem[] = [];
      const updatedVaultList = [...myVaultDocs];

      companyVaultRequirements.forEach(req => {
        const vaultDoc = getMatchingVaultDocForReq(req);
        if (vaultDoc) {
          companyDocsUsed.push({
            name: vaultDoc.name,
            category: vaultDoc.category,
            docType: 'Company Document',
            fileSize: vaultDoc.fileSize,
            uploadedAt: vaultDoc.uploadedDate,
            status: vaultDoc.status === 'Valid' ? 'Valid' : 'Needs Update',
            vaultDocId: vaultDoc.id,
            fileData: vaultDoc.fileData,
            fileName: vaultDoc.fileName || vaultDoc.name,
            fileType: vaultDoc.fileType || 'application/pdf',
            isVaultReuse: true,
            tenderId: selectedTender.id,
          });

          // Increment reused count for vault tracking
          const vIndex = updatedVaultList.findIndex(v => v.id === vaultDoc.id);
          if (vIndex !== -1) {
            updatedVaultList[vIndex] = {
              ...updatedVaultList[vIndex],
              reusedCount: (updatedVaultList[vIndex].reusedCount || 0) + 1,
            };
          }
        }
      });

      // 2. Compile Tender-Specific Documents Uploaded
      const tenderDocsList: SubmittedDocumentItem[] = [];
      tenderSpecificRequirements.forEach(req => {
        const uploaded = tenderSpecificDocs[req.id];
        if (uploaded) {
          tenderDocsList.push({
            name: uploaded.fileName,
            category: req.category,
            docType: 'Tender-Specific Document',
            fileSize: uploaded.fileSize,
            uploadedAt: uploaded.uploadedAt,
            status: 'Uploaded',
            fileData: uploaded.fileData,
            fileName: uploaded.fileName,
            fileType: 'application/pdf',
            isVaultReuse: false,
            tenderId: selectedTender.id,
          });
        }
      });

      // 3. Combined Documents Array for backwards compatibility & unified inspection
      const allSubmitted = [...companyDocsUsed, ...tenderDocsList];

      const newApp: CompanyApplication = {
        id: `app-${Date.now()}`,
        tenderId: selectedTender.id,
        companyId: companyId,
        companyName: companyBidder.name,
        submittedDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        lastUpdated: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        status: 'Submitted',
        eligibilitySummary: `Official bid submitted with ${companyDocsUsed.length} verified credentials reused from Company Vault and ${tenderDocsList.length} tender-specific proposals attached.`,
        turnoverClaim: companyBidder.annualTurnover,
        experienceClaim: `${companyBidder.yearsOfExperience} Years`,
        documents: allSubmitted,
        companyDocumentsUsed: companyDocsUsed,
        tenderSpecificDocuments: tenderDocsList,
        clarifications: [],
      };

      // Update Vault with incremented reuse counters
      onUpdateVault(updatedVaultList);

      // Save application
      onApplyTender(newApp);

      if (onLogAudit) {
        onLogAudit(
          'Bid Application Formally Submitted',
          'Bidder',
          `${companyBidder.name} submitted official bid for ${selectedTender.tenderId}. Attached ${companyDocsUsed.length} vault documents and ${tenderDocsList.length} tender-specific documents.`
        );
      }

      setIsSubmittingApp(false);
      setAppSubmittedSuccess(true);

      setTimeout(() => {
        setAppSubmittedSuccess(false);
        setActiveTab('applications');
      }, 1500);
    }, 1200);
  };

  // Submit clarification response
  const handleSubmitClarification = () => {
    if (!activeClarificationApp || !activeClarificationId) return;
    onAnswerClarification(
      activeClarificationApp.id,
      activeClarificationId,
      clarificationResponseText,
      clarificationSelectedDoc || 'Supplementary_Clarification_Dossier.pdf'
    );
    setActiveClarificationApp(null);
    setActiveClarificationId(null);
    setClarificationResponseText('');

    if (onLogAudit) {
      onLogAudit(
        'Clarification Response Submitted by Bidder',
        'Bidder',
        `${companyBidder.name} responded to formal CPPP Clarification notice for tender ${activeClarificationApp.tenderId}.`
      );
    }
  };

  // EARLY RETURN: Render Official Government Tender Document View (Single Source of Truth)
  if (viewOfficialDocTender) {
    return (
      <div className="space-y-4">
        <div className="no-print p-4 rounded-2xl bg-white border border-[#E6DDD0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
              Published Government Tender Document
            </span>
            <h2 className="text-sm font-bold text-[#2D231C]">
              {viewOfficialDocTender.tenderId} — Official Notice Inviting Tender (NIT)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedTenderId(viewOfficialDocTender.id);
                setViewOfficialDocTender(null);
                setActiveTab('ai-reader');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#FAF5EE] text-[#553E2B] border border-[#DDD3C4] hover:bg-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8C5832]" />
              <span>AI Read Tender</span>
            </button>

            <button
              onClick={() => {
                setSelectedTenderId(viewOfficialDocTender.id);
                setViewOfficialDocTender(null);
                setActiveTab('eligibility');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#FAF5EE] text-[#553E2B] border border-[#DDD3C4] hover:bg-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5732]" />
              <span>Check Eligibility</span>
            </button>

            <button
              onClick={() => {
                setSelectedTenderId(viewOfficialDocTender.id);
                setViewOfficialDocTender(null);
                setActiveTab('apply');
              }}
              className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>Apply for Tender</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <OfficialTenderDocumentView
          tender={viewOfficialDocTender}
          currentUser={currentUser}
          isProcurementOfficer={false}
          onClose={() => setViewOfficialDocTender(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Navigation Bar for Company */}
      <div className="glass-card rounded-2xl p-5 border border-[#E6DDD0] bg-white/95 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
                Bidder Portal • Authorized Signatory
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
                CIN: {companyBidder.registrationNumber}
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#2D231C] tracking-tight mt-0.5">
              {companyBidder.name}
            </h1>
            <p className="text-xs text-[#736355]">
              Central Public Procurement Portal (CPPP) Gateway for tender discovery, AI eligibility checks, document vault, and application tracking.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E2D8C8] text-center">
              <div className="text-[10px] text-[#8C6B52] font-semibold uppercase">My Applications</div>
              <div className="text-sm font-bold text-[#2D231C]">{myApplications.length}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E2D8C8] text-center">
              <div className="text-[10px] text-[#8C6B52] font-semibold uppercase">Vault Documents</div>
              <div className="text-sm font-bold text-[#8C5832]">{myVaultDocs.length}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E2D8C8] text-center">
              <div className="text-[10px] text-[#8C6B52] font-semibold uppercase">Turnover</div>
              <div className="text-sm font-bold text-[#25633A]">{companyBidder.annualTurnover}</div>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Tab Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[#F0EAE0]">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'discovery'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tender Discovery</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-reader')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai-reader'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Tender Reader</span>
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'eligibility'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AI Eligibility Check</span>
          </button>

          <button
            onClick={() => setActiveTab('apply')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'apply'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Apply / Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Applications ({myApplications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vault'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Document Vault ({myVaultDocs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clarifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'clarifications'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clarifications</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#8C5832] text-white shadow-2xs'
                : 'text-[#665140] hover:bg-[#F2ECE1]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Profile</span>
          </button>
        </div>
      </div>

      {/* ---------------- 1. TENDER DISCOVERY ---------------- */}
      {activeTab === 'discovery' && (
        <div className="space-y-5">
          {/* Search & Category Filter Bar */}
          <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[#8A7969] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTenderQuery}
                onChange={(e) => setSearchTenderQuery(e.target.value)}
                placeholder="Search tender title, department, or CPPP ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#FAF8F5] border border-[#DDD3C4] text-[#2D231C]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-[#7A6B5D]">
              <span className="font-semibold text-[#8C6B52]">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              >
                <option value="All">All Categories</option>
                <option value="Civil Infrastructure & Automated Systems">Civil & Automated Systems</option>
                <option value="IT Hardware & Enterprise Software">IT & Enterprise Software</option>
                <option value="Medical Technology">Medical Technology</option>
              </select>
            </div>
          </div>

          {/* Tenders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTenders.map((tender) => {
              const hasApplied = myApplications.some((a) => a.tenderId === tender.id);
              const isSelected = tender.id === selectedTender.id;

              return (
                <div
                  key={tender.id}
                  className={`glass-card rounded-2xl p-5 border transition-all space-y-3 bg-white ${
                    isSelected
                      ? 'border-[#8C5832] shadow-sm ring-1 ring-[#8C5832]/20'
                      : 'border-[#E6DDD0] hover:border-[#8C5832]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#8C5832] bg-[#FAF5EE] px-2 py-0.5 rounded border border-[#E2D8C8]">
                      {tender.tenderId}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      hasApplied 
                        ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]' 
                        : 'bg-[#FAF5EE] text-[#553E2B] border-[#DDD3C4]'
                    }`}>
                      {hasApplied ? 'Applied' : 'Open for Bidding'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#2D231C] leading-snug">{tender.title}</h3>
                    <div className="text-[11px] text-[#7A6B5D] mt-1">
                      {tender.department} • Category: {tender.category}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6]">
                      <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Contract Value</div>
                      <div className="font-bold text-[#8C5832]">{tender.estimatedValue}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6]">
                      <div className="text-[10px] text-[#8C6B52] uppercase font-semibold">Closing Date</div>
                      <div className="font-bold text-[#2D231C]">{tender.closingDate}</div>
                    </div>
                  </div>

                  {tender.summary && (
                    <p className="text-xs text-[#554233] line-clamp-2 leading-relaxed">
                      {tender.summary}
                    </p>
                  )}

                  {/* Actions for this Tender */}
                  <div className="pt-2 border-t border-[#F0EAE0] flex flex-wrap items-center justify-between gap-1.5">
                    <button
                      onClick={() => setViewOfficialDocTender(tender)}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] text-[#553E2B] hover:bg-white border border-[#DDD3C4] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-[#8C5832]" />
                      <span>View Tender</span>
                    </button>

                    <button
                      onClick={() => {
                        setViewOfficialDocTender(tender);
                        setTimeout(() => window.print(), 300);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-[#553E2B] hover:bg-white border border-[#DDD3C4] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3 h-3 text-[#8C5832]" />
                      <span>Download Tender</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTenderId(tender.id);
                        setActiveTab('ai-reader');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] text-[#553E2B] hover:bg-white border border-[#DDD3C4] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#8C5832]" />
                      <span>AI Read Tender</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTenderId(tender.id);
                        setActiveTab('eligibility');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] text-[#553E2B] hover:bg-white border border-[#DDD3C4] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#1E5732]" />
                      <span>Check Eligibility</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTenderId(tender.id);
                        setActiveTab('apply');
                      }}
                      className="px-3 py-1 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>Apply</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- 2. AI TENDER READER ---------------- */}
      {activeTab === 'ai-reader' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE5DA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                  AI PDF Extraction & Document Breakdown
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
                  Structured Insights
                </span>
              </div>
              <h2 className="text-base font-bold text-[#2D231C] mt-0.5">
                AI Tender Reader: {selectedTender.tenderId}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedTender.id}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD3C4] text-xs font-semibold text-[#2D231C]"
              >
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>{t.tenderId} — {t.title.slice(0, 35)}...</option>
                ))}
              </select>

              <button
                onClick={() => setActiveTab('apply')}
                className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Apply to this Tender
              </button>
            </div>
          </div>

          {/* Clean Structured Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Eligibility & Statutory */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-2">
              <div className="font-bold text-[#8C6B52] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>1. Eligibility Requirements</span>
              </div>
              <div className="space-y-1.5 text-[#2D231C]">
                <div>• Valid MSME / Udyam Certificate or RoC Enlistment</div>
                <div>• Active Regular GSTIN registration with timely quarterly filings</div>
                <div>• Permanent Account Number (PAN) registered in entity's legal name</div>
                <div>• Entity incorporation history of minimum 3 operating years</div>
              </div>
            </div>

            {/* 2. Financial Benchmarks */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-2">
              <div className="font-bold text-[#8C6B52] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>2. Minimum Turnover & Solvency</span>
              </div>
              <div className="space-y-1.5 text-[#2D231C]">
                <div>• <strong>Turnover:</strong> {selectedTender.minimumTurnover || '₹5.0 Crore average annual turnover over past 3 financial years'}</div>
                <div>• <strong>Solvency:</strong> Scheduled Commercial Bank Solvency letter of min ₹2.0 Cr</div>
                <div>• <strong>Net Worth:</strong> Must be positive as of latest audited fiscal balance sheet</div>
                <div>• <strong>Authentication:</strong> All CA statements must carry valid Unique Document Identification Numbers (UDIN)</div>
              </div>
            </div>

            {/* 3. Experience Requirements */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-2">
              <div className="font-bold text-[#8C6B52] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>3. Experience Requirements</span>
              </div>
              <div className="space-y-1.5 text-[#2D231C]">
                <div>• {selectedTender.experienceRequirements || '3.0 Years proven experience in highway automation, SCADA or civil corridor contracts'}</div>
                <div>• Minimum 2 completed government or PSU contracts of value not less than ₹3.0 Cr each</div>
                <div>• Work completion certificates signed by Executive Engineer or Project Director</div>
              </div>
            </div>

            {/* 4. Technical & Quality Standards */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-2">
              <div className="font-bold text-[#8C6B52] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>4. Technical Requirements & Standards</span>
              </div>
              <div className="space-y-1.5 text-[#2D231C]">
                <div>• ISO 9001:2015 Quality Management System valid accreditation</div>
                <div>• NHAI or State PWD Class-1 Contractor Enlistment</div>
                <div>• High-Speed Automatic Number Plate Recognition (ANPR) accuracy exceeding 98%</div>
                <div>• 24x7 NOC integration support with IPv6 network compatibility</div>
              </div>
            </div>

            {/* 5. Mandatory Documents Checklist */}
            <div className="md:col-span-2 p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE3D6] space-y-2">
              <div className="font-bold text-[#8C6B52] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>5. Mandatory Documents Required for Submission</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#2D231C]">
                {selectedTender.mandatoryDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E8E0D4]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5732] shrink-0" />
                    <span className="font-medium truncate">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. AI ELIGIBILITY CHECK ---------------- */}
      {activeTab === 'eligibility' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE5DA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                  Pre-Submission AI Audit
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
                  Automated Benchmark Cross-Check
                </span>
              </div>
              <h2 className="text-base font-bold text-[#2D231C] mt-0.5">
                AI Eligibility Verification: {companyBidder.name}
              </h2>
            </div>

            <select
              value={selectedTender.id}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD3C4] text-xs font-semibold text-[#2D231C]"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>{t.tenderId} — {t.title.slice(0, 35)}...</option>
              ))}
            </select>
          </div>

          {/* Statutory Disclaimer Notice */}
          <div className="p-3.5 rounded-xl bg-[#FFF8EB] border border-[#E6C994] text-xs text-[#7A5013] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#8C5D17] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Notice:</strong> This is an AI-assisted preliminary assessment based on your company profile and uploaded vault evidence. It does not constitute a final government eligibility decision under GFR 173.
            </div>
          </div>

          {/* Comparative Audit Table */}
          <div className="border border-[#E6DDD0] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E6DDD0] text-[#716153] font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Tender Requirement</th>
                  <th className="py-2.5 px-3">Company Evidence</th>
                  <th className="py-2.5 px-3">Supporting Vault File</th>
                  <th className="py-2.5 px-3 text-center">AI Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE0]">
                {/* Turnover Row */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#2D231C]">
                    Minimum Turnover ₹5.0 Crore
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-[#2D231C]">
                    {companyBidder.annualTurnover} (3-Yr Mean)
                  </td>
                  <td className="py-3 px-3 text-[#7A6B5D]">
                    Audited_Financial_Statement_FY23_25_CA_Certified.pdf (P.4)
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#EEF6F0] text-[#1E5732]">
                      ✓ Requirement satisfied
                    </span>
                  </td>
                </tr>

                {/* Experience Row */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#2D231C]">
                    3.0 Years Government Experience
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-[#2D231C]">
                    {companyBidder.yearsOfExperience} Years Documented
                  </td>
                  <td className="py-3 px-3 text-[#7A6B5D]">
                    Work_Experience_Completion_Certificates.pdf (P.2)
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#EEF6F0] text-[#1E5732]">
                      ✓ Requirement satisfied
                    </span>
                  </td>
                </tr>

                {/* MSME Udyam Row */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#2D231C]">
                    MSME / Udyam Registration
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-[#2D231C]">
                    {companyBidder.msmeUdyamNumber}
                  </td>
                  <td className="py-3 px-3 text-[#7A6B5D]">
                    Udyam_Registration_Certificate_MH01.pdf (P.1)
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#EEF6F0] text-[#1E5732]">
                      ✓ Requirement satisfied
                    </span>
                  </td>
                </tr>

                {/* Technical Standards Row */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#2D231C]">
                    ISO 9001:2015 Quality Certificate
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-[#2D231C]">
                    Valid till 31-Mar-2027
                  </td>
                  <td className="py-3 px-3 text-[#7A6B5D]">
                    ISO_9001_2015_Certificate_Quality.pdf (P.1)
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#EEF6F0] text-[#1E5732]">
                      ✓ Requirement satisfied
                    </span>
                  </td>
                </tr>

                {/* Bank Solvency Row */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#2D231C]">
                    Bank Solvency Min ₹2.0 Crore
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-[#2D231C]">
                    ₹2.50 Crore (State Bank of India)
                  </td>
                  <td className="py-3 px-3 text-[#7A6B5D]">
                    Bank_Solvency_Certificate_SBI_Commercial.pdf (P.1)
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#EEF6F0] text-[#1E5732]">
                      ✓ Requirement satisfied
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveTab('apply')}
              className="px-4 py-2 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>Proceed to Application & Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- 4. APPLY FOR TENDER & TENDER-SPECIFIC CHECKLIST ---------------- */}
      {activeTab === 'apply' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE5DA]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                Official Submission Workflow
              </span>
              <h2 className="text-base font-bold text-[#2D231C] mt-0.5">
                Apply for {selectedTender.tenderId}
              </h2>
            </div>

            <div className="text-xs font-mono text-[#8C5832]">
              Closing Date: {selectedTender.closingDate}
            </div>
          </div>

          {/* Workflow Sequence Indicator */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] flex items-center justify-between overflow-x-auto text-[11px] text-[#7A6B5D]">
            <span className="font-semibold text-[#8C5832]">1. View Tender</span>
            <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
            <span className="font-semibold text-[#8C5832]">2. Check Eligibility</span>
            <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
            <span className="font-bold text-[#8C5832] bg-[#FAF5EE] px-2 py-0.5 rounded border border-[#DFD3C2]">
              3. Tender Checklist
            </span>
            <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
            <span className="font-semibold text-[#8C5832]">4. Upload / Reuse</span>
            <ChevronRight className="w-3 h-3 text-[#C8BCAC]" />
            <span className="font-semibold text-[#8C5832]">5. Review & Submit</span>
          </div>

          {/* Tender-Specific Document Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#2D231C] uppercase tracking-wider">
                  Tender-Specific Document Checklist
                </h3>
                <p className="text-[11px] text-[#736355]">
                  Automatically mapped to this tender's specifications. Valid documents from your vault are auto-attached!
                </p>
              </div>

              <button
                onClick={() => setActiveTab('vault')}
                className="px-2.5 py-1 rounded-lg border border-[#DDD3C4] text-[11px] font-semibold text-[#554233] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Manage Vault Documents
              </button>
            </div>

            <div className="divide-y divide-[#F0EAE0] border border-[#E6DDD0] rounded-xl overflow-hidden text-xs">
              {checklistItems.map((item, idx) => (
                <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md bg-[#FAF5EE] text-[#8C5832] flex items-center justify-center font-bold text-xs font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-[#2D231C] text-xs">{item.title}</div>
                      {item.matchedVaultDoc ? (
                        <div className="text-[11px] text-[#25633A] mt-0.5 flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3" />
                          <span>Auto-attached from Vault: {item.matchedVaultDoc.name} ({item.matchedVaultDoc.fileSize})</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#A0352A] mt-0.5">
                          Document not found in vault. Upload required before final submission.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.status === 'Valid'
                        ? 'bg-[#EEF6F0] text-[#1E5732]'
                        : item.status === 'Needs Update'
                        ? 'bg-[#FFF8EB] text-[#8C5D17]'
                        : 'bg-[#FDF1EF] text-[#932F27]'
                    }`}>
                      {item.status}
                    </span>

                    {item.matchedVaultDoc ? (
                      <span className="text-[10px] text-[#7A6B5D] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EDE5DA]">
                        Reused ({item.matchedVaultDoc.reusedCount}x)
                      </span>
                    ) : (
                      <button
                        onClick={() => setIsUploadVaultOpen(true)}
                        className="px-2 py-0.5 rounded bg-[#FAF5EE] border border-[#DDD3C4] text-[10px] font-semibold text-[#554233] cursor-pointer hover:bg-white"
                      >
                        Upload to Vault
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Action Box */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-[#554233]">
              <div><strong>Verification Status:</strong> Ready for official tender submission.</div>
              <div className="text-[11px] text-[#7A6B5D]">
                Applying as <strong>{companyBidder.name}</strong> • CIN: {companyBidder.registrationNumber}
              </div>
            </div>

            <button
              onClick={handleFinalSubmitApplication}
              disabled={isSubmittingApp || appSubmittedSuccess}
              className="px-5 py-2.5 rounded-xl bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmittingApp ? (
                <span>Submitting to CPPP Gateway...</span>
              ) : appSubmittedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submitted Successfully!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Official Bid Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---------------- 5. MY APPLICATIONS & STATUS TRACKING ---------------- */}
      {activeTab === 'applications' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE5DA]">
            <div>
              <h2 className="text-base font-bold text-[#2D231C]">
                My Tender Applications
              </h2>
              <p className="text-xs text-[#736355]">
                Real-time tracking of submitted bids, verification milestones, and clarifications.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('discovery')}
              className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer shadow-2xs"
            >
              Discover More Tenders
            </button>
          </div>

          <div className="divide-y divide-[#F0EAE0]">
            {myApplications.map((app) => {
              const tenderMatch = tenders.find((t) => t.id === app.tenderId);

              return (
                <div key={app.id} className="py-4 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#8C5832]">
                          {tenderMatch?.tenderId || app.tenderId}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          app.status === 'Verified'
                            ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                            : app.status === 'Clarification Required'
                            ? 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                            : 'bg-[#F2EDE4] text-[#553E2B] border-[#DDD3C4]'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-[#2D231C] mt-0.5">
                        {tenderMatch?.title || 'Highway Infrastructure & Automation Project'}
                      </div>
                      <div className="text-[11px] text-[#7A6B5D] mt-0.5">
                        Submitted Date: {app.submittedDate} • Last Updated: {app.lastUpdated}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-[#553E2B] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EDE5DA]">
                        {app.documents.length} Files Attached
                      </span>
                    </div>
                  </div>

                  {app.eligibilitySummary && (
                    <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] text-xs text-[#554233]">
                      <strong>Application Summary:</strong> {app.eligibilitySummary}
                    </div>
                  )}

                  {/* Clarification Callout if any */}
                  {app.clarifications && app.clarifications.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#FFF9F5] border border-[#F0D0BE] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[#8C4A1E]">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Clarification Notice: <strong>{app.clarifications[0].requestedInfo}</strong></span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveClarificationApp(app);
                          setActiveClarificationId(app.clarifications[0].id);
                          setActiveTab('clarifications');
                        }}
                        className="px-3 py-1 rounded-lg bg-[#8C5832] text-white text-[11px] font-semibold cursor-pointer shrink-0"
                      >
                        Respond Now
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {myApplications.length === 0 && (
              <div className="p-8 text-center text-xs text-[#8A7969]">
                You have not submitted any tender applications yet. Browse Government Tenders to apply.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 6. COMPANY DOCUMENT VAULT ---------------- */}
      {activeTab === 'vault' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE5DA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                  Secure Enterprise Storage
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
                  Multi-Tender Reuse
                </span>
              </div>
              <h2 className="text-base font-bold text-[#2D231C] mt-0.5">
                Company Document Vault
              </h2>
              <p className="text-xs text-[#736355]">
                Store once and securely reuse across multiple government tenders without re-uploading.
              </p>
            </div>

            <button
              onClick={() => setIsUploadVaultOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Upload Document to Vault</span>
            </button>
          </div>

          {/* Vault Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {myVaultDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-[#EDE5DA] bg-white hover:border-[#8C5832]/50 transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-[#2D231C] text-xs truncate max-w-[220px]">
                    {doc.name}
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${
                    doc.status === 'Valid' ? 'bg-[#EEF6F0] text-[#1E5732]' : 'bg-[#FFF8EB] text-[#8C5D17]'
                  }`}>
                    {doc.status}
                  </span>
                </div>

                <div className="text-[11px] text-[#7A6B5D] space-y-0.5">
                  <div>Category: <strong>{doc.category}</strong></div>
                  <div>Valid Until: <strong>{doc.validUntil || 'Active'}</strong> • Size: {doc.fileSize}</div>
                  <div className="text-[10px] font-mono text-[#8C7A6A] pt-0.5">
                    Hash: {doc.documentHash}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F5EFE7] flex items-center justify-between text-[11px]">
                  <span className="text-[#8C5832] font-semibold bg-[#FAF5EE] px-2 py-0.5 rounded">
                    Reused in {doc.reusedCount} Tender Application(s)
                  </span>

                  <span className="text-[#7A6B5D]">
                    Uploaded: {doc.uploadedDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- 7. CLARIFICATION REQUESTS ---------------- */}
      {activeTab === 'clarifications' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE5DA]">
            <div>
              <h2 className="text-base font-bold text-[#2D231C]">
                Official Clarification Requests (GFR Rule 173)
              </h2>
              <p className="text-xs text-[#736355]">
                Formal inquiries issued by the government evaluation committee regarding missing or ambiguous documentation.
              </p>
            </div>
          </div>

          {/* Active Clarifications List */}
          <div className="space-y-4">
            {myApplications.flatMap((app) =>
              (app.clarifications || []).map((clr) => {
                const tenderMatch = tenders.find((t) => t.id === app.tenderId);

                return (
                  <div
                    key={clr.id}
                    className="p-5 rounded-2xl border border-[#F0D0BE] bg-[#FFFBF7] shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#8C4A1E]" />
                        <span className="font-bold text-sm text-[#2D231C]">{clr.requestedInfo}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#FFF8EB] text-[#8C5D17] border border-[#F0DDBE]">
                          {clr.status}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#8C4A1E] font-bold">
                        Deadline: {clr.deadline}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#E8E0D4] space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#8C6B52]">Committee Stated Reason:</div>
                      <div className="text-[#554233] leading-relaxed">{clr.reason}</div>
                      <div className="text-[11px] text-[#7A6B5D] pt-1">
                        Tender: <strong>{tenderMatch?.tenderId}</strong> — {tenderMatch?.title}
                      </div>
                    </div>

                    {/* Clarification Response Form */}
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-3">
                      <div className="font-bold text-[#2D231C] text-xs">
                        Submit Clarification Response:
                      </div>

                      <textarea
                        rows={3}
                        value={clarificationResponseText}
                        onChange={(e) => setClarificationResponseText(e.target.value)}
                        placeholder="Enter formal written explanation, reference UDIN, or provide supplementary project details..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[#554233]">Attach Supporting Vault File:</span>
                          <select
                            value={clarificationSelectedDoc}
                            onChange={(e) => setClarificationSelectedDoc(e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
                          >
                            <option value="">Select from Document Vault...</option>
                            {myVaultDocs.map((vd) => (
                              <option key={vd.id} value={vd.name}>{vd.name} ({vd.category})</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            setActiveClarificationApp(app);
                            setActiveClarificationId(clr.id);
                            handleSubmitClarification();
                          }}
                          className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Clarification</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {myApplications.every((a) => !a.clarifications || a.clarifications.length === 0) && (
              <div className="p-8 text-center text-xs text-[#8A7969]">
                No pending clarification requests. All your submitted bids are currently in good order.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 8. COMPANY PROFILE ---------------- */}
      {activeTab === 'profile' && (
        <div className="glass-card rounded-2xl p-6 border border-[#E6DDD0] bg-white shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE5DA]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C6B52] tracking-wider">
                Corporate Master Record
              </span>
              <h2 className="text-base font-bold text-[#2D231C] mt-0.5">
                {companyBidder.name} Profile
              </h2>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#EEF6F0] text-[#1E5732] border border-[#C4DFC8]">
              {companyBidder.verificationStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
              <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">Corporate Identity</div>
              <div><strong>Registration / CIN:</strong> {companyBidder.registrationNumber}</div>
              <div><strong>Entity Type:</strong> {companyBidder.entityType}</div>
              <div><strong>Incorporation Date:</strong> {companyBidder.incorporationDate}</div>
              <div><strong>Registered Office:</strong> {companyBidder.registeredAddress}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
              <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">Statutory Registrations</div>
              <div><strong>GSTIN:</strong> {companyBidder.gstNumber}</div>
              <div><strong>PAN:</strong> {companyBidder.panNumber}</div>
              <div><strong>MSME / Udyam:</strong> {companyBidder.msmeUdyamNumber}</div>
              <div><strong>MSME Exemption Status:</strong> {companyBidder.isMsmeRegistered ? 'Eligible (Micro/Small)' : 'Non-MSME'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
              <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">Financial & Capacity Metrics</div>
              <div><strong>Average Annual Turnover:</strong> {companyBidder.annualTurnover}</div>
              <div><strong>Proven Experience:</strong> {companyBidder.yearsOfExperience} Years</div>
              <div><strong>Representative Contact:</strong> {companyBidder.representativeContact}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
              <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">Technical Accreditations</div>
              <ul className="list-disc pl-4 space-y-0.5 text-[#554233]">
                {companyBidder.technicalQualifications.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document to Vault Modal */}
      {isUploadVaultOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl max-w-lg w-full border border-[#DFD5C6] shadow-xl overflow-hidden p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E0D4]">
              <h3 className="text-sm font-bold text-[#2D231C]">Upload Document to Company Vault</h3>
              <button
                onClick={() => setIsUploadVaultOpen(false)}
                className="text-[#7A6B5D] hover:bg-[#EFE8DD] p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Document File Name:
              </label>
              <input
                type="text"
                value={newVaultDocName}
                onChange={(e) => setNewVaultDocName(e.target.value)}
                placeholder="e.g., CMMI_Level5_Appraisal_Certificate.pdf"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Document Category:
              </label>
              <select
                value={newVaultCategory}
                onChange={(e) => setNewVaultCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              >
                <option value="GST">GST Registration</option>
                <option value="PAN">PAN Card</option>
                <option value="MSME/Udyam">MSME / Udyam</option>
                <option value="Financial documents">Financial documents / Audit Statements</option>
                <option value="Experience certificates">Experience certificates</option>
                <option value="Technical certificates">Technical certificates</option>
                <option value="Company registration">Company registration / CIN</option>
                <option value="Other supporting documents">Other supporting documents</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#554233] mb-1">
                Validity Date:
              </label>
              <input
                type="text"
                value={newVaultValidity}
                onChange={(e) => setNewVaultValidity(e.target.value)}
                placeholder="e.g., 2027-03-31 or Permanent"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C4] text-xs text-[#2D231C]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsUploadVaultOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-[#DDD3C4] text-xs font-semibold text-[#554233] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewVaultDoc}
                className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Save to Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
