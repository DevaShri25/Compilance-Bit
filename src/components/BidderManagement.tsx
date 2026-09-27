import React, { useState } from 'react';
import { Bidder, Tender, UserProfile, PreviousBidRecord } from '../types';
import { 
  Building2, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  UploadCloud, 
  GitCompare, 
  Award, 
  ShieldCheck, 
  History, 
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface BidderManagementProps {
  bidders: Bidder[];
  selectedBidder: Bidder;
  tenders: Tender[];
  currentUser: UserProfile;
  onSelectBidder: (bidder: Bidder) => void;
  onRegisterBidder: (newBidder: Bidder) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const BidderManagement: React.FC<BidderManagementProps> = ({
  bidders,
  selectedBidder,
  tenders,
  currentUser,
  onSelectBidder,
  onRegisterBidder,
  onNavigate,
  onLogAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'records' | 'documents'>('profile');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Form State for Register Bidder
  const [name, setName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [entityType, setEntityType] = useState<Bidder['entityType']>('Private Limited');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [msmeNumber, setMsmeNumber] = useState('');
  const [turnover, setTurnover] = useState('₹5.0 Crore');
  const [experience, setExperience] = useState('3.0');
  const [techQual, setTechQual] = useState('ISO 9001:2015, State PWD Enlisted Contractor');
  const [certs, setCerts] = useState('ISO 9001:2015 Quality Certificate, Udyam Registration');
  const [repName, setRepName] = useState('');
  const [repContact, setRepContact] = useState('');

  const filteredBidders = bidders.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.gstNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.panNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gstNumber || !panNumber) return;

    const numTurnover = parseFloat(turnover.replace(/[^0-9.]/g, '')) || 4.5;
    const numExp = parseFloat(experience) || 3.0;

    const newBidder: Bidder = {
      id: `bid-${Date.now()}`,
      name: name.trim(),
      registrationNumber: regNumber.trim() || `U45200MH2022PTC${Math.floor(100000 + Math.random() * 900000)}`,
      incorporationDate: '2020-06-15',
      entityType,
      registeredAddress: 'Corporate Office, Commercial District, India',
      gstNumber: gstNumber.trim().toUpperCase(),
      panNumber: panNumber.trim().toUpperCase(),
      msmeUdyamNumber: msmeNumber.trim() || 'N/A',
      isMsmeRegistered: Boolean(msmeNumber && msmeNumber.startsWith('UDYAM')),
      annualTurnover: turnover,
      numericTurnover: numTurnover,
      yearsOfExperience: numExp,
      technicalQualifications: techQual.split(',').map((s) => s.trim()),
      certificates: certs.split(',').map((s) => s.trim()),
      representativeName: repName || 'Authorized Signatory',
      representativeContact: repContact || '+91 98000 00000 | contact@bidder.in',
      verificationStatus: 'Pending Verification',
      submittedTenderIds: [tenders[0]?.id || 'tnd-001'],
      previousBids: [
        {
          tenderId: 'GOV-PREV/2024/01',
          tenderTitle: 'Regional Civil & Electronics Execution Package',
          department: 'Public Works Department',
          year: '2024',
          bidValue: '₹3.20 Crore',
          result: 'Completed',
          completionScore: '96% SLA Adherence',
        },
      ],
      documents: [],
    };

    onRegisterBidder(newBidder);
    onSelectBidder(newBidder);
    setShowRegisterModal(false);
    onLogAudit(
      'Bidder Registered',
      'Bidder',
      `Bidder ${newBidder.name} (GSTIN: ${newBidder.gstNumber}) registered in system.`
    );

    // Reset fields
    setName('');
    setGstNumber('');
    setPanNumber('');
    setMsmeNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight">
            Bidder Management
          </h2>
          <p className="text-xs text-[#736355]">
            Register corporate vendors, maintain compliance profiles, and track submission dockets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('documents', { bidderId: selectedBidder.id })}
            className="px-3 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-[#4A3423] hover:bg-[#F9F5EE] text-xs font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#8C5832]" />
            <span>Upload Bidder Docs</span>
          </button>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Bidder</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Bidder List (4 cols) & Bidder Profile (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bidder List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Bar */}
          <div className="glass-card rounded-xl p-3 border border-[#E8E0D4]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8A7969] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Bidder, GSTIN, PAN..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
              />
            </div>
          </div>

          {/* List of Bidders */}
          <div className="space-y-2">
            {filteredBidders.map((bidder) => {
              const isSelected = bidder.id === selectedBidder.id;
              const isVerified = bidder.verificationStatus === 'Verified';
              return (
                <div
                  key={bidder.id}
                  onClick={() => onSelectBidder(bidder)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#8C5832] shadow-sm ring-1 ring-[#8C5832]/20'
                      : 'bg-[#FFFDF9]/80 border-[#E8E0D4] hover:bg-white hover:border-[#D5C9B8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2D231C] truncate max-w-[200px]">
                      {bidder.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        isVerified
                          ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                          : bidder.verificationStatus === 'Disqualified'
                          ? 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]'
                          : 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                      }`}
                    >
                      {bidder.verificationStatus}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-[#7A6B5D] flex items-center justify-between font-mono">
                    <span>GST: {bidder.gstNumber}</span>
                    <span className="text-[#3D2C1F] font-semibold">{bidder.annualTurnover}</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#F2ECE2] flex items-center justify-between text-[11px] text-[#7A6B5D]">
                    <span>Exp: {bidder.yearsOfExperience} Yrs</span>
                    <span>{bidder.documents.length} Docs Attached</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Bidder Profile & Tab Views */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Card */}
          <div className="glass-panel rounded-xl p-5 border border-[#DFD5C6]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#EFE9DF] text-[#5A3F2A]">
                    {selectedBidder.entityType}
                  </span>
                  <span className="text-xs text-[#7A6B5D]">
                    CIN: <strong className="font-mono text-[#3D2C1F]">{selectedBidder.registrationNumber}</strong>
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#2D231C] mt-1.5">
                  {selectedBidder.name}
                </h3>
                <div className="text-xs text-[#6F5F51] mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#8C5832] shrink-0" />
                  <span className="line-clamp-1">{selectedBidder.registeredAddress}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigate('compliance', { bidderId: selectedBidder.id })}
                  className="px-3 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Verify Against Tender</span>
                </button>
              </div>
            </div>

            {/* Profile Tab Switcher */}
            <div className="mt-4 pt-3 border-t border-[#ECE3D6] flex items-center gap-2">
              <button
                onClick={() => setActiveProfileTab('profile')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeProfileTab === 'profile'
                    ? 'bg-[#8C5832] text-white'
                    : 'text-[#6F5F51] hover:bg-[#EFE9DF]'
                }`}
              >
                Important Profile Details
              </button>
              <button
                onClick={() => setActiveProfileTab('records')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeProfileTab === 'records'
                    ? 'bg-[#8C5832] text-white'
                    : 'text-[#6F5F51] hover:bg-[#EFE9DF]'
                }`}
              >
                Previous Bid Records ({selectedBidder.previousBids.length})
              </button>
              <button
                onClick={() => setActiveProfileTab('documents')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeProfileTab === 'documents'
                    ? 'bg-[#8C5832] text-white'
                    : 'text-[#6F5F51] hover:bg-[#EFE9DF]'
                }`}
              >
                Document Management ({selectedBidder.documents.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Structured Important Profile Information */}
          {activeProfileTab === 'profile' && (
            <div className="space-y-4">
              {/* Important Identifiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* GST */}
                <div className="glass-card rounded-xl p-3.5 border border-[#E8E0D4] bg-white/80">
                  <div className="text-[11px] font-semibold text-[#8C6B52] uppercase tracking-wider">
                    GST Identification (GSTIN)
                  </div>
                  <div className="text-sm font-semibold font-mono text-[#2D231C] mt-1">
                    {selectedBidder.gstNumber}
                  </div>
                  <div className="text-[11px] text-[#2F663C] mt-1 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active / GSTR-3B Compliant
                  </div>
                </div>

                {/* PAN */}
                <div className="glass-card rounded-xl p-3.5 border border-[#E8E0D4] bg-white/80">
                  <div className="text-[11px] font-semibold text-[#8C6B52] uppercase tracking-wider">
                    Corporate PAN
                  </div>
                  <div className="text-sm font-semibold font-mono text-[#2D231C] mt-1">
                    {selectedBidder.panNumber}
                  </div>
                  <div className="text-[11px] text-[#2F663C] mt-1 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    NSDL Validated
                  </div>
                </div>

                {/* MSME / Udyam */}
                <div className="glass-card rounded-xl p-3.5 border border-[#E8E0D4] bg-white/80">
                  <div className="text-[11px] font-semibold text-[#8C6B52] uppercase tracking-wider">
                    MSME / Udyam Registration
                  </div>
                  <div className="text-sm font-semibold font-mono text-[#2D231C] mt-1 truncate">
                    {selectedBidder.msmeUdyamNumber}
                  </div>
                  <div className="text-[11px] text-[#6F5F51] mt-1">
                    {selectedBidder.isMsmeRegistered ? 'Eligible for EMD Exemption' : 'General Category'}
                  </div>
                </div>
              </div>

              {/* Financial & Experience Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="glass-card rounded-xl p-4 border border-[#E8E0D4] bg-white/80">
                  <div className="text-xs text-[#7A6B5D] font-medium">Annual Turnover (3-Yr Average)</div>
                  <div className="text-2xl font-bold font-mono text-[#2D231C] mt-1">
                    {selectedBidder.annualTurnover}
                  </div>
                  <div className="text-xs text-[#6F5F51] mt-1">
                    Certified by Chartered Accountant with official UDIN stamp
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 border border-[#E8E0D4] bg-white/80">
                  <div className="text-xs text-[#7A6B5D] font-medium">Documented Industry Experience</div>
                  <div className="text-2xl font-bold font-mono text-[#2D231C] mt-1">
                    {selectedBidder.yearsOfExperience} Years
                  </div>
                  <div className="text-xs text-[#6F5F51] mt-1">
                    Verified through work orders & satisfactory completion certificates
                  </div>
                </div>
              </div>

              {/* Technical Qualifications & Certificates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Technical Qualifications */}
                <div className="glass-card rounded-xl p-4 border border-[#E8E0D4] bg-white/80 space-y-2">
                  <div className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#8C5832]" />
                    <span>Technical Qualifications</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedBidder.technicalQualifications.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6] text-xs text-[#3D2C1F] flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C5832]"></span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificates */}
                <div className="glass-card rounded-xl p-4 border border-[#E8E0D4] bg-white/80 space-y-2">
                  <div className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#8C5832]" />
                    <span>Accreditations & Certificates</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedBidder.certificates.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6] text-xs text-[#3D2C1F] flex items-center gap-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-[#25633A] shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Previous Bid Records */}
          {activeProfileTab === 'records' && (
            <div className="glass-card rounded-xl border border-[#E6DDD0] overflow-hidden bg-white/85">
              <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E6DDD0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#8C5832]" />
                  <h4 className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
                    Past Government Contracts & Bidding Record
                  </h4>
                </div>
                <span className="text-[11px] text-[#7A6B5D]">
                  CPPP Public Ledger Track Record
                </span>
              </div>

              <div className="divide-y divide-[#F0EAE0]">
                {selectedBidder.previousBids.map((record, idx) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-mono text-[#8C5832] font-semibold">{record.tenderId}</span>
                        <span className="text-[#7A6B5D]">({record.year})</span>
                        <span className="px-2 py-0.2 rounded bg-[#EBF3ED] text-[#225732] font-medium border border-[#CFE1D4]">
                          {record.result}
                        </span>
                      </div>
                      <div className="font-semibold text-[#2D231C] mt-1 text-xs">
                        {record.tenderTitle}
                      </div>
                      <div className="text-[11px] text-[#7A6B5D] mt-0.5">
                        Department: {record.department}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-semibold text-sm text-[#2D231C]">
                        {record.bidValue}
                      </div>
                      {record.completionScore && (
                        <div className="text-[11px] text-[#25633A] font-medium mt-0.5">
                          {record.completionScore}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {selectedBidder.previousBids.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#8A7969]">
                    No past contracts recorded in this portal.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Document Management */}
          {activeProfileTab === 'documents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2D231C]">
                  Attached Verification Documents ({selectedBidder.documents.length})
                </span>
                <button
                  onClick={() => onNavigate('documents', { bidderId: selectedBidder.id })}
                  className="text-xs font-semibold text-[#8C5832] hover:text-[#643D21] flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Document Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {selectedBidder.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl border border-[#E6DDD0] bg-white flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF4ED] text-[#8C5832] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#2D231C] truncate max-w-[280px]">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-[#7A6B5D] flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-[#FAF5EE] border border-[#E2D8C8]">
                            {doc.category}
                          </span>
                          <span>{doc.pages} Pages</span>
                          <span>•</span>
                          <span>Uploaded {doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EEF6F0] text-[#1E5732] border border-[#C4DFC8]">
                        {doc.status}
                      </span>
                      <button
                        onClick={() => onNavigate('ai-analysis', { documentId: doc.id })}
                        className="px-2.5 py-1 rounded border border-[#D5C9B8] text-[11px] font-medium hover:bg-[#F9F5EE] text-[#4A3423] cursor-pointer"
                      >
                        Inspect OCR
                      </button>
                    </div>
                  </div>
                ))}

                {selectedBidder.documents.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#8A7969] bg-white rounded-xl border border-[#E6DDD0]">
                    No documents uploaded yet for this bidder.
                    <div className="mt-2">
                      <button
                        onClick={() => onNavigate('documents', { bidderId: selectedBidder.id })}
                        className="px-3 py-1.5 rounded-lg bg-[#8C5832] text-white text-xs font-medium cursor-pointer"
                      >
                        Upload Documents Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Register Bidder */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FAF8F5] rounded-2xl border border-[#DDD3C4] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE3D6]">
              <div>
                <h3 className="text-sm font-semibold text-[#2D231C]">
                  Register New Bidder Entity
                </h3>
                <p className="text-xs text-[#736355]">
                  Add company profile for tender evaluation
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-[#8A7969] hover:text-[#2D231C] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                  Company Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex InfraTech Solutions Pvt Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    GSTIN Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 27ABCDE1234F1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C] font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    Corporate PAN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABCDE1234F"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C] font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    MSME / Udyam Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UDYAM-MH-01-0023456"
                    value={msmeNumber}
                    onChange={(e) => setMsmeNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    Entity Constitution
                  </label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                  >
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="Partnership">Partnership / LLP</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    Annual Turnover (3-Yr Avg)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹5.8 Crore"
                    value={turnover}
                    onChange={(e) => setTurnover(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 4.5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                  Technical Qualifications (comma separated)
                </label>
                <input
                  type="text"
                  value={techQual}
                  onChange={(e) => setTechQual(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                  Certificates (comma separated)
                </label>
                <input
                  type="text"
                  value={certs}
                  onChange={(e) => setCerts(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                />
              </div>

              <div className="pt-3 border-t border-[#ECE3D6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-xs font-medium text-[#4A3423] hover:bg-[#F9F5EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Register Bidder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
