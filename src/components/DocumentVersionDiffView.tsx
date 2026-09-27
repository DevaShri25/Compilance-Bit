import React, { useState } from 'react';
import { DocumentVersionDiff, UserProfile, Tender, Bidder } from '../types';
import { 
  FileDiff, 
  PlusCircle, 
  MinusCircle, 
  Edit2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface DocumentVersionDiffViewProps {
  versionDiffs: DocumentVersionDiff[];
  selectedBidder: Bidder;
  currentUser: UserProfile;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const DocumentVersionDiffView: React.FC<DocumentVersionDiffViewProps> = ({
  versionDiffs,
  selectedBidder,
  currentUser,
  onNavigate,
  onLogAudit,
}) => {
  const [selectedDiffId, setSelectedDiffId] = useState<string>(
    versionDiffs[0]?.id || ''
  );

  const selectedDiff = versionDiffs.find((d) => d.id === selectedDiffId) || versionDiffs[0];

  const addedItems = selectedDiff?.changesDetected.filter((c) => c.type === 'added') || [];
  const modifiedItems = selectedDiff?.changesDetected.filter((c) => c.type === 'modified') || [];
  const removedItems = selectedDiff?.changesDetected.filter((c) => c.type === 'removed') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 2 • Audit Integrity
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Document Replacement Diff
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Document Versioning & Change Detection
          </h2>
          <p className="text-xs text-[#736355]">
            Forensic comparison of superseded and revised document dockets uploaded during evaluation
          </p>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A6B5D] font-medium">Replaced Document:</span>
          <select
            value={selectedDiffId}
            onChange={(e) => setSelectedDiffId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#DDD3C4] text-[#2D231C] outline-none shadow-2xs max-w-[240px] truncate"
          >
            {versionDiffs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.documentName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedDiff && (
        <div className="space-y-6">
          {/* Version 1 -> Version 2 Transition Banner */}
          <div className="glass-panel rounded-2xl p-5 border border-[#DFD5C6] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Version 1 */}
            <div className="flex-1 w-full p-4 rounded-xl bg-white border border-[#E6DDD0] text-center shadow-xs">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FAF5EE] text-[#7A6B5D] border border-[#E2D8C8]">
                Initial Docket (Version 1)
              </span>
              <div className="text-xs font-semibold text-[#2D231C] mt-2 truncate">
                {selectedDiff.documentName}
              </div>
              <div className="mt-1 text-[11px] font-mono text-[#7A6B5D] flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[#8C5832]" />
                <span>Uploaded: {selectedDiff.v1UploadedAt}</span>
              </div>
            </div>

            {/* Transition Arrow */}
            <div className="flex flex-col items-center shrink-0">
              <ArrowRight className="w-6 h-6 text-[#8C5832] rotate-90 md:rotate-0" />
              <span className="text-[10px] uppercase font-semibold text-[#8C6B52] mt-0.5">
                {selectedDiff.changesDetected.length} Changes Detected
              </span>
            </div>

            {/* Version 2 */}
            <div className="flex-1 w-full p-4 rounded-xl bg-[#FAF5EE] border border-[#DFD3C2] text-center shadow-xs">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#EBF3ED] text-[#225732] border border-[#CFE1D4]">
                Current Replacement (Version 2)
              </span>
              <div className="text-xs font-semibold text-[#2D231C] mt-2 truncate">
                {selectedDiff.documentName}
              </div>
              <div className="mt-1 text-[11px] font-mono text-[#25633A] font-medium flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Uploaded: {selectedDiff.v2UploadedAt}</span>
              </div>
            </div>
          </div>

          {/* Change Breakdown Cards (Added, Modified, Removed) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Added Information */}
            <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE0]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E5732]">
                  <PlusCircle className="w-4 h-4 text-[#1E5732]" />
                  <span>Added Information ({addedItems.length})</span>
                </div>
              </div>

              <div className="space-y-2">
                {addedItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] text-xs space-y-1">
                    <div className="font-semibold text-[#2D231C]">{item.field}</div>
                    <div className="text-[11px] text-[#1E5732] font-mono bg-[#EEF6F0] p-1.5 rounded border border-[#C4DFC8]">
                      + {item.v2Value}
                    </div>
                  </div>
                ))}
                {addedItems.length === 0 && (
                  <div className="text-xs text-[#8A7969] text-center py-4">No added fields.</div>
                )}
              </div>
            </div>

            {/* Modified Information */}
            <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE0]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C5832]">
                  <Edit2 className="w-4 h-4 text-[#8C5832]" />
                  <span>Modified Information ({modifiedItems.length})</span>
                </div>
              </div>

              <div className="space-y-2">
                {modifiedItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] text-xs space-y-1.5">
                    <div className="font-semibold text-[#2D231C]">{item.field}</div>
                    <div className="text-[11px] text-[#932F27] font-mono line-through opacity-75">
                      V1: {item.v1Value}
                    </div>
                    <div className="text-[11px] text-[#1E5732] font-mono font-medium">
                      V2: {item.v2Value}
                    </div>
                  </div>
                ))}
                {modifiedItems.length === 0 && (
                  <div className="text-xs text-[#8A7969] text-center py-4">No modifications detected.</div>
                )}
              </div>
            </div>

            {/* Removed Information */}
            <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE0]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#932F27]">
                  <MinusCircle className="w-4 h-4 text-[#932F27]" />
                  <span>Removed Information ({removedItems.length})</span>
                </div>
              </div>

              <div className="space-y-2">
                {removedItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] text-xs space-y-1">
                    <div className="font-semibold text-[#2D231C]">{item.field}</div>
                    <div className="text-[11px] text-[#932F27] font-mono bg-[#FDF1EF] p-1.5 rounded border border-[#F2C9C5]">
                      - {item.v1Value}
                    </div>
                  </div>
                ))}
                {removedItems.length === 0 && (
                  <div className="text-xs text-[#8A7969] text-center py-4">No removed items.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
