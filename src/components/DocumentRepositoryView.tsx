import React, { useState } from 'react';
import { RepoDocument, RepositoryFolder, Tender, Bidder, UserProfile } from '../types';
import { 
  FolderArchive, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Download, 
  Eye, 
  ShieldCheck, 
  Folder,
  Layers,
  ArrowDownToLine,
  Lock
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface DocumentRepositoryViewProps {
  repoDocuments: RepoDocument[];
  tenders: Tender[];
  bidders: Bidder[];
  currentUser: UserProfile;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const DocumentRepositoryView: React.FC<DocumentRepositoryViewProps> = ({
  repoDocuments,
  tenders,
  bidders,
  currentUser,
  onNavigate,
  onLogAudit,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<RepositoryFolder | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterTender, setFilterTender] = useState('All');
  const [filterBidder, setFilterBidder] = useState('All');

  const folders: RepositoryFolder[] = [
    'Tender Documents',
    'Bidder Documents',
    'Verification Evidence',
    'Previous Versions',
    'Generated Reports',
  ];

  const types = ['All', ...Array.from(new Set(repoDocuments.map((d) => d.type)))];

  const filteredDocs = repoDocuments.filter((doc) => {
    const matchesFolder = selectedFolder === 'All' || doc.folder === selectedFolder;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || doc.type === filterType;
    const matchesTender = filterTender === 'All' || doc.tenderId === filterTender;
    const matchesBidder = filterBidder === 'All' || doc.bidderId === filterBidder;
    return matchesFolder && matchesSearch && matchesType && matchesTender && matchesBidder;
  });

  const getStatusBadge = (status: RepoDocument['status']) => {
    switch (status) {
      case 'Active':
      case 'Signed':
        return 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]';
      case 'Superseded':
        return 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]';
      case 'Archived':
      case 'Pending Review':
        return 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]';
    }
  };

  const handleDownload = (doc: RepoDocument) => {
    onLogAudit(
      'Document Downloaded',
      'Document',
      `Officer ${currentUser.name} accessed & downloaded repository file "${doc.name}" (${doc.version}).`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 3 • Secure Records Management
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              SHA-256 Validated
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Secure Document Repository
          </h2>
          <p className="text-xs text-[#736355]">
            Centralized government archive categorized by tender notices, vendor dockets, third-party audits, and superseded versions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#1E5732] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF6F0] border border-[#C4DFC8]">
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable CPPP Storage</span>
          </span>
        </div>
      </div>

      {/* Folder Tabs Navigation (As requested in prompt: 5 categories) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          onClick={() => setSelectedFolder('All')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            selectedFolder === 'All'
              ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
              : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
          }`}
        >
          All Repository Folders ({repoDocuments.length})
        </button>
        {folders.map((folder) => {
          const count = repoDocuments.filter((d) => d.folder === folder).length;
          const isSelected = selectedFolder === folder;
          return (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
                  : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
              }`}
            >
              <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#8C5832]'}`} />
              <span>{folder}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#EFE8DD] text-[#553E2B]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Comprehensive Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-[#E8E0D4] bg-white/90 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8A7969] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by filename, uploader, or cryptographic SHA-256 hash..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
          />
        </div>

        {/* 4 Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#7A6B5D]">
          {/* Filter Document Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] shrink-0 font-medium">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 bg-white border border-[#DDD3C4] rounded-lg px-2 py-1 text-xs text-[#2D231C] outline-none"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tender */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] shrink-0 font-medium">Tender:</span>
            <select
              value={filterTender}
              onChange={(e) => setFilterTender(e.target.value)}
              className="flex-1 bg-white border border-[#DDD3C4] rounded-lg px-2 py-1 text-xs text-[#2D231C] outline-none"
            >
              <option value="All">All Tenders</option>
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenderId}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Bidder */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] shrink-0 font-medium">Bidder:</span>
            <select
              value={filterBidder}
              onChange={(e) => setFilterBidder(e.target.value)}
              className="flex-1 bg-white border border-[#DDD3C4] rounded-lg px-2 py-1 text-xs text-[#2D231C] outline-none"
            >
              <option value="All">All Bidders</option>
              {bidders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Cards Grid (As specified in prompt: Name, Type, Version, Uploaded By, Upload Date, Status) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 hover:bg-white hover:border-[#8C5832]/50 transition-all shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Folder & Status Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF5EE] text-[#8C5832] border border-[#E2D8C8]">
                  {doc.folder}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-medium border ${getStatusBadge(
                    doc.status
                  )}`}
                >
                  {doc.status}
                </span>
              </div>

              {/* Document Name */}
              <div className="mt-3 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF4ED] text-[#8C5832] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#2D231C] break-all leading-snug">
                    {doc.name}
                  </h4>
                  <div className="text-[11px] text-[#7A6B5D] mt-0.5">
                    {doc.type}
                  </div>
                </div>
              </div>

              {/* Required Details: Version, Uploaded By, Upload Date */}
              <div className="mt-3 pt-2.5 border-t border-[#F2ECE2] space-y-1.5 text-xs text-[#7A6B5D]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8A7969]">Version:</span>
                  <span className="font-mono font-semibold text-[#2D231C] text-[11px]">
                    {doc.version}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8A7969]">Uploaded By:</span>
                  <span className="text-[#3D2C1F] text-[11px] truncate max-w-[170px]">
                    {doc.uploadedBy}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8A7969]">Upload Date:</span>
                  <span className="font-mono text-[11px] text-[#2D231C]">
                    {doc.uploadDate}
                  </span>
                </div>
              </div>

              {/* Document Hash */}
              <div className="mt-2 text-[10px] font-mono text-[#8C7A6A] bg-[#FAF8F5] p-1.5 rounded border border-[#EDE5DA] truncate">
                Hash: {doc.documentHash}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2.5 border-t border-[#F0EAE0] flex items-center justify-between">
              <span className="text-[11px] text-[#7A6B5D] font-mono">
                {doc.fileSize}
              </span>
              <button
                onClick={() => handleDownload(doc)}
                className="px-2.5 py-1 rounded-lg border border-[#D5C9B8] bg-white hover:bg-[#FAF6F0] text-xs font-medium text-[#4A3423] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3 h-3 text-[#8C5832]" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full p-8 text-center text-xs text-[#8A7969] bg-white rounded-2xl border border-[#E8E0D4]">
            No documents matching the specified filters.
          </div>
        )}
      </div>
    </div>
  );
};
