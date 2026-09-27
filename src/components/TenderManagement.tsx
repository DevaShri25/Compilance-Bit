import React, { useState } from 'react';
import { Tender, TenderRequirement, UserProfile } from '../types';
import { analyzeTenderPdf } from '../services/aiService';
import { 
  Plus, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Building, 
  Coins, 
  ListChecks, 
  ShieldAlert, 
  FileCheck, 
  ArrowRight,
  Search,
  Filter,
  Layers,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface TenderManagementProps {
  tenders: Tender[];
  selectedTender: Tender;
  currentUser: UserProfile;
  onSelectTender: (tender: Tender) => void;
  onUpdateTender: (tender: Tender) => void;
  onCreateTender: (newTender: Tender) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const TenderManagement: React.FC<TenderManagementProps> = ({
  tenders,
  selectedTender,
  currentUser,
  onSelectTender,
  onUpdateTender,
  onCreateTender,
  onNavigate,
  onLogAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Tender Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTenderId, setNewTenderId] = useState('');
  const [newDepartment, setNewDepartment] = useState('Ministry of Road Transport & Highways');
  const [newCategory, setNewCategory] = useState('Civil Infrastructure');
  const [newValue, setNewValue] = useState('₹10.0 Crore');
  const [newClosingDate, setNewClosingDate] = useState('2026-11-15');

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState('');

  const departments = ['All', ...Array.from(new Set(tenders.map((t) => t.department)))];

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === 'All' || t.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const handleCreateTenderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTenderId) return;

    const tenderNum = parseFloat(newValue.replace(/[^0-9.]/g, '')) || 5.0;

    const created: Tender = {
      id: `tnd-${Date.now()}`,
      tenderId: newTenderId.trim(),
      title: newTitle.trim(),
      department: newDepartment,
      category: newCategory,
      estimatedValue: newValue,
      numericValue: tenderNum,
      closingDate: newClosingDate,
      publishedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      pdfFileName: `${newTenderId.replace(/[^a-zA-Z0-9]/g, '_')}_Notice.pdf`,
      pdfSize: '2.5 MB',
      isAnalyzed: false,
      requirements: [],
      mandatoryDocuments: [],
      summary: 'Public RFP issued under General Financial Rules (GFR). Technical specifications pending AI analysis.',
    };

    onCreateTender(created);
    onSelectTender(created);
    setShowCreateModal(false);
    onLogAudit(
      'Tender Created',
      'Tender',
      `Tender ${created.tenderId} created by ${currentUser.name} (${currentUser.role}).`
    );

    // Reset fields
    setNewTitle('');
    setNewTenderId('');
  };

  const handleAnalyzeTender = async (tender: Tender) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeTenderPdf(tender, tender.pdfFileName);
      const updatedTender: Tender = {
        ...tender,
        isAnalyzed: true,
        analyzedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        requirements: result.requirements,
        mandatoryDocuments: result.mandatoryDocuments,
        summary: result.summary,
      };

      onUpdateTender(updatedTender);
      onSelectTender(updatedTender);
      onLogAudit(
        'Tender Analyzed',
        'Tender',
        `Tender intelligence extracted for ${tender.tenderId}: ${result.requirements.length} requirements identified.`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulatePdfUpload = (sampleName: string, size: string) => {
    const updated: Tender = {
      ...selectedTender,
      pdfFileName: sampleName,
      pdfSize: size,
      isAnalyzed: false,
    };
    onUpdateTender(updated);
    onSelectTender(updated);
    setShowUploadModal(false);
    onLogAudit(
      'Tender PDF Uploaded',
      'Tender',
      `PDF document ${sampleName} uploaded for tender ${selectedTender.tenderId}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight">
            Tender Management
          </h2>
          <p className="text-xs text-[#736355]">
            Create tenders, upload procurement bid documents, and extract automated compliance checklists
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-[#4A3423] hover:bg-[#F9F5EE] text-xs font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#8C5832]" />
            <span>Upload Tender PDF</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Tender</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Tender Selector (Left) & Tender Intelligence View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tender List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filter */}
          <div className="glass-card rounded-xl p-3 border border-[#E8E0D4] space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8A7969] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Tender ID or Title..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#7A6B5D]">
              <Filter className="w-3 h-3 text-[#8C5832]" />
              <span>Dept:</span>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="flex-1 bg-white/90 border border-[#DDD3C4] rounded px-2 py-1 text-[11px] text-[#2D231C] outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Tenders */}
          <div className="space-y-2">
            {filteredTenders.map((tender) => {
              const isSelected = tender.id === selectedTender.id;
              return (
                <div
                  key={tender.id}
                  onClick={() => onSelectTender(tender)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#8C5832] shadow-sm ring-1 ring-[#8C5832]/20'
                      : 'bg-[#FFFDF9]/80 border-[#E8E0D4] hover:bg-white hover:border-[#D5C9B8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-medium text-[#8C5832]">
                      {tender.tenderId}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        tender.status === 'Active'
                          ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                          : 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                      }`}
                    >
                      {tender.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-[#2D231C] mt-1.5 line-clamp-2 leading-relaxed">
                    {tender.title}
                  </h4>

                  <div className="mt-2.5 pt-2 border-t border-[#F2ECE2] flex items-center justify-between text-[11px] text-[#7A6B5D]">
                    <span className="font-mono font-medium text-[#3D2C1F]">
                      {tender.estimatedValue}
                    </span>
                    {tender.isAnalyzed ? (
                      <span className="inline-flex items-center gap-1 text-[#25633A] font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        AI Analyzed
                      </span>
                    ) : (
                      <span className="text-[#8C5832] font-medium">
                        Analysis Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredTenders.length === 0 && (
              <div className="p-6 text-center text-xs text-[#8A7969] bg-white/60 rounded-xl border border-[#E8E0D4]">
                No matching tenders found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tender Intelligence View & Analysis (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Selected Tender Card & PDF Header */}
          <div className="glass-panel rounded-xl p-5 border border-[#DFD5C6]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#EFE9DF] text-[#5A3F2A]">
                    {selectedTender.tenderId}
                  </span>
                  <span className="text-xs text-[#7A6B5D]">
                    Published: {selectedTender.publishedDate}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#2D231C] mt-1.5 leading-snug">
                  {selectedTender.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-[#6F5F51] flex-wrap">
                  <div className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#8C5832]" />
                    <span>{selectedTender.department}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8C5832]" />
                    <span>Closing: {selectedTender.closingDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-[#8C5832]" />
                    <span>Value: {selectedTender.estimatedValue}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Analyze Tender */}
              <div className="shrink-0 flex sm:flex-col items-end gap-2">
                <button
                  disabled={isAnalyzing}
                  onClick={() => handleAnalyzeTender(selectedTender)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    selectedTender.isAnalyzed
                      ? 'bg-white border border-[#DDD3C4] text-[#3D2C1F] hover:bg-[#FAF7F2]'
                      : 'bg-[#8C5832] text-white hover:bg-[#724523]'
                  } ${isAnalyzing ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-[#EFE4D6]' : 'text-[#EFE4D6]'}`} />
                  <span>
                    {isAnalyzing
                      ? 'Analyzing Tender Document...'
                      : selectedTender.isAnalyzed
                      ? 'Re-Analyze Tender'
                      : 'Analyze Tender'}
                  </span>
                </button>

                {selectedTender.pdfFileName && (
                  <div className="text-[11px] text-[#7A6B5D] flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#8C5832]" />
                    <span className="font-mono truncate max-w-[170px]">
                      {selectedTender.pdfFileName}
                    </span>
                    <span className="text-[10px]">({selectedTender.pdfSize || '3.2 MB'})</span>
                  </div>
                )}
              </div>
            </div>

            {selectedTender.summary && (
              <div className="mt-3.5 pt-3 border-t border-[#ECE3D6] text-xs text-[#6F6052] leading-relaxed">
                <span className="font-semibold text-[#3B291D]">Scope Summary: </span>
                {selectedTender.summary}
              </div>
            )}
          </div>

          {/* Tender Intelligence View (After Analysis) */}
          {selectedTender.isAnalyzed ? (
            <div className="space-y-4">
              {/* Category Breakdown Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass-card rounded-lg p-3 border border-[#E8E0D4] bg-white/70">
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Eligibility Criteria</div>
                  <div className="text-sm font-semibold text-[#2D231C] mt-0.5">
                    {selectedTender.requirements.filter((r) => r.type === 'Eligibility').length} Parameters
                  </div>
                </div>
                <div className="glass-card rounded-lg p-3 border border-[#E8E0D4] bg-white/70">
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Financial Criteria</div>
                  <div className="text-sm font-semibold text-[#2D231C] mt-0.5">
                    {selectedTender.requirements.filter((r) => r.type === 'Financial').length} Benchmarks
                  </div>
                </div>
                <div className="glass-card rounded-lg p-3 border border-[#E8E0D4] bg-white/70">
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Experience & Tech</div>
                  <div className="text-sm font-semibold text-[#2D231C] mt-0.5">
                    {selectedTender.requirements.filter((r) => r.type === 'Experience' || r.type === 'Technical').length} Standards
                  </div>
                </div>
                <div className="glass-card rounded-lg p-3 border border-[#E8E0D4] bg-white/70">
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Mandatory Documents</div>
                  <div className="text-sm font-semibold text-[#2D231C] mt-0.5">
                    {selectedTender.mandatoryDocuments.length} Required Docs
                  </div>
                </div>
              </div>

              {/* Automated Compliance Checklist Table (As specified in prompt) */}
              <div className="glass-card rounded-xl border border-[#E6DDD0] overflow-hidden bg-white/85">
                <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E6DDD0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-[#8C5832]" />
                    <h4 className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
                      Extracted Compliance Checklist
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#7A6B5D]">
                    Auto-generated from RFP Specifications
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#ECE3D6] bg-[#F6F1E8]/70 text-[#6B5A4B] text-[11px] font-semibold">
                        <th className="py-2.5 px-4">Requirement</th>
                        <th className="py-2.5 px-4">Benchmark / Parameter</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3 text-center">Mandatory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EAE0]">
                      {selectedTender.requirements.map((req) => (
                        <tr key={req.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="py-3 px-4 font-medium text-[#2D231C]">
                            {req.title}
                          </td>
                          <td className="py-3 px-4 text-[#5D4E41] font-mono text-[11px]">
                            {req.benchmarkValue}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                                req.type === 'Financial'
                                  ? 'bg-[#FDF6E9] text-[#7E5214] border-[#ECDABF]'
                                  : req.type === 'Technical'
                                  ? 'bg-[#EBF3F8] text-[#1B5277] border-[#C7DCED]'
                                  : req.type === 'Experience'
                                  ? 'bg-[#F2EEF8] text-[#553385] border-[#D8CCE8]'
                                  : 'bg-[#FAF6F0] text-[#614A37] border-[#E5DACD]'
                              }`}
                            >
                              {req.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {req.isMandatory ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF4ED] text-[#225B34] border border-[#C5E1CB]">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3EFE9] text-[#716153]">
                                Optional
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mandatory Document Checklist Section */}
              <div className="glass-card rounded-xl p-4 border border-[#E6DDD0] bg-white/85">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#8C5832]" />
                    <h4 className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
                      Mandatory Document Submission Checklist
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#7A6B5D]">
                    GFR Clause 4.1 Submissions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedTender.mandatoryDocuments.map((docName, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-[#EDE5DA] bg-[#FAF8F5] flex items-center gap-2.5 text-[#3D2C1F]"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#EADECE] text-[#523A25] flex items-center justify-center text-[10px] font-mono font-semibold shrink-0">
                        {idx + 1}
                      </div>
                      <span className="truncate">{docName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Connected Action */}
              <div className="p-4 rounded-xl border border-[#DFD3C2] bg-[#FAF5EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#3E291B]">
                    Tender Intelligence Ready for Bidder Matching
                  </div>
                  <div className="text-[11px] text-[#716153]">
                    Match submitted bidder dockets against these {selectedTender.requirements.length} mandatory parameters
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('compliance', { tenderId: selectedTender.id })}
                  className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Evaluate Bidders for This Tender</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Pending Analysis Notice */
            <div className="glass-card rounded-xl p-8 border border-dashed border-[#DCD3C5] text-center space-y-3 bg-white/60">
              <div className="w-12 h-12 rounded-xl bg-[#F4EFE6] text-[#8C5832] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-[#8C5832]" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-sm font-semibold text-[#2D231C]">
                  Tender RFP Pending AI Analysis
                </h4>
                <p className="text-xs text-[#756557] mt-1 leading-relaxed">
                  Click the <strong>"Analyze Tender"</strong> action above to automatically extract technical specifications, financial turnover benchmarks, experience tenure, and mandatory document requirements.
                </p>
              </div>
              <button
                disabled={isAnalyzing}
                onClick={() => handleAnalyzeTender(selectedTender)}
                className="px-4 py-2 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EFE4D6]" />
                <span>Run Tender Intelligence Analysis</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Tender */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FAF8F5] rounded-2xl border border-[#DDD3C4] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE3D6]">
              <div>
                <h3 className="text-sm font-semibold text-[#2D231C]">
                  Create New Tender Notice
                </h3>
                <p className="text-xs text-[#736355]">
                  Issue procurement tender for Division 1 evaluation
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8A7969] hover:text-[#2D231C] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenderSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                  Tender Reference ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MORTH/2026/HWY/5510"
                  value={newTenderId}
                  onChange={(e) => setNewTenderId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                  Tender Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modernization of Multi-Lane Electronic Toll Collection"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    Department
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                  >
                    <option value="National Highways Authority of India (NHAI)">NHAI</option>
                    <option value="Ministry of Road Transport & Highways">MoRTH</option>
                    <option value="Ministry of Electronics & IT (MeitY)">MeitY</option>
                    <option value="National Health Authority & AIIMS">NHA / AIIMS</option>
                    <option value="CPWD / Central Works">CPWD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    Estimated Value
                  </label>
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. ₹8.5 Crore"
                    className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. IT & Software"
                    className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                    Closing Date
                  </label>
                  <input
                    type="date"
                    value={newClosingDate}
                    onChange={(e) => setNewClosingDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#ECE3D6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-xs font-medium text-[#4A3423] hover:bg-[#F9F5EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Publish Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Tender PDF */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FAF8F5] rounded-2xl border border-[#DDD3C4] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE3D6]">
              <div>
                <h3 className="text-sm font-semibold text-[#2D231C]">
                  Upload Tender Document (PDF)
                </h3>
                <p className="text-xs text-[#736355]">
                  Select or drop procurement RFP docket for {selectedTender.tenderId}
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#8A7969] hover:text-[#2D231C] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-[#D5C9B8] rounded-xl p-6 text-center bg-white/70 hover:bg-white transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-[#8C5832] mx-auto mb-2" />
                <div className="text-xs font-semibold text-[#2D231C]">
                  Drag and drop Tender PDF here
                </div>
                <div className="text-[11px] text-[#7A6B5D] mt-0.5">
                  PDF format up to 25MB (RFP, NIT, GFR specifications)
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  id="pdf-upload"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleSimulatePdfUpload(e.target.files[0].name, '4.1 MB');
                    }
                  }}
                />
                <label
                  htmlFor="pdf-upload"
                  className="mt-3 inline-block px-3 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-xs font-medium text-[#4A3423] hover:bg-[#F8F4ED] cursor-pointer"
                >
                  Browse Computer
                </label>
              </div>

              {/* Or Quick-Pick Standard Government Tender Samples */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#736355] mb-2">
                  Or Load Pre-Packaged Government Sample RFP:
                </div>
                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() =>
                      handleSimulatePdfUpload('NHAI_Express_Corridor_RFP_2026.pdf', '3.4 MB')
                    }
                    className="w-full text-left p-2.5 rounded-lg border border-[#E2D8CA] bg-white hover:bg-[#F9F5EE] transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#8C5832]" />
                      <span className="font-medium text-[#2D231C]">
                        NHAI_Express_Corridor_RFP_2026.pdf
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7A6B5D] font-mono">3.4 MB</span>
                  </button>

                  <button
                    onClick={() =>
                      handleSimulatePdfUpload('NHA_Diagnostic_Ultrasound_Tender.pdf', '2.8 MB')
                    }
                    className="w-full text-left p-2.5 rounded-lg border border-[#E2D8CA] bg-white hover:bg-[#F9F5EE] transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#8C5832]" />
                      <span className="font-medium text-[#2D231C]">
                        NHA_Diagnostic_Ultrasound_Tender.pdf
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7A6B5D] font-mono">2.8 MB</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
