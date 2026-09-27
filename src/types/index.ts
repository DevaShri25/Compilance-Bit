export type UserRole = 'Admin' | 'Procurement Officer' | 'Verification Officer' | 'Company / Bidder';

export type UserType = 'Government Staff' | 'Company / Bidder';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  userType: UserType;
  department: string;
  employeeId?: string;
  email: string;
  companyId?: string;
  companyName?: string;
}

export type TenderStatus = 'Draft' | 'Active' | 'Under Evaluation' | 'Awarded' | 'Cancelled';

export type RequirementType = 'Eligibility' | 'Financial' | 'Technical' | 'Experience' | 'Statutory';

export interface TenderRequirement {
  id: string;
  title: string;
  description?: string;
  type: RequirementType;
  isMandatory: boolean;
  benchmarkValue: string; // e.g. "₹5.0 Crore", "3 Years", "ISO 9001:2015"
  numericBenchmark?: number; // for mathematical comparison
  unit?: string;
}

export interface Tender {
  id: string;
  tenderId: string; // e.g. "GEM/2026/B/894210"
  title: string;
  department: string;
  category: string;
  estimatedValue: string; // e.g. "₹12.50 Cr"
  numericValue: number;
  closingDate: string; // YYYY-MM-DD
  openingDate?: string;
  publishedDate: string;
  status: TenderStatus;
  description?: string;
  pdfFileName?: string;
  pdfSize?: string;
  analyzedAt?: string;
  isAnalyzed: boolean;
  requirements: TenderRequirement[];
  mandatoryDocuments: string[];
  requiredCertificates?: string[];
  minimumTurnover?: string;
  experienceRequirements?: string;
  technicalRequirements?: string[];
  summary?: string;
  isAiDrafted?: boolean;
}

// ----------------- COMPANY & APPLICATION TYPES -----------------

export type ApplicationStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Clarification Required' 
  | 'Verified' 
  | 'Closed';

export interface TenderChecklistDoc {
  id: string;
  name: string;
  category: DocumentCategory;
  isMandatory: boolean;
  status: 'Uploaded' | 'Missing' | 'Needs Update' | 'Valid' | 'Expired';
  vaultDocId?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  validUntil?: string;
  notes?: string;
}

export interface SubmittedDocumentItem {
  name: string;
  category: DocumentCategory | string;
  docType?: 'Company Document' | 'Tender-Specific Document' | 'Supporting Evidence';
  fileSize: string;
  uploadedAt: string;
  status: 'Valid' | 'Needs Update' | 'Expired' | 'Verified' | 'Uploaded' | 'Missing';
  vaultDocId?: string;
  fileData?: string; // base64 / data URL preview
  fileName?: string;
  fileType?: string; // 'application/pdf', 'image/jpeg', etc.
  notes?: string;
  tenderId?: string;
  applicationId?: string;
  isVaultReuse?: boolean;
}

export interface CompanyApplication {
  id: string;
  tenderId: string;
  companyId: string;
  companyName: string;
  submittedDate: string;
  lastUpdated: string;
  status: ApplicationStatus;
  documents: SubmittedDocumentItem[];
  companyDocumentsUsed?: SubmittedDocumentItem[];
  tenderSpecificDocuments?: SubmittedDocumentItem[];
  supportingDocuments?: SubmittedDocumentItem[];
  clarifications: {
    id: string;
    requestedInfo: string;
    reason: string;
    deadline: string;
    status: 'Pending' | 'Answered' | 'Closed';
    responseNote?: string;
    responseFileName?: string;
    respondedAt?: string;
  }[];
  eligibilitySummary?: string;
  turnoverClaim?: string;
  experienceClaim?: string;
}

export interface CompanyVaultDocument {
  id: string;
  companyId: string;
  name: string;
  category: DocumentCategory;
  fileSize: string;
  uploadedDate: string;
  issueDate?: string;
  validUntil?: string;
  status: 'Valid' | 'Expired' | 'Needs Update';
  pages: number;
  reusedCount: number;
  documentHash: string;
  fileData?: string; // data URL or mock file preview
  fileName?: string;
  fileType?: string; // mime type
}

export interface AiShortlistCandidate {
  bidderId: string;
  companyName: string;
  eligibilityMatchPercent: number;
  requirementCoverage: string;
  documentCompleteness: string;
  experienceMatch: string;
  technicalMatch: string;
  issuesCount: number;
  issues: string[];
  whyRecommended: {
    pros: string[];
    warnings: string[];
  };
  complianceScore: number;
  rank: number;
}

export type DocumentCategory = 
  | 'GST'
  | 'PAN'
  | 'MSME/Udyam'
  | 'Financial documents'
  | 'Experience certificates'
  | 'Technical certificates'
  | 'Company registration'
  | 'Other supporting documents';

export type DocumentStatus = 'Uploaded' | 'Processing OCR' | 'Extracted' | 'Verified' | 'Flagged';

export interface ExtractedField {
  fieldName: string;
  fieldKey: string;
  value: string;
  numericValue?: number;
  confidence: number; // e.g. 0.98
  sourceDocument: string;
  sourcePage: number;
  extractedSnippet: string;
  verified: boolean;
}

export interface BidderDocument {
  id: string;
  bidderId: string;
  name: string;
  category: DocumentCategory;
  pages: number;
  uploadDate: string;
  status: DocumentStatus;
  fileSize: string;
  fileUrl?: string;
  extractedFields: ExtractedField[];
}

export interface PreviousBidRecord {
  tenderId: string;
  tenderTitle: string;
  department: string;
  year: string;
  bidValue: string;
  result: 'Awarded' | 'Qualified - L2' | 'Disqualified' | 'Completed';
  completionScore?: string;
}

export interface Bidder {
  id: string;
  name: string; // Company Name
  registrationNumber: string; // CIN or RoC
  incorporationDate: string;
  entityType: 'Private Limited' | 'Public Limited' | 'Partnership' | 'Sole Proprietorship';
  registeredAddress: string;
  gstNumber: string;
  panNumber: string;
  msmeUdyamNumber: string;
  isMsmeRegistered: boolean;
  annualTurnover: string; // e.g. "₹5.8 Crore"
  numericTurnover: number; // 5.8
  yearsOfExperience: number; // e.g. 4.5
  technicalQualifications: string[];
  certificates: string[];
  representativeName: string;
  representativeContact: string;
  verificationStatus: 'Verified' | 'Pending Verification' | 'Disqualified' | 'In Review';
  disqualificationReason?: string;
  documents: BidderDocument[];
  previousBids: PreviousBidRecord[];
  submittedTenderIds: string[];
}

export type ComplianceMatchStatus = 'Meets Requirement' | 'Does Not Meet' | 'Under Review' | 'Exempt (MSME)';

export interface RequirementMatch {
  requirementId: string;
  requirementTitle: string;
  requirementType: RequirementType;
  tenderBenchmark: string;
  isMandatory: boolean;
  bidderEvidence: string;
  sourceDocName: string;
  sourcePage: number;
  matchStatus: ComplianceMatchStatus;
  confidenceScore: number;
  officerRemarks?: string;
  isManuallyOverridden?: boolean;
}

export interface BidEvaluation {
  id: string;
  tenderId: string;
  bidderId: string;
  evaluatedAt: string;
  evaluatedBy: string;
  evaluationStatus: 'Eligible for Financial Bid' | 'Technically Disqualified' | 'Clarification Required' | 'Pending Officer Sign-off';
  totalRequirements: number;
  metRequirements: number;
  failedRequirements: number;
  compliancePercentage: number;
  matches: RequirementMatch[];
  officerSignature?: {
    officerName: string;
    officerRole: UserRole;
    timestamp: string;
    decisionNote: string;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  module: 'Tender' | 'Bidder' | 'Document' | 'AI Extraction' | 'Compliance' | 'System' | 'Officer Review';
  details: string;
  documentHash?: string;
}

// ----------------- DIVISION 2 TYPES -----------------

export type ComplianceDetailedStatus = 
  | 'Compliant' 
  | 'Needs Review' 
  | 'Missing' 
  | 'Discrepancy' 
  | 'Not Met';

export interface MultiSourceVerification {
  id: string;
  field: string;
  bidderDocSource: string;
  bidderDocValue: string;
  govtSource: string; // e.g. "GSTN Live Registry (MCA21 API)"
  govtValue: string;
  tenderBenchmark: string;
  financialOrTechEvidence: string;
  status: 'Verified' | 'Potential Mismatch' | 'Needs Review';
  officerRemarks?: string;
}

export interface CrossDocValidationItem {
  id: string;
  field: string;
  doc1Name: string;
  doc1Value: string;
  doc2Name: string;
  doc2Value: string;
  hasMismatch: boolean;
  mismatchMessage?: string;
  subtleWarning: boolean;
}

export interface ClauseEvidenceTrace {
  id: string;
  clauseId: string;
  tenderClause: string;
  clauseSection: string;
  bidderDocument: string;
  pageNumber: number;
  extractedEvidence: string;
  complianceResult: ComplianceDetailedStatus;
  whyExplanation: string;
  appliedRule: string;
  bidderClaim: string;
  actualEvidence: string;
  claimDiscrepancyStatus: 'Verified' | 'Discrepancy' | 'Unverified';
  timeAware?: {
    validFrom: string;
    validUntil: string;
    tenderClosingDate: string;
    isValidOnTenderDate: boolean;
    statusMessage: string;
  };
}

export interface DocumentVersionDiff {
  id: string;
  documentName: string;
  category: DocumentCategory;
  v1UploadedAt: string;
  v2UploadedAt: string;
  changesDetected: {
    type: 'added' | 'removed' | 'modified';
    field: string;
    v1Value?: string;
    v2Value?: string;
    significance: 'Low' | 'High' | 'Critical';
  }[];
}

export interface DependencyNode {
  id: string;
  title: string;
  type: 'Document' | 'Requirement' | 'Outcome';
  status: 'Satisfied' | 'Failed' | 'Triggered' | 'Pending';
  dependsOnIds: string[];
  impactMessage: string;
}

export interface ReviewQueueItem {
  id: string;
  tenderId: string;
  bidderId: string;
  requirementTitle: string;
  priority: 'High Risk / Uncertain' | 'Discrepancy' | 'Missing Information' | 'Needs Review' | 'Clear';
  complianceStatus: ComplianceDetailedStatus;
  evidenceSummary: string;
  sourceDoc: string;
  pageNumber: number;
  tenderClause: string;
  whyExplanation: string;
  appliedRule: string;
  officerStatus: 'Pending Officer Review' | 'Accepted' | 'Rejected' | 'Overridden' | 'Clarification Sent';
  officerRemarks?: string;
  officerOverride?: {
    originalAiResult: ComplianceDetailedStatus;
    overriddenResult: ComplianceDetailedStatus;
    officerName: string;
    officerRole: UserRole;
    reason: string;
    timestamp: string;
  };
  clarificationRequest?: {
    referenceId: string;
    missingOrUnclearItem: string;
    deadline: string;
    subject: string;
    formalQuestion: string;
    sentAt: string;
  };
}

// ----------------- DIVISION 3 TYPES -----------------

export type RepositoryFolder = 
  | 'Tender Documents' 
  | 'Bidder Documents' 
  | 'Verification Evidence' 
  | 'Previous Versions' 
  | 'Generated Reports';

export interface RepoDocument {
  id: string;
  name: string;
  type: string;
  version: string;
  folder: RepositoryFolder;
  uploadedBy: string;
  uploadDate: string;
  status: 'Archived' | 'Active' | 'Superseded' | 'Signed' | 'Pending Review';
  fileSize: string;
  tenderId: string;
  bidderId?: string;
  documentHash: string;
}

export interface KnowledgeMemoryCase {
  id: string;
  caseNumber: string; // e.g. "Case #1024"
  title: string;
  tenderType: string;
  requirement: string;
  evidencePattern: string;
  approvedInterpretation: string;
  officerName: string;
  officerRole: UserRole;
  date: string;
  relevanceSnippet: string;
  gfrRule: string;
}

export interface WhatIfScenarioItem {
  id: string;
  requirementId: string;
  requirementTitle: string;
  currentState: string;
  currentOutcome: ComplianceDetailedStatus;
  hypotheticalChange: string;
  simulatedOutcome: ComplianceDetailedStatus;
  isSimulated: boolean;
  notes: string;
}

export type ReportCategory = 
  | 'Bid Compliance Report' 
  | 'Tender Summary' 
  | 'Bidder Verification Report' 
  | 'Discrepancy Report' 
  | 'Audit Report';

export interface AdminSystemConfig {
  aiConfidenceThreshold: number;
  requireDualOfficerSignoff: boolean;
  retentionPeriodYears: number;
  strictGfrEnforcement: boolean;
  sha256HashingEnabled: boolean;
  allowAutoEvidenceSuggestion: boolean;
  activeAuditLevel: 'Verbose' | 'Standard' | 'Strict Forensic';
}

