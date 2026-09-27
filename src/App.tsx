import React, { useState } from 'react';
import { 
  UserProfile, 
  Tender, 
  Bidder, 
  BidEvaluation, 
  AuditLogItem, 
  BidderDocument,
  ReviewQueueItem,
  MultiSourceVerification,
  CrossDocValidationItem,
  ClauseEvidenceTrace,
  DocumentVersionDiff,
  DependencyNode,
  RepoDocument,
  KnowledgeMemoryCase,
  WhatIfScenarioItem,
  AdminSystemConfig,
  CompanyApplication,
  CompanyVaultDocument,
  AiShortlistCandidate
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_TENDERS, 
  INITIAL_BIDDERS, 
  INITIAL_EVALUATIONS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_REVIEW_QUEUE,
  INITIAL_MULTI_SOURCE,
  INITIAL_CROSS_DOC_CHECKS,
  INITIAL_CLAUSE_TRACES,
  INITIAL_DOCUMENT_VERSIONS,
  INITIAL_DEPENDENCY_NODES,
  INITIAL_REPO_DOCS,
  INITIAL_KNOWLEDGE_CASES,
  INITIAL_WHAT_IF_ITEMS,
  INITIAL_ADMIN_CONFIG,
  INITIAL_COMPANY_APPLICATIONS,
  INITIAL_VAULT_DOCUMENTS,
  INITIAL_SHORTLIST_CANDIDATES
} from './data/mockData';
import { Header } from './components/Header';
import { WorkflowBar } from './components/WorkflowBar';
import { Navigation, NavTabId } from './components/Navigation';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { TenderManagement } from './components/TenderManagement';
import { BidderManagement } from './components/BidderManagement';
import { DocumentWorkspace } from './components/DocumentWorkspace';
import { AiExtractionView } from './components/AiExtractionView';
import { ComplianceMatrixView } from './components/ComplianceMatrixView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { EvidenceTraceabilityView } from './components/EvidenceTraceabilityView';
import { MultiSourceValidationView } from './components/MultiSourceValidationView';
import { DocumentVersionDiffView } from './components/DocumentVersionDiffView';
import { ReportsView } from './components/ReportsView';
import { AuditTrailView } from './components/AuditTrailView';

// Division 3 Components
import { ComplianceDashboardView } from './components/ComplianceDashboardView';
import { BidderComparisonView } from './components/BidderComparisonView';
import { CaseWorkspaceView } from './components/CaseWorkspaceView';
import { DocumentRepositoryView } from './components/DocumentRepositoryView';
import { WhatIfSimulatorView } from './components/WhatIfSimulatorView';
import { KnowledgeMemoryView } from './components/KnowledgeMemoryView';
import { AdminControlView } from './components/AdminControlView';

// Role-Based Views
import { ProcurementDashboardView } from './components/ProcurementDashboardView';
import { CompanyPortalView } from './components/CompanyPortalView';

export default function App() {
  // Authentication State: LOGIN MUST BE FIRST SCREEN
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[1]); // Default to Procurement Officer for context
  const [currentTab, setCurrentTab] = useState<NavTabId>('procurement-dashboard');

  // Core Data State
  const [tenders, setTenders] = useState<Tender[]>(INITIAL_TENDERS);
  const [selectedTender, setSelectedTender] = useState<Tender>(INITIAL_TENDERS[0]);
  const [bidders, setBidders] = useState<Bidder[]>(INITIAL_BIDDERS);
  const [selectedBidder, setSelectedBidder] = useState<Bidder>(INITIAL_BIDDERS[0]);
  const [evaluations, setEvaluations] = useState<Record<string, BidEvaluation>>(INITIAL_EVALUATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Division 2 State
  const [reviewItems, setReviewItems] = useState<ReviewQueueItem[]>(INITIAL_REVIEW_QUEUE);
  const [multiSources, setMultiSources] = useState<Record<string, MultiSourceVerification[]>>(INITIAL_MULTI_SOURCE);
  const [crossDocChecks, setCrossDocChecks] = useState<Record<string, CrossDocValidationItem[]>>(INITIAL_CROSS_DOC_CHECKS);
  const [clauseTraces, setClauseTraces] = useState<Record<string, ClauseEvidenceTrace[]>>(INITIAL_CLAUSE_TRACES);
  const [versionDiffs, setVersionDiffs] = useState<DocumentVersionDiff[]>(INITIAL_DOCUMENT_VERSIONS);
  const [dependencyNodes, setDependencyNodes] = useState<DependencyNode[]>(INITIAL_DEPENDENCY_NODES);

  // Division 3 State
  const [repoDocs, setRepoDocs] = useState<RepoDocument[]>(INITIAL_REPO_DOCS);
  const [knowledgeCases, setKnowledgeCases] = useState<KnowledgeMemoryCase[]>(INITIAL_KNOWLEDGE_CASES);
  const [whatIfItems, setWhatIfItems] = useState<WhatIfScenarioItem[]>(INITIAL_WHAT_IF_ITEMS);
  const [adminConfig, setAdminConfig] = useState<AdminSystemConfig>(INITIAL_ADMIN_CONFIG);

  // Company & Application State
  const [applications, setApplications] = useState<CompanyApplication[]>(INITIAL_COMPANY_APPLICATIONS);
  const [vaultDocs, setVaultDocs] = useState<CompanyVaultDocument[]>(INITIAL_VAULT_DOCUMENTS);
  const [shortlistCandidates, setShortlistCandidates] = useState<Record<string, AiShortlistCandidate[]>>(INITIAL_SHORTLIST_CANDIDATES);

  // Audit Logger Helper
  const handleLogAudit = (
    action: string,
    module: AuditLogItem['module'],
    details: string
  ) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      user: currentUser.name,
      role: currentUser.role,
      action,
      module,
      details,
      documentHash: `SHA256:${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Connected Navigation handler with optional state
  const handleNavigate = (tab: NavTabId | string, extraState?: { tenderId?: string; bidderId?: string }) => {
    if (extraState?.tenderId) {
      const matchT = tenders.find((t) => t.id === extraState.tenderId);
      if (matchT) setSelectedTender(matchT);
    }
    if (extraState?.bidderId) {
      const matchB = bidders.find((b) => b.id === extraState.bidderId);
      if (matchB) setSelectedBidder(matchB);
    }
    setCurrentTab(tab as NavTabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login Handler (redirects each user ONLY to their relevant dashboard)
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);

    if (user.companyId) {
      const matchingBidder = bidders.find((b) => b.id === user.companyId);
      if (matchingBidder) {
        setSelectedBidder(matchingBidder);
      }
    }

    // Role-specific initial dashboard redirect
    switch (user.role) {
      case 'Admin':
        setCurrentTab('admin-control');
        break;
      case 'Procurement Officer':
        setCurrentTab('procurement-dashboard');
        break;
      case 'Verification Officer':
        setCurrentTab('review-queue');
        break;
      case 'Company / Bidder':
        setCurrentTab('company-tenders');
        break;
      default:
        setCurrentTab('procurement-dashboard');
    }

    handleLogAudit(
      'User Authenticated via CPPP SSO',
      'System',
      `${user.name} logged into ${user.userType === 'Government Staff' ? 'Government Staff Portal' : 'Bidder Gateway'} as ${user.role}.`
    );
  };

  // Logout Handler
  const handleLogout = () => {
    handleLogAudit('User Signed Out', 'System', `${currentUser.name} signed out of session.`);
    setIsLoggedIn(false);
  };

  // State Updaters
  const handleUpdateTender = (updated: Tender) => {
    setTenders((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTender(updated);
  };

  const handleCreateTender = (newTender: Tender) => {
    setTenders((prev) => [newTender, ...prev]);
    setSelectedTender(newTender);
  };

  const handleUpdateBidder = (updated: Bidder) => {
    setBidders((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBidder(updated);
  };

  const handleRegisterBidder = (newBidder: Bidder) => {
    setBidders((prev) => [newBidder, ...prev]);
  };

  const handleUpdateBidderDocuments = (bidderId: string, updatedDocs: BidderDocument[]) => {
    setBidders((prev) =>
      prev.map((b) => {
        if (b.id === bidderId) {
          return { ...b, documents: updatedDocs };
        }
        return b;
      })
    );
    if (selectedBidder.id === bidderId) {
      setSelectedBidder((prev) => ({ ...prev, documents: updatedDocs }));
    }
  };

  const handleSaveEvaluation = (evaluation: BidEvaluation) => {
    const key = `${evaluation.tenderId}_${evaluation.bidderId}`;
    setEvaluations((prev) => ({
      ...prev,
      [key]: evaluation,
    }));
  };

  const handleUpdateReviewItem = (updated: ReviewQueueItem) => {
    setReviewItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleSaveReport = (doc: RepoDocument) => {
    setRepoDocs((prev) => [doc, ...prev]);
  };

  const handleUpdateAdminConfig = (updated: AdminSystemConfig) => {
    setAdminConfig(updated);
  };

  // Company Application Handlers
  const handleApplyTender = (newApp: CompanyApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    setBidders((prev) =>
      prev.map((b) => {
        if (b.id === newApp.companyId && !b.submittedTenderIds.includes(newApp.tenderId)) {
          return { ...b, submittedTenderIds: [...b.submittedTenderIds, newApp.tenderId] };
        }
        return b;
      })
    );
  };

  const handleUpdateVault = (docs: CompanyVaultDocument[]) => {
    setVaultDocs(docs);
  };

  const handleAnswerClarification = (appId: string, clarId: string, responseNote: string, docName?: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: 'Under Review',
            clarifications: app.clarifications.map((clr) => {
              if (clr.id === clarId) {
                return {
                  ...clr,
                  status: 'Answered',
                  responseNote,
                  responseFileName: docName,
                  respondedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
                };
              }
              return clr;
            }),
          };
        }
        return app;
      })
    );
  };

  // ---------------- 1. LOGIN MUST BE THE FIRST SCREEN ----------------
  if (!isLoggedIn) {
    return (
      <LoginView
        availableUsers={INITIAL_USERS}
        onLogin={handleLogin}
      />
    );
  }

  // Active Key for Bidder Traces & Multi-Source
  const activeEvalKey = `${selectedTender.id}_${selectedBidder.id}`;
  const activeTraces = clauseTraces[activeEvalKey] || clauseTraces['tnd-001_bid-001'] || [];
  const activeMultiSource = multiSources[selectedBidder.id] || multiSources['bid-001'] || [];
  const activeCrossDocs = crossDocChecks[selectedBidder.id] || crossDocChecks['bid-001'] || [];

  const pendingReviewQueueCount = reviewItems.filter(
    (item) => item.officerStatus === 'Pending Officer Review' && item.priority !== 'Clear'
  ).length;

  const mismatchesTotal = activeCrossDocs.filter((c) => c.hasMismatch).length;
  const companyPendingClarifications = applications
    .filter((a) => a.companyId === currentUser.companyId)
    .flatMap((a) => a.clarifications || [])
    .filter((c) => c.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#2D241E] flex flex-col antialiased">
      {/* 1. Header with Role Switcher & Sign Out */}
      <Header
        currentUser={currentUser}
        availableUsers={INITIAL_USERS}
        onSelectUser={(u) => {
          handleLogin(u);
        }}
        onLogout={handleLogout}
      />

      {/* 2. Connected Workflow Banner (Shown for Government Staff) */}
      {currentUser.userType === 'Government Staff' && (
        <WorkflowBar
          currentTab={currentTab}
          onNavigate={(tab) => handleNavigate(tab as NavTabId)}
        />
      )}

      {/* 3. Primary Section Navigation Tabs (Role-Filtered) */}
      <Navigation
        currentTab={currentTab}
        currentUser={currentUser}
        onTabChange={(tab) => handleNavigate(tab)}
        badgeCounts={{
          tenders: tenders.length,
          bidders: bidders.length,
          documents: bidders.reduce((acc, b) => acc + b.documents.length, 0),
          pendingReviews: Object.values(evaluations).filter(
            (e) => e.evaluationStatus === 'Technically Disqualified' || e.evaluationStatus === 'Clarification Required'
          ).length,
          reviewQueueCount: pendingReviewQueueCount,
          mismatchesCount: mismatchesTotal,
          applicationsCount: currentUser.role === 'Company / Bidder' 
            ? applications.filter(a => a.companyId === currentUser.companyId).length 
            : applications.length,
          clarificationsCount: companyPendingClarifications,
        }}
      />

      {/* 4. Active Main Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* ==================== ROLE 1: PROCUREMENT OFFICER VIEWS ==================== */}
        {(currentTab === 'procurement-dashboard' || 
          currentTab === 'tender-create' || 
          currentTab === 'received-applications' || 
          currentTab === 'ai-shortlist') && (
          <ProcurementDashboardView
            tenders={tenders}
            bidders={bidders}
            applications={applications}
            evaluations={evaluations}
            shortlistCandidates={shortlistCandidates}
            currentUser={currentUser}
            selectedTender={selectedTender}
            onSelectTender={setSelectedTender}
            onCreateTender={handleCreateTender}
            onUpdateTender={handleUpdateTender}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* ==================== ROLE 2: COMPANY / BIDDER VIEWS ==================== */}
        {(currentTab === 'company-tenders' || 
          currentTab === 'company-recommended' || 
          currentTab === 'company-applications' || 
          currentTab === 'company-eligibility' || 
          currentTab === 'company-checklist' || 
          currentTab === 'company-vault' || 
          currentTab === 'company-clarifications' || 
          currentTab === 'company-status' || 
          currentTab === 'company-profile') && (
          <CompanyPortalView
            currentUser={currentUser}
            tenders={tenders}
            bidders={bidders}
            applications={applications}
            vaultDocuments={vaultDocs}
            onApplyTender={handleApplyTender}
            onUpdateVault={handleUpdateVault}
            onAnswerClarification={handleAnswerClarification}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* ==================== ROLE 3: GOVERNMENT ADMIN VIEWS ==================== */}
        {(currentTab === 'admin-control' || 
          currentTab === 'admin-users' || 
          currentTab === 'admin-roles' || 
          currentTab === 'admin-settings') && (
          <AdminControlView
            currentUser={currentUser}
            availableUsers={INITIAL_USERS}
            adminConfig={adminConfig}
            onUpdateAdminConfig={handleUpdateAdminConfig}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* ==================== ROLE 4: VERIFICATION OFFICER & AUDIT VIEWS ==================== */}
        {currentTab === 'review-queue' && (
          <ReviewQueueView
            tenders={tenders}
            bidders={bidders}
            selectedTender={selectedTender}
            selectedBidder={selectedBidder}
            reviewItems={reviewItems}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
            onUpdateReviewItem={handleUpdateReviewItem}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'clarification-mgmt' && (
          <ReviewQueueView
            tenders={tenders}
            bidders={bidders}
            selectedTender={selectedTender}
            selectedBidder={selectedBidder}
            reviewItems={reviewItems}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
            onUpdateReviewItem={handleUpdateReviewItem}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'compliance' && (
          <ComplianceMatrixView
            tenders={tenders}
            bidders={bidders}
            selectedTender={selectedTender}
            selectedBidder={selectedBidder}
            evaluations={evaluations}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
            onSaveEvaluation={handleSaveEvaluation}
            onLogAudit={handleLogAudit}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'evidence-trace' && (
          <EvidenceTraceabilityView
            tenders={tenders}
            bidders={bidders}
            selectedTender={selectedTender}
            selectedBidder={selectedBidder}
            clauseTraces={activeTraces}
            dependencyNodes={dependencyNodes}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'cross-validation' && (
          <MultiSourceValidationView
            tenders={tenders}
            bidders={bidders}
            selectedTender={selectedTender}
            selectedBidder={selectedBidder}
            multiSources={activeMultiSource}
            crossDocChecks={activeCrossDocs}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'documents' && (
          <DocumentWorkspace
            bidders={bidders}
            selectedBidder={selectedBidder}
            onUpdateBidderDocuments={handleUpdateBidderDocuments}
            onSelectBidder={setSelectedBidder}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'repository' && (
          <DocumentRepositoryView
            repoDocuments={repoDocs}
            tenders={tenders}
            bidders={bidders}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'audit' && (
          <AuditTrailView
            auditLogs={auditLogs}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            tenders={tenders}
            bidders={bidders}
            selectedTender={selectedTender}
            selectedBidder={selectedBidder}
            evaluations={evaluations}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
            onSaveReport={handleSaveReport}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* PRESERVED LEGACY & DIVISION 3 VIEWS */}
        {currentTab === 'tenders' && (
          <TenderManagement
            tenders={tenders}
            selectedTender={selectedTender}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onUpdateTender={handleUpdateTender}
            onCreateTender={handleCreateTender}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'bidders' && (
          <BidderManagement
            bidders={bidders}
            selectedBidder={selectedBidder}
            tenders={tenders}
            currentUser={currentUser}
            onSelectBidder={setSelectedBidder}
            onRegisterBidder={handleRegisterBidder}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'compliance-dashboard' && (
          <ComplianceDashboardView
            currentUser={currentUser}
            tenders={tenders}
            bidders={bidders}
            evaluations={evaluations}
            onNavigate={handleNavigate}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
          />
        )}

        {currentTab === 'case-workspace' && (
          <CaseWorkspaceView
            tenders={tenders}
            bidders={bidders}
            selectedTender={selectedTender}
            selectedBidder={selectedBidder}
            evaluations={evaluations}
            clauseTraces={activeTraces}
            reviewItems={reviewItems}
            auditLogs={auditLogs}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
            onSaveEvaluation={handleSaveEvaluation}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'bidder-comparison' && (
          <BidderComparisonView
            tenders={tenders}
            bidders={bidders}
            selectedTender={selectedTender}
            evaluations={evaluations}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'what-if' && (
          <WhatIfSimulatorView
            whatIfItems={whatIfItems}
            tenders={tenders}
            bidders={bidders}
            selectedTender={selectedTender}
            selectedBidder={selectedBidder}
            currentUser={currentUser}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'knowledge-memory' && (
          <KnowledgeMemoryView
            knowledgeCases={knowledgeCases}
            selectedTender={selectedTender}
            selectedBidder={selectedBidder}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'doc-versions' && (
          <DocumentVersionDiffView
            versionDiffs={versionDiffs}
            selectedBidder={selectedBidder}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'ai-analysis' && (
          <AiExtractionView
            bidders={bidders}
            selectedBidder={selectedBidder}
            currentUser={currentUser}
            onSelectBidder={setSelectedBidder}
            onUpdateBidder={handleUpdateBidder}
            onNavigate={handleNavigate}
            onLogAudit={handleLogAudit}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            tenders={tenders}
            bidders={bidders}
            evaluations={evaluations}
            auditLogs={auditLogs}
            onNavigate={handleNavigate}
            onSelectTender={setSelectedTender}
            onSelectBidder={setSelectedBidder}
          />
        )}
      </main>

      {/* 5. Minimal Enterprise Footer */}
      <footer className="border-t border-[#E8E0D4] bg-[#FAF8F5] py-4 px-6 text-xs text-[#7A6B5D] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#4A3525]">GovTender AI Verification Platform</span>
            <span>•</span>
            <span>Role-Based E-Procurement Gateway</span>
            <span>•</span>
            <span className="font-mono text-[11px]">GFR 2017 Rules 144 & 173 Compliant</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Active Session: <strong className="text-[#25633A] font-semibold">{currentUser.role}</strong></span>
            <span>•</span>
            <span className="font-mono">Security: SHA-256 Ledger Synchronized</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
