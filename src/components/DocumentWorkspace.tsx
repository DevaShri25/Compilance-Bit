import React, { useState } from 'react';
import { Bidder, BidderDocument, DocumentCategory, UserProfile } from '../types';
import { processUploadedDocument } from '../services/aiService';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Building2, 
  FileCheck, 
  Layers, 
  ChevronRight,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface DocumentWorkspaceProps {
  bidders: Bidder[];
  selectedBidder: Bidder;
  currentUser: UserProfile;
  onSelectBidder: (bidder: Bidder) => void;
  onUpdateBidderDocuments: (bidderId: string, updatedDocs: BidderDocument[]) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({
  bidders,
  selectedBidder,
  currentUser,
  onSelectBidder,
  onUpdateBidderDocuments,
  onNavigate,
  onLogAudit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('GST');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [customDocName, setCustomDocName] = useState('');
  const [customPages, setCustomPages] = useState(2);

  const categories: DocumentCategory[] = [
    'GST',
    'PAN',
    'MSME/Udyam',
    'Financial documents',
    'Experience certificates',
    'Technical certificates',
    'Company registration',
    'Other supporting documents',
  ];

  const filteredDocs = selectedBidder.documents.filter(
    (d) => filterCategory === 'All' || d.category === filterCategory
  );

  const handleUpload = async (docName: string, category: DocumentCategory, pages: number = 2) => {
    setIsProcessing(true);
    const newDocId = `doc-${Date.now()}`;
    const initialDoc: BidderDocument = {
      id: newDocId,
      bidderId: selectedBidder.id,
      name: docName,
      category,
      pages,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Processing OCR',
      fileSize: `${Math.floor(250 + Math.random() * 800)} KB`,
      extractedFields: [],
    };

    const currentDocs = [...selectedBidder.documents, initialDoc];
    onUpdateBidderDocuments(selectedBidder.id, currentDocs);

    try {
      // Simulate intelligent OCR extraction
      const fields = await processUploadedDocument(docName, category, pages);
      const finalizedDoc: BidderDocument = {
        ...initialDoc,
        status: 'Extracted',
        extractedFields: fields,
      };

      const updatedDocs = currentDocs.map((d) => (d.id === newDocId ? finalizedDoc : d));
      onUpdateBidderDocuments(selectedBidder.id, updatedDocs);

      onLogAudit(
        'Document Processed',
        'Document',
        `Document ${docName} (${category}) uploaded and OCR extracted for ${selectedBidder.name}.`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setCustomDocName('');
    }
  };

  const handleQuickAddPredefined = (category: DocumentCategory) => {
    let name = '';
    let pages = 2;
    switch (category) {
      case 'GST':
        name = `GST_Registration_Certificate_${selectedBidder.name.replace(/[^a-zA-Z]/g, '')}.pdf`;
        pages = 3;
        break;
      case 'PAN':
        name = `Corporate_PAN_Card_${selectedBidder.panNumber}.pdf`;
        pages = 1;
        break;
      case 'MSME/Udyam':
        name = `Udyam_Registration_${selectedBidder.msmeUdyamNumber || 'MSME'}.pdf`;
        pages = 2;
        break;
      case 'Financial documents':
        name = `Audited_Balance_Sheet_3Yr_Turnover_${selectedBidder.name.replace(/[^a-zA-Z]/g, '')}.pdf`;
        pages = 6;
        break;
      case 'Experience certificates':
        name = `Work_Completion_Certificates_Client_Endorsement.pdf`;
        pages = 4;
        break;
      case 'Technical certificates':
        name = `ISO_9001_Quality_Accreditation_Certificate.pdf`;
        pages = 2;
        break;
      case 'Company registration':
        name = `Certificate_of_Incorporation_RoC_MCA.pdf`;
        pages = 3;
        break;
      default:
        name = `Statutory_Undertaking_Affidavit.pdf`;
        pages = 2;
    }
    handleUpload(name, category, pages);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Bidder Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight">
            Document Upload Workspace
          </h2>
          <p className="text-xs text-[#736355]">
            Upload and organize official bidder verification documents across supported categories
          </p>
        </div>

        {/* Bidder Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A6B5D] font-medium">Bidder Docket:</span>
          <select
            value={selectedBidder.id}
            onChange={(e) => {
              const b = bidders.find((item) => item.id === e.target.value);
              if (b) onSelectBidder(b);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#DDD3C4] text-[#2D231C] outline-none shadow-2xs"
          >
            {bidders.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.documents.length} docs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Drop Area Card */}
      <div className="glass-panel rounded-2xl p-6 border border-[#DFD5C6] space-y-4">
        {/* Category Selector Pills */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-2">
            Select Document Category *
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#8C5832] text-white shadow-2xs'
                      : 'bg-white/80 border border-[#DCD3C5] text-[#5A4A3C] hover:bg-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              const file = e.dataTransfer.files[0];
              handleUpload(file.name, selectedCategory, 3);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver
              ? 'border-[#8C5832] bg-[#FAF3EA]'
              : 'border-[#D5C9B8] bg-white/70 hover:bg-white'
          }`}
        >
          <UploadCloud className="w-10 h-10 text-[#8C5832] mx-auto mb-2" />
          <div className="text-sm font-semibold text-[#2D231C]">
            Drag & drop {selectedCategory} document here
          </div>
          <p className="text-xs text-[#7A6B5D] mt-1">
            Supports PDF, scanned certificate images up to 20MB. AI OCR engine will immediately index text and structured fields.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id="doc-upload"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  handleUpload(file.name, selectedCategory, 2);
                }
              }}
            />
            <label
              htmlFor="doc-upload"
              className="px-4 py-2 rounded-lg bg-[#8C5832] text-white text-xs font-semibold hover:bg-[#724523] transition-colors cursor-pointer shadow-2xs"
            >
              Browse Files to Upload
            </label>
            <button
              onClick={() => handleQuickAddPredefined(selectedCategory)}
              className="px-3.5 py-2 rounded-lg border border-[#D5C9B8] bg-white text-xs font-medium text-[#4A3423] hover:bg-[#F9F5EE] transition-colors cursor-pointer"
            >
              Simulate Instant Upload of {selectedCategory}
            </button>
          </div>
        </div>

        {isProcessing && (
          <div className="p-3 rounded-lg bg-[#FAF4ED] border border-[#ECD9C5] flex items-center justify-center gap-2 text-xs text-[#8C5832] font-medium">
            <Sparkles className="w-4 h-4 animate-spin text-[#8C5832]" />
            <span>Extracting OCR text layers and key entities...</span>
          </div>
        )}
      </div>

      {/* Document Cards Section */}
      <div className="space-y-4">
        {/* Section Header with Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#2D231C]">
              Uploaded Documents for {selectedBidder.name} ({filteredDocs.length})
            </h3>
            <p className="text-xs text-[#736355]">
              Verification cards showing document type, page count, upload timestamp and OCR processing status
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#7A6B5D]">
            <Filter className="w-3.5 h-3.5 text-[#8C5832]" />
            <span>Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-[#DDD3C4] rounded-lg px-2.5 py-1 text-xs text-[#2D231C] outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isExtracted = doc.status === 'Extracted' || doc.status === 'Verified';
            return (
              <div
                key={doc.id}
                className="glass-card rounded-xl p-4 border border-[#E6DDD0] bg-white/85 hover:bg-white hover:border-[#8C5832]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF5EE] text-[#553E2B] border border-[#E2D8C8]">
                      {doc.category}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border flex items-center gap-1 ${
                        isExtracted
                          ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                          : 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]'
                      }`}
                    >
                      {isExtracted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{doc.status}</span>
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
                        {doc.fileSize}
                      </div>
                    </div>
                  </div>

                  {/* Meta: Pages & Upload Date */}
                  <div className="mt-3 pt-2.5 border-t border-[#F2ECE2] grid grid-cols-2 gap-2 text-xs text-[#7A6B5D]">
                    <div>
                      <div className="text-[10px] text-[#8A7969] uppercase">Pages</div>
                      <div className="font-semibold text-[#2D231C] font-mono">{doc.pages} Pages</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8A7969] uppercase">Upload Date</div>
                      <div className="font-semibold text-[#2D231C] font-mono">{doc.uploadDate}</div>
                    </div>
                  </div>

                  {/* Extracted Fields Count */}
                  {doc.extractedFields.length > 0 && (
                    <div className="mt-2 text-[11px] text-[#25633A] bg-[#FAF8F5] p-2 rounded border border-[#EDE5DA] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#25633A]" />
                      <span>{doc.extractedFields.length} structured fields extracted</span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-2 border-t border-[#F0EAE0] flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('ai-analysis', { documentId: doc.id })}
                    className="text-xs font-semibold text-[#8C5832] hover:text-[#643D21] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View AI Extraction</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-[#8A7969]">
                    Page 1-{doc.pages}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="col-span-full p-8 text-center text-xs text-[#8A7969] bg-white rounded-xl border border-[#E8E0D4]">
              No documents uploaded in this category for {selectedBidder.name}.
            </div>
          )}
        </div>

        {/* Workflow Progression Notice */}
        <div className="p-4 rounded-xl border border-[#DFD3C2] bg-[#FAF5EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#3E291B]">
              Ready for AI Document Processing & Entity Extraction
            </div>
            <div className="text-[11px] text-[#716153]">
              View key structured fields (GSTIN, PAN, Turnover, Experience, Validity) extracted from these documents
            </div>
          </div>
          <button
            onClick={() => onNavigate('ai-analysis')}
            className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Open AI Extraction Interface</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
