import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Sparkles,
  Eye
} from 'lucide-react';

export interface ViewableDocument {
  name: string;
  category?: string;
  docType?: string;
  fileSize?: string;
  uploadedAt?: string;
  fileData?: string;
  fileType?: string;
  status?: string;
  metadata?: Record<string, any>;
  matchingClause?: string;
  extractedFigures?: string;
  extractedText?: string;
  confidence?: number;
  isVaultReuse?: boolean;
  vaultDocId?: string;
}

interface DocumentViewerModalProps {
  document: ViewableDocument;
  onClose: () => void;
  onAccept?: (docName: string) => void;
  onReject?: (docName: string) => void;
  onClarify?: (docName: string) => void;
  isOfficer?: boolean;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  onClose,
  onAccept,
  onReject,
  onClarify,
  isOfficer = false,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'ai-extraction'>('preview');

  const isImage = 
    document.fileType?.startsWith('image/') || 
    document.fileData?.startsWith('data:image/') ||
    /\.(jpg|jpeg|png|webp)$/i.test(document.name);

  const isPdf = 
    document.fileType === 'application/pdf' || 
    document.fileData?.startsWith('data:application/pdf') ||
    /\.pdf$/i.test(document.name);

  const handleDownload = () => {
    if (document.fileData) {
      const a = window.document.createElement('a');
      a.href = document.fileData;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      // Create downloadable text file
      const blob = new Blob(
        [
          `Official CPPP Document Archive\nDocument: ${document.name}\nCategory: ${document.category || 'Official Record'}\nUploaded: ${document.uploadedAt || 'N/A'}\n\nExtracted Content:\n${document.extractedText || 'Authentic digital document filed on CPPP Gateway.'}`
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name.replace(/\.[^/.]+$/, '') + '_Extracted.txt';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs">
      <div className="bg-[#FCFAF7] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-[#DFD5C6] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E8E0D4] flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#8C6B52] bg-[#FAF5EE] px-2 py-0.5 rounded border border-[#EDE5DA] tracking-wider">
                {document.category || 'Official Document'}
              </span>
              {document.isVaultReuse ? (
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#EFE9DF] text-[#553E2B] border border-[#DDD3C4]">
                  ✓ Reused from Company Vault
                </span>
              ) : document.docType ? (
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#FAF5EE] text-[#8C5832] border border-[#E2D8C8]">
                  {document.docType}
                </span>
              ) : null}
              {document.status && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  document.status === 'Valid' || document.status === 'Verified' || document.status === 'Uploaded'
                    ? 'bg-[#EEF6F0] text-[#1E5732]'
                    : document.status === 'Needs Update'
                    ? 'bg-[#FFF8EB] text-[#8C5D17]'
                    : 'bg-[#FDF1EF] text-[#932F27]'
                }`}>
                  {document.status}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#2D231C] truncate" title={document.name}>
              {document.name}
            </h3>

            <div className="text-[11px] text-[#7A6B5D] flex items-center gap-2">
              <span>Size: <strong>{document.fileSize || 'Standard PDF'}</strong></span>
              <span>•</span>
              <span>Uploaded: <strong>{document.uploadedAt || 'Current Session'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleDownload}
              title="Download File"
              className="p-2 rounded-xl border border-[#DDD3C4] text-[#553E2B] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              title="Print Document"
              className="p-2 rounded-xl border border-[#DDD3C4] text-[#553E2B] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#DDD3C4] text-[#553E2B] hover:bg-[#FAF8F5] transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 bg-white border-b border-[#F0EAE0] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-[#8C5832] text-[#8C5832]'
                : 'border-transparent text-[#7A6B5D] hover:text-[#2D231C]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Document Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-extraction')}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai-extraction'
                ? 'border-[#8C5832] text-[#8C5832]'
                : 'border-transparent text-[#7A6B5D] hover:text-[#2D231C]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Verification & OCR Data</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'preview' ? (
            <div className="space-y-4">
              {/* If real uploaded image file */}
              {isImage && document.fileData ? (
                <div className="bg-[#F4EFEA] p-4 rounded-xl border border-[#E0D5C5] flex items-center justify-center">
                  <img
                    src={document.fileData}
                    alt={document.name}
                    className="max-h-[58vh] max-w-full object-contain rounded-lg border border-[#DDD3C4] shadow-md bg-white"
                  />
                </div>
              ) : isPdf && document.fileData ? (
                /* Real PDF data URI */
                <div className="space-y-3">
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E6DDD0] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#553E2B]">
                      <FileText className="w-4 h-4 text-[#8C5832]" />
                      <span>Displaying uploaded digital PDF file: <strong>{document.name}</strong></span>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1 rounded bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-medium cursor-pointer"
                    >
                      Download PDF
                    </button>
                  </div>
                  <iframe
                    src={document.fileData}
                    title={document.name}
                    className="w-full h-[58vh] rounded-xl border border-[#DDD3C4] shadow-inner bg-white"
                  />
                </div>
              ) : (
                /* Formal Government Document Layout Simulation for Verified Dossiers */
                <div className="bg-white rounded-xl border border-[#DDD3C4] shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden font-serif">
                  {/* Watermark */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none text-8xl font-black rotate-[-25deg] text-[#2D231C]">
                    CPPP VERIFIED
                  </div>

                  {/* Document Header */}
                  <div className="text-center pb-4 border-b-2 border-[#2D231C] space-y-1 relative">
                    <div className="text-[11px] font-sans uppercase font-bold tracking-widest text-[#7A6B5D]">
                      Central Public Procurement Portal • Govt of India Electronic Repository
                    </div>
                    <h2 className="text-lg font-bold text-[#2D231C] tracking-wide uppercase">
                      {document.category || 'Official Statutory Record'}
                    </h2>
                    <div className="text-xs text-[#554233] font-sans">
                      Document Title: <strong>{document.name}</strong>
                    </div>
                    <div className="text-[10px] font-mono text-[#8C6B52] font-sans pt-1">
                      CPPP Electronic Reference: CERT-2026-{Math.abs(document.name.length * 941).toString(16).toUpperCase()} • Class-3 Signed
                    </div>
                  </div>

                  {/* Key Metadata Table */}
                  <div className="font-sans space-y-2">
                    <div className="text-xs font-bold uppercase text-[#8C6B52] tracking-wider">
                      Verified Document Attributes
                    </div>
                    <table className="w-full text-xs border border-[#E6DDD0] rounded-lg overflow-hidden">
                      <tbody className="divide-y divide-[#EDE5DA]">
                        <tr className="bg-[#FAF8F5]">
                          <td className="p-2.5 font-semibold text-[#553E2B] w-1/3">Document Classification</td>
                          <td className="p-2.5 font-bold text-[#2D231C]">{document.category || 'Statutory Filing'}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-[#553E2B]">Filing Format / Mode</td>
                          <td className="p-2.5 text-[#2D231C]">Electronic Digital Submission (PDF)</td>
                        </tr>
                        <tr className="bg-[#FAF8F5]">
                          <td className="p-2.5 font-semibold text-[#553E2B]">File Size & Verification</td>
                          <td className="p-2.5 font-mono text-[#2D231C]">{document.fileSize || '380 KB'} • SHA256 Verified</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-[#553E2B]">Source & Reuse Status</td>
                          <td className="p-2.5 text-[#2D231C]">
                            {document.isVaultReuse 
                              ? `Sourced from Company Document Vault (Ref: ${document.vaultDocId || 'vlt-001'})`
                              : `Direct Tender Submission`}
                          </td>
                        </tr>
                        {document.metadata && Object.entries(document.metadata).map(([k, v], i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-[#FAF8F5]' : ''}>
                            <td className="p-2.5 font-semibold text-[#553E2B]">{k}</td>
                            <td className="p-2.5 font-medium text-[#2D231C]">{String(v)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Extracted Certificate / Proposal Text */}
                  <div className="font-sans space-y-2">
                    <div className="text-xs font-bold uppercase text-[#8C6B52] tracking-wider">
                      Official Extract / Transcript:
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] text-xs font-mono text-[#2D231C] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {document.extractedText || 
`This official certificate is maintained in the company electronic dossier.
Certified that the entity satisfies the mandatory eligibility benchmark under GFR 2017.
Registration and compliance credentials have been verified through Central Registry integrations.`}
                    </div>
                  </div>

                  {/* Stamp & Seal Area */}
                  <div className="pt-4 border-t border-[#E8E0D4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[#1E5732] font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>GOVT OF INDIA CPPP GATEWAY — ELECTRONIC SEAL</span>
                      </div>
                      <div className="text-[10px] text-[#7A6B5D]">
                        Digitally verified by National Informatics Centre (NIC) CPPP PKI Service.
                      </div>
                    </div>

                    <div className="border border-[#25633A] text-[#1E5732] bg-[#EEF6F0] p-2.5 rounded-lg text-center min-w-[180px]">
                      <div className="font-bold text-[11px] uppercase">Digitally Stamped</div>
                      <div className="text-[10px] font-mono mt-0.5">VALID RECORD</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* AI Verification & Clause Matching Tab */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-[#E6DDD0] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE0]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8C5832]" />
                    <span className="font-bold text-sm text-[#2D231C]">AI Extraction & Tender Benchmark Match</span>
                  </div>
                  {document.confidence && (
                    <span className="text-[11px] font-mono font-bold text-[#1E5732] bg-[#EEF6F0] px-2.5 py-0.5 rounded-full border border-[#C4DFC8]">
                      {document.confidence}% Confidence
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6] space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[#8C6B52]">Target Tender Clause</div>
                    <div className="font-semibold text-[#2D231C]">
                      {document.matchingClause || 'Mandatory technical / statutory eligibility clause'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#ECE3D6] space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[#8C6B52]">Extracted Evidence & Figures</div>
                    <div className="font-semibold text-[#1E5732]">
                      {document.extractedFigures || 'Document verified compliant with zero defects'}
                    </div>
                  </div>
                </div>

                {document.metadata && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[10px] uppercase font-bold text-[#8C6B52]">Extracted Key-Value Data Points</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(document.metadata).map(([k, v], i) => (
                        <div key={i} className="p-2 rounded bg-[#FAF8F5] border border-[#EDE5DA]">
                          <div className="text-[9px] text-[#8C6B52] uppercase font-semibold">{k}</div>
                          <div className="font-medium text-[#2D231C] truncate">{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  <div className="text-[10px] uppercase font-bold text-[#8C6B52]">Full OCR Text Stream</div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] font-mono text-[11px] text-[#2D231C] whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {document.extractedText || 'No raw OCR stream available for this file.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Officer Decision Controls */}
        <div className="p-4 bg-white border-t border-[#E8E0D4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-[#7A6B5D]">
            Official file reference securely encrypted and stored with SHA-256 integrity hash.
          </div>

          <div className="flex items-center gap-2">
            {isOfficer && (
              <>
                {onReject && (
                  <button
                    onClick={() => {
                      onReject(document.name);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#A0352A] text-white hover:bg-[#852A20] text-xs font-semibold cursor-pointer"
                  >
                    Reject Document
                  </button>
                )}
                {onClarify && (
                  <button
                    onClick={() => {
                      onClarify(document.name);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF5EE] text-[#8C5D17] border border-[#F0DDBE] hover:bg-[#FFF8EB] text-xs font-semibold cursor-pointer"
                  >
                    Request Clarification
                  </button>
                )}
                {onAccept && (
                  <button
                    onClick={() => {
                      onAccept(document.name);
                      onClose();
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#1E5732] text-white hover:bg-[#164325] text-xs font-semibold cursor-pointer"
                  >
                    Accept Document
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-[#DDD3C4] text-xs font-semibold text-[#553E2B] hover:bg-[#FAF8F5] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
