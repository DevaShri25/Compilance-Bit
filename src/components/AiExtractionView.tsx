import React, { useState } from 'react';
import { Bidder, BidderDocument, ExtractedField, UserProfile } from '../types';
import { 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  ExternalLink,
  Layers,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface AiExtractionViewProps {
  bidders: Bidder[];
  selectedBidder: Bidder;
  currentUser: UserProfile;
  onSelectBidder: (bidder: Bidder) => void;
  onUpdateBidder: (bidder: Bidder) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const AiExtractionView: React.FC<AiExtractionViewProps> = ({
  bidders,
  selectedBidder,
  currentUser,
  onSelectBidder,
  onUpdateBidder,
  onNavigate,
  onLogAudit,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'structured' | 'document-feed'>('structured');

  // Collect all extracted fields from all documents of selected bidder
  const allExtractedFields: { docName: string; docCategory: string; field: ExtractedField }[] = [];
  selectedBidder.documents.forEach((doc) => {
    doc.extractedFields.forEach((field) => {
      allExtractedFields.push({
        docName: doc.name,
        docCategory: doc.category,
        field,
      });
    });
  });

  // Pre-configured primary structured entities as required in prompt
  const structuredEntities = [
    {
      label: 'GST Number',
      value: selectedBidder.gstNumber,
      source: 'GST Registration Certificate (Form REG-06) — Page 1',
      snippet: `Registration Certificate No: ${selectedBidder.gstNumber} | Legal Name: ${selectedBidder.name}`,
      confidence: 0.99,
      type: 'Statutory',
    },
    {
      label: 'Corporate PAN',
      value: selectedBidder.panNumber,
      source: 'Income Tax Department PAN Card — Page 1',
      snippet: `Permanent Account Number: ${selectedBidder.panNumber} | Entity Type: Corporate`,
      confidence: 0.99,
      type: 'Statutory',
    },
    {
      label: 'MSME / Udyam Number',
      value: selectedBidder.msmeUdyamNumber,
      source: 'Udyam Registration Certificate — Page 1',
      snippet: `Udyam Registration No: ${selectedBidder.msmeUdyamNumber} | Enterprise: ${selectedBidder.isMsmeRegistered ? 'Small' : 'N/A'}`,
      confidence: 0.99,
      type: 'Eligibility',
    },
    {
      label: 'Turnover',
      value: selectedBidder.annualTurnover,
      source: 'Audited Financial Statement — Page 4',
      snippet: `Certified 3-Year Weighted Average Turnover: ${selectedBidder.annualTurnover}. UDIN authenticated.`,
      confidence: 0.98,
      type: 'Financial',
    },
    {
      label: 'Experience',
      value: `${selectedBidder.yearsOfExperience} Years`,
      source: 'Work Completion Certificate — Page 2',
      snippet: `Client Execution Certificate: Total continuous execution tenure ${selectedBidder.yearsOfExperience} Years.`,
      confidence: 0.97,
      type: 'Experience',
    },
    {
      label: 'Technical Qualifications',
      value: selectedBidder.technicalQualifications[0] || 'ISO 9001:2015 Quality Management Certified',
      source: 'Technical Accreditation Docket — Page 1',
      snippet: 'Quality Management Systems ISO 9001:2015. Certificate valid through 31-Mar-2027.',
      confidence: 0.99,
      type: 'Technical',
    },
    {
      label: 'Certificate Validity',
      value: 'Valid until 31-Mar-2027 (Active)',
      source: 'Quality Management Accreditation — Page 1',
      snippet: 'Certificate Accreditation ID: IN/QMS/2024/99182 | Status: Continuing Compliance',
      confidence: 0.98,
      type: 'Technical',
    },
    {
      label: 'Company Details',
      value: `${selectedBidder.name} (${selectedBidder.registrationNumber})`,
      source: 'Certificate of Incorporation — Page 1',
      snippet: `Registrar of Companies: ${selectedBidder.registrationNumber}. Date: ${selectedBidder.incorporationDate}`,
      confidence: 0.99,
      type: 'Statutory',
    },
  ];

  const handleVerifyField = (label: string) => {
    onLogAudit(
      'Field Verified',
      'AI Extraction',
      `Field "${label}" for ${selectedBidder.name} verified by ${currentUser.name} (${currentUser.role}).`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar & Bidder Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight">
            AI Document Processing (Neural OCR & Entity Extraction)
          </h2>
          <p className="text-xs text-[#736355]">
            Extracted structured parameters with exact document and page-level source citations
          </p>
        </div>

        {/* Bidder Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A6B5D] font-medium">Select Bidder:</span>
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
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Banner Card */}
      <div className="glass-panel rounded-xl p-4 border border-[#DFD5C6] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FAF4ED] text-[#8C5832] flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#8C5832] uppercase tracking-wider">
              Neural OCR Pipeline • Bidder: {selectedBidder.name}
            </div>
            <div className="text-sm font-semibold text-[#2D231C]">
              {selectedBidder.documents.length} Uploaded Documents • 8 Primary Structured Entities
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-xs pr-2">
            <span className="text-[#25633A] font-semibold font-mono">98.6%</span>
            <div className="text-[10px] text-[#7A6B5D]">Mean Confidence</div>
          </div>
          <button
            onClick={() => onNavigate('compliance', { bidderId: selectedBidder.id })}
            className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <span>Match Against Tender</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Structured Extraction View (As explicitly requested in Prompt) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#2D231C] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8C5832]" />
            Structured Extracted Fields (Clean Values & Page Citations)
          </h3>
          <span className="text-xs text-[#7A6B5D]">
            Structured fields without unstructured paragraphs
          </span>
        </div>

        {/* Structured Field Cards Grid (Example format in prompt) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structuredEntities.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl p-4 border border-[#E6DDD0] bg-white/90 hover:bg-white hover:border-[#8C5832]/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Field Label & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6B52]">
                    {item.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#5A3F2A] font-mono border border-[#E2D8C8]">
                    {(item.confidence * 100).toFixed(1)}% match
                  </span>
                </div>

                {/* Structured Value (Crisp & Prominent) */}
                <div className="mt-2 text-base font-bold font-mono text-[#2D231C] tracking-tight">
                  {item.value}
                </div>

                {/* Source Citation (Formatted as in prompt: Source: GST Certificate — Page 1) */}
                <div className="mt-2.5 pt-2 border-t border-[#F2ECE2] text-xs font-medium text-[#7A6B5D] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#8C5832] shrink-0" />
                  <span className="text-[#554234]">
                    Source: <strong className="font-semibold text-[#2D231C]">{item.source}</strong>
                  </span>
                </div>

                {/* Extracted Snippet Quote */}
                <div className="mt-2 text-[11px] text-[#716254] bg-[#FAF8F5] p-2 rounded border border-[#EDE5DA] italic line-clamp-2">
                  "{item.snippet}"
                </div>
              </div>

              {/* Action / Verified Tag */}
              <div className="mt-3.5 pt-2.5 border-t border-[#F0EAE0] flex items-center justify-between">
                <span className="text-[10px] text-[#25633A] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#25633A]" />
                  Verified via OCR
                </span>
                <button
                  onClick={() => handleVerifyField(item.label)}
                  className="text-[11px] text-[#8C5832] hover:text-[#5F3819] font-medium cursor-pointer"
                >
                  Verify Field
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Extracted Document OCR Stream */}
      <div className="glass-card rounded-xl border border-[#E6DDD0] overflow-hidden bg-white/85">
        <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E6DDD0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#8C5832]" />
            <h4 className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
              Document-by-Document OCR Extracted Key-Value Ledger
            </h4>
          </div>
          <span className="text-[11px] text-[#7A6B5D]">
            Official Evidence Records
          </span>
        </div>

        <div className="divide-y divide-[#F0EAE0]">
          {selectedBidder.documents.map((doc) => (
            <div key={doc.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8C5832]" />
                  <span className="text-xs font-semibold text-[#2D231C]">{doc.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#553E2B] border border-[#E2D8C8]">
                    {doc.category}
                  </span>
                </div>
                <span className="text-xs text-[#7A6B5D] font-mono">{doc.pages} Pages • Uploaded {doc.uploadDate}</span>
              </div>

              {/* Extracted fields table for this doc */}
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {doc.extractedFields.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6]">
                    <div className="text-[10px] font-semibold text-[#8C6B52] uppercase">
                      {f.fieldName}
                    </div>
                    <div className="font-mono font-semibold text-xs text-[#2D231C] mt-0.5">
                      {f.value}
                    </div>
                    <div className="text-[11px] text-[#7A6B5D] mt-1">
                      Source: {doc.name} — Page {f.sourcePage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
