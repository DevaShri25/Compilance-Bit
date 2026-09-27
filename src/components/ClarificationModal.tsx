import React, { useState } from 'react';
import { UserProfile, ReviewQueueItem, Tender, Bidder } from '../types';
import { Mail, Clock, Send, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface ClarificationModalProps {
  item: ReviewQueueItem;
  tender: Tender;
  bidder: Bidder;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clarification: NonNullable<ReviewQueueItem['clarificationRequest']>) => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  item,
  tender,
  bidder,
  currentUser,
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const defaultRef = `CPPP/CLARIF/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
  const defaultSubject = `Clarification Notice under GFR 173: ${item.requirementTitle} [${tender.tenderId}]`;
  const defaultDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 17:00 IST';
  
  const [subject, setSubject] = useState(defaultSubject);
  const [missingItem, setMissingItem] = useState(item.requirementTitle);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [question, setQuestion] = useState(
    `Regarding your bid submission for "${tender.title}" (${tender.tenderId}):
Under Clause ${item.tenderClause}, please clarify and provide authentic supporting documentary evidence for: "${item.requirementTitle}".
Current assessment indicates: "${item.evidenceSummary}".
Kindly upload the certified document through the CPPP portal prior to the deadline specified.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      referenceId: defaultRef,
      missingOrUnclearItem: missingItem,
      deadline,
      subject,
      formalQuestion: question,
      sentAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#FAF8F5] rounded-2xl border border-[#DDD3C4] shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE3D6]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF4ED] text-[#8C5832] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#2D231C]">
                Issue Formal Clarification Request
              </h3>
              <p className="text-xs text-[#736355]">
                GFR Clause 173 Formal Bidder Inquiry Notice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A7969] hover:text-[#2D231C] text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="p-3 rounded-lg bg-[#FAF5EE] border border-[#EADBCA] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#8C5832] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#553E2B] leading-relaxed">
              Recipient: <strong>{bidder.name}</strong> ({bidder.representativeContact})
              <br />
              Tender: <strong>{tender.tenderId}</strong> — {tender.title}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                Notice Reference ID
              </label>
              <input
                type="text"
                readOnly
                value={defaultRef}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-[#2D231C] font-mono text-[11px] bg-white/60"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
                Response Deadline *
              </label>
              <input
                type="text"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-[#2D231C] font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
              Notice Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg glass-input text-[#2D231C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
              Deficient / Unclear Requirement *
            </label>
            <input
              type="text"
              required
              value={missingItem}
              onChange={(e) => setMissingItem(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg glass-input text-[#2D231C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
              Official Inquiry Text *
            </label>
            <textarea
              rows={4}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-[#2D231C] leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-[#ECE3D6] flex items-center justify-between">
            <span className="text-[11px] text-[#7A6B5D]">
              Issued by: <strong>{currentUser.name}</strong> ({currentUser.role})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-xs font-medium text-[#4A3423] hover:bg-[#F9F5EE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Formal Notice</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
