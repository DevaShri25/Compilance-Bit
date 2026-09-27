import React, { useState } from 'react';
import { 
  UserProfile, 
  Tender, 
  Bidder, 
  ReviewQueueItem, 
  ComplianceDetailedStatus 
} from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Filter, 
  Mail, 
  Edit3, 
  Check, 
  X, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { ClarificationModal } from './ClarificationModal';
import { OfficerOverrideModal } from './OfficerOverrideModal';
import { NavTabId } from './Navigation';

interface ReviewQueueViewProps {
  tenders: Tender[];
  bidders: Bidder[];
  selectedTender: Tender;
  selectedBidder: Bidder;
  reviewItems: ReviewQueueItem[];
  currentUser: UserProfile;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
  onUpdateReviewItem: (updated: ReviewQueueItem) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  tenders,
  bidders,
  selectedTender,
  selectedBidder,
  reviewItems,
  currentUser,
  onSelectTender,
  onSelectBidder,
  onUpdateReviewItem,
  onNavigate,
  onLogAudit,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('Attention Needed');
  const [activeModalItem, setActiveModalItem] = useState<ReviewQueueItem | null>(null);
  const [modalType, setModalType] = useState<'clarification' | 'override' | null>(null);
  const [remarkInput, setRemarkInput] = useState<Record<string, string>>({});
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);

  // Filter items matching selected tender/bidder or show all
  const filteredByContext = reviewItems.filter(
    (item) => item.tenderId === selectedTender.id && item.bidderId === selectedBidder.id
  );

  // If no items directly for context, show global review queue for the tender
  const displayItems = filteredByContext.length > 0 ? filteredByContext : reviewItems;

  // Counters
  const totalChecked = displayItems.length;
  const compliantCount = displayItems.filter((i) => i.complianceStatus === 'Compliant').length;
  const missingCount = displayItems.filter((i) => i.complianceStatus === 'Missing').length;
  const discrepancyCount = displayItems.filter((i) => i.complianceStatus === 'Discrepancy' || i.complianceStatus === 'Not Met').length;
  const needsReviewCount = displayItems.filter((i) => i.complianceStatus === 'Needs Review').length;
  const highRiskCount = displayItems.filter((i) => i.priority === 'High Risk / Uncertain').length;

  // Filter by priority tab
  const visibleItems = displayItems.filter((item) => {
    if (priorityFilter === 'All') return true;
    if (priorityFilter === 'Attention Needed') {
      return item.priority !== 'Clear' || item.officerStatus === 'Pending Officer Review';
    }
    return item.priority === priorityFilter;
  });

  const handleAcceptResult = (item: ReviewQueueItem) => {
    const updated: ReviewQueueItem = {
      ...item,
      officerStatus: 'Accepted',
      officerRemarks: item.officerRemarks || `AI finding confirmed by ${currentUser.name} (${currentUser.role}).`,
    };
    onUpdateReviewItem(updated);
    onLogAudit(
      'AI Result Accepted',
      'Officer Review',
      `Officer ${currentUser.name} accepted AI evaluation for "${item.requirementTitle}".`
    );
  };

  const handleRejectResult = (item: ReviewQueueItem) => {
    const updated: ReviewQueueItem = {
      ...item,
      officerStatus: 'Rejected',
      officerRemarks: `AI finding rejected by ${currentUser.name}. Requires committee deliberation.`,
    };
    onUpdateReviewItem(updated);
    onLogAudit(
      'AI Result Rejected',
      'Officer Review',
      `Officer ${currentUser.name} rejected AI finding for "${item.requirementTitle}".`
    );
  };

  const handleSaveRemark = (itemId: string) => {
    const item = displayItems.find((i) => i.id === itemId);
    if (!item) return;
    const newRemark = remarkInput[itemId];
    if (newRemark !== undefined) {
      const updated: ReviewQueueItem = {
        ...item,
        officerRemarks: newRemark,
      };
      onUpdateReviewItem(updated);
      setEditingRemarkId(null);
      onLogAudit(
        'Remark Added',
        'Officer Review',
        `Remark updated for "${item.requirementTitle}" by ${currentUser.name}.`
      );
    }
  };

  const getStatusBadge = (status: ComplianceDetailedStatus) => {
    switch (status) {
      case 'Compliant':
        return 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]';
      case 'Needs Review':
        return 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]';
      case 'Discrepancy':
        return 'bg-[#FDF3EB] text-[#9E4E16] border-[#F5DAC2]';
      case 'Missing':
      case 'Not Met':
        return 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]';
    }
  };

  const getPriorityBadge = (priority: ReviewQueueItem['priority']) => {
    switch (priority) {
      case 'High Risk / Uncertain':
        return 'bg-[#FDF0EE] text-[#9A2D24] border-[#F2C7C2] font-semibold';
      case 'Discrepancy':
        return 'bg-[#FFF4EC] text-[#9E4D14] border-[#F3D9C3]';
      case 'Missing Information':
        return 'bg-[#F9F0F5] text-[#872D64] border-[#E8CDDE]';
      case 'Needs Review':
        return 'bg-[#FFF9EC] text-[#8A5B15] border-[#EEDFBF]';
      case 'Clear':
        return 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 2 • Human-in-the-Loop Review
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Officer Authoritative
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Smart Human Review Queue
          </h2>
          <p className="text-xs text-[#736355]">
            Prioritizes discrepancies, missing documentation, and uncertain criteria requiring officer committee sign-off
          </p>
        </div>

        {/* Dual Context Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-[#DDD3C4] rounded-lg px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] text-[#7A6B5D] font-medium">Tender:</span>
            <select
              value={selectedTender.id}
              onChange={(e) => {
                const t = tenders.find((item) => item.id === e.target.value);
                if (t) onSelectTender(t);
              }}
              className="text-xs font-semibold text-[#2D231C] outline-none bg-transparent max-w-[200px] truncate"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenderId}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-[#DDD3C4] rounded-lg px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] text-[#7A6B5D] font-medium">Bidder:</span>
            <select
              value={selectedBidder.id}
              onChange={(e) => {
                const b = bidders.find((item) => item.id === e.target.value);
                if (b) onSelectBidder(b);
              }}
              className="text-xs font-semibold text-[#2D231C] outline-none bg-transparent max-w-[200px] truncate"
            >
              {bidders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Counters Banner (As specified in prompt) */}
      <div className="glass-panel rounded-2xl p-4 border border-[#DFD5C6]">
        <div className="text-xs font-semibold text-[#8C6B52] uppercase tracking-wider mb-2">
          Verification Summary ({totalChecked} Requirements Checked)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="p-2.5 rounded-xl bg-white/90 border border-[#E8E0D4] text-xs">
            <div className="text-[10px] text-[#7A6B5D] font-medium">Compliant</div>
            <div className="text-lg font-bold font-mono text-[#1E5732] mt-0.5">
              {compliantCount}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/90 border border-[#E8E0D4] text-xs">
            <div className="text-[10px] text-[#7A6B5D] font-medium">Missing Info</div>
            <div className="text-lg font-bold font-mono text-[#932F27] mt-0.5">
              {missingCount}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/90 border border-[#E8E0D4] text-xs">
            <div className="text-[10px] text-[#7A6B5D] font-medium">Discrepancy</div>
            <div className="text-lg font-bold font-mono text-[#9E4D14] mt-0.5">
              {discrepancyCount}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/90 border border-[#E8E0D4] text-xs">
            <div className="text-[10px] text-[#7A6B5D] font-medium">Needs Review</div>
            <div className="text-lg font-bold font-mono text-[#8C5D17] mt-0.5">
              {needsReviewCount}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/90 border border-[#E8E0D4] text-xs">
            <div className="text-[10px] text-[#7A6B5D] font-medium">High Risk</div>
            <div className="text-lg font-bold font-mono text-[#9A2D24] mt-0.5">
              {highRiskCount}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Categorization Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        {[
          'Attention Needed',
          'All',
          'High Risk / Uncertain',
          'Discrepancy',
          'Missing Information',
          'Needs Review',
          'Clear',
        ].map((p) => {
          const isActive = priorityFilter === p;
          return (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
                  : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Review Queue Items List */}
      <div className="space-y-4">
        {visibleItems.map((item) => {
          const isPending = item.officerStatus === 'Pending Officer Review';
          return (
            <div
              key={item.id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                isPending
                  ? 'border-[#DFCFC0] bg-white/95 shadow-sm ring-1 ring-[#8C5832]/10'
                  : 'border-[#E6DDD0] bg-white/80'
              }`}
            >
              {/* Header: Title, Priority & AI Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-[#2D231C]">
                    {item.requirementTitle}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border ${getPriorityBadge(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border ${getStatusBadge(
                      item.complianceStatus
                    )}`}
                  >
                    {item.complianceStatus}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#7A6B5D]">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#FAF5EE] border border-[#E2D8C8]">
                    {item.tenderClause}
                  </span>
                </div>
              </div>

              {/* Evidence & Reasoning Grid */}
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Evidence Summary */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                  <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                    Extracted Bidder Evidence
                  </div>
                  <div className="text-xs font-semibold text-[#2D231C] leading-snug">
                    {item.evidenceSummary}
                  </div>
                  <div className="text-[11px] text-[#7A6B5D] flex items-center gap-1 pt-1">
                    <FileText className="w-3 h-3 text-[#8C5832] shrink-0" />
                    <span>
                      {item.sourceDoc} (Page {item.pageNumber})
                    </span>
                  </div>
                </div>

                {/* Explainable AI: Why */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                  <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                    AI Evaluation Rationale (Explainable AI)
                  </div>
                  <div className="text-xs text-[#524132] leading-snug">
                    {item.whyExplanation}
                  </div>
                  <div className="text-[11px] text-[#7A6B5D] pt-1">
                    Applied Rule: <strong>{item.appliedRule}</strong>
                  </div>
                </div>
              </div>

              {/* AI Assessment -> Officer Review -> Final Decision Chain */}
              <div className="mt-3.5 p-3 rounded-xl bg-[#FBF9F6] border border-[#EADFCF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="text-[11px]">
                    <span className="text-[#7A6B5D] block text-[10px] uppercase font-semibold">
                      1. AI Assessment
                    </span>
                    <span className="font-semibold text-[#2D231C] font-mono">
                      {item.complianceStatus}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8C5832]" />
                  <div className="text-[11px]">
                    <span className="text-[#7A6B5D] block text-[10px] uppercase font-semibold">
                      2. Officer Review
                    </span>
                    <span
                      className={`font-semibold ${
                        item.officerStatus === 'Pending Officer Review'
                          ? 'text-[#8C5D17]'
                          : 'text-[#1E5732]'
                      }`}
                    >
                      {item.officerStatus}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8C5832]" />
                  <div className="text-[11px]">
                    <span className="text-[#7A6B5D] block text-[10px] uppercase font-semibold">
                      3. Final Decision
                    </span>
                    <span className="font-semibold text-[#2D231C] font-mono">
                      {item.officerOverride?.overriddenResult ||
                        (item.officerStatus === 'Accepted'
                          ? item.complianceStatus
                          : item.officerStatus === 'Rejected'
                          ? 'Rejected'
                          : 'Pending')}
                    </span>
                  </div>
                </div>

                {/* Override Stamp if present */}
                {item.officerOverride && (
                  <div className="text-[10px] text-[#7A6B5D] font-mono bg-white px-2.5 py-1 rounded border border-[#DDD3C4]">
                    Overridden by {item.officerOverride.officerName} on{' '}
                    {item.officerOverride.timestamp.split(' ')[0]}
                  </div>
                )}
              </div>

              {/* Officer Remark & Clarification Display */}
              {item.officerRemarks && (
                <div className="mt-2.5 text-xs text-[#635345] bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EDE5DA] flex items-start gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-[#8C5832] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#2D231C]">Officer Remark: </span>
                    <span>{item.officerRemarks}</span>
                  </div>
                </div>
              )}

              {item.clarificationRequest && (
                <div className="mt-2 text-xs text-[#224A6B] bg-[#F0F6FA] p-2.5 rounded-lg border border-[#CCE0ED] flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#1B5277] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Clarification Transmitted ({item.clarificationRequest.referenceId}): </span>
                    <span>{item.clarificationRequest.subject} — Deadline: {item.clarificationRequest.deadline}</span>
                  </div>
                </div>
              )}

              {/* Inline Remark Editor */}
              {editingRemarkId === item.id && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter official remark / evaluation committee note..."
                    value={remarkInput[item.id] ?? (item.officerRemarks || '')}
                    onChange={(e) =>
                      setRemarkInput((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
                  />
                  <button
                    onClick={() => handleSaveRemark(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#8C5832] text-white text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingRemarkId(null)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-xs text-[#553E2B] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Officer Action Bar (Accept, Reject, Override, Remark, Clarification) */}
              <div className="mt-4 pt-3 border-t border-[#F0EAE0] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleAcceptResult(item)}
                    className="px-3 py-1.5 rounded-lg bg-[#245D36] text-white hover:bg-[#1B4729] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept AI Result</span>
                  </button>
                  <button
                    onClick={() => handleRejectResult(item)}
                    className="px-3 py-1.5 rounded-lg bg-[#963028] text-white hover:bg-[#7A2620] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject AI Result</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveModalItem(item);
                      setModalType('override');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#D5C9B8] bg-white hover:bg-[#FAF6F0] text-xs font-medium text-[#4A3423] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#8C5832]" />
                    <span>Override Result</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingRemarkId(item.id);
                      setRemarkInput((prev) => ({
                        ...prev,
                        [item.id]: item.officerRemarks || '',
                      }));
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-[#D5C9B8] bg-white hover:bg-[#FAF6F0] text-xs text-[#553E2B] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-[#8C5832]" />
                    <span>Add Remark</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveModalItem(item);
                      setModalType('clarification');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF4ED] text-[#8C5832] border border-[#EADBCA] hover:bg-[#F4E9DC] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Request Clarification</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {visibleItems.length === 0 && (
          <div className="p-8 text-center text-xs text-[#8A7969] bg-white rounded-2xl border border-[#E8E0D4]">
            No review queue items found under "{priorityFilter}".
          </div>
        )}
      </div>

      {/* Modal Dialogs */}
      {modalType === 'clarification' && activeModalItem && (
        <ClarificationModal
          item={activeModalItem}
          tender={selectedTender}
          bidder={selectedBidder}
          currentUser={currentUser}
          isOpen={true}
          onClose={() => {
            setModalType(null);
            setActiveModalItem(null);
          }}
          onSubmit={(clarification) => {
            const updated: ReviewQueueItem = {
              ...activeModalItem,
              officerStatus: 'Clarification Sent',
              clarificationRequest: clarification,
            };
            onUpdateReviewItem(updated);
            onLogAudit(
              'Clarification Dispatched',
              'Officer Review',
              `Formal clarification ${clarification.referenceId} dispatched to ${selectedBidder.name} for "${activeModalItem.requirementTitle}".`
            );
          }}
        />
      )}

      {modalType === 'override' && activeModalItem && (
        <OfficerOverrideModal
          item={activeModalItem}
          currentUser={currentUser}
          isOpen={true}
          onClose={() => {
            setModalType(null);
            setActiveModalItem(null);
          }}
          onSubmit={(override) => {
            const updated: ReviewQueueItem = {
              ...activeModalItem,
              complianceStatus: override.overriddenResult,
              officerStatus: 'Overridden',
              officerOverride: override,
              officerRemarks: `Overridden to ${override.overriddenResult}. Reason: ${override.reason}`,
            };
            onUpdateReviewItem(updated);
            onLogAudit(
              'Officer Override Recorded',
              'Officer Review',
              `Assessment for "${activeModalItem.requirementTitle}" overridden to "${override.overriddenResult}" by ${currentUser.name}.`
            );
          }}
        />
      )}
    </div>
  );
};
