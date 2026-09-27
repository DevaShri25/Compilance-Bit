import React, { useState } from 'react';
import { UserProfile, ReviewQueueItem, ComplianceDetailedStatus } from '../types';
import { ShieldAlert, Check, X, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

interface OfficerOverrideModalProps {
  item: ReviewQueueItem;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (override: NonNullable<ReviewQueueItem['officerOverride']>) => void;
}

export const OfficerOverrideModal: React.FC<OfficerOverrideModalProps> = ({
  item,
  currentUser,
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [newStatus, setNewStatus] = useState<ComplianceDetailedStatus>('Compliant');
  const [reason, setReason] = useState('');

  const statuses: ComplianceDetailedStatus[] = [
    'Compliant',
    'Needs Review',
    'Discrepancy',
    'Not Met',
    'Missing',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onSubmit({
      originalAiResult: item.complianceStatus,
      overriddenResult: newStatus,
      officerName: currentUser.name,
      officerRole: currentUser.role,
      reason: reason.trim(),
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#FAF8F5] rounded-2xl border border-[#DDD3C4] shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE3D6]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF4ED] text-[#8C5832] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#2D231C]">
                Officer Assessment Override
              </h3>
              <p className="text-xs text-[#736355]">
                Supercede algorithmic evaluation with human committee judgement
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* AI Assessment -> Officer Review -> Final Decision Chain */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6B52]">
              Decision Authority Trace
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-[#7A6B5D] text-[11px] block">AI Assessment</span>
                <span className="font-semibold text-[#2D231C] font-mono">
                  {item.complianceStatus}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8C5832]" />
              <div>
                <span className="text-[#7A6B5D] text-[11px] block">Officer Review</span>
                <span className="font-semibold text-[#8C5832]">
                  {currentUser.role}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8C5832]" />
              <div>
                <span className="text-[#7A6B5D] text-[11px] block">Final Decision</span>
                <span className="font-semibold text-[#1E5732]">
                  {newStatus}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1.5">
              Select Overridden Compliance Status *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {statuses.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setNewStatus(st)}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                    newStatus === st
                      ? 'bg-[#8C5832] text-white border-[#8C5832] shadow-2xs'
                      : 'bg-white border-[#D5C9B8] text-[#554233] hover:bg-[#F9F5EE]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5A4B] mb-1">
              Official Justification / Reason for Override *
            </label>
            <textarea
              rows={4}
              required
              placeholder="State precise technical or legal reasons under GFR 173 (e.g., 'Statutory clarification confirmed entity eligibility under MSME Gazette Notification 2024 despite abbreviation difference')..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-[#2D231C] leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#FAF5EE] border border-[#EADBCA] text-[11px] text-[#553E2B]">
            <strong>Legal Audit Notice:</strong> This action will be permanently recorded in the CPPP immutable audit ledger with your digital credential: <strong>{currentUser.name} ({currentUser.employeeId})</strong>.
          </div>

          <div className="pt-2 border-t border-[#ECE3D6] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-xs font-medium text-[#4A3423] hover:bg-[#F9F5EE] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold cursor-pointer shadow-xs"
            >
              Commit Officer Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
