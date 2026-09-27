import React, { useState } from 'react';
import { AuditLogItem, UserProfile } from '../types';
import { 
  History, 
  ShieldCheck, 
  Search, 
  Filter, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  UserCheck, 
  UploadCloud, 
  AlertTriangle, 
  HelpCircle,
  Layers,
  FileText,
  Sliders,
  Check
} from 'lucide-react';

interface AuditTrailViewProps {
  auditLogs: AuditLogItem[];
  currentUser: UserProfile;
}

export interface TimelineAuditEntry {
  id: string;
  time: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  category: 'Upload' | 'Verification' | 'Change' | 'AI Result' | 'Officer Decision' | 'Version' | 'Override' | 'Clarification';
  badgeColor: string;
  tenderOrBidder?: string;
  hash?: string;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLogs, currentUser }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'ledger'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Pre-seeded authentic chronological timeline records reflecting prompt's exact example
  const timelineEvents: TimelineAuditEntry[] = [
    {
      id: 'tl-1',
      time: '10:35 AM',
      actor: 'Vikramaditya Sharma',
      role: 'Verification Officer',
      action: 'Added clarification request',
      details: 'Issued formal CPPP Clarification Notice #REF-2026-0924 to Zenith Systems regarding ₹1.2 Cr turnover shortfall & missing UDIN declaration.',
      category: 'Clarification',
      badgeColor: 'bg-[#FFF8EB] text-[#8C5D17] border-[#F0DDBE]',
      tenderOrBidder: 'Zenith Systems & Civil Works LLP',
      hash: 'SHA256:7f9a88e1...41cb',
    },
    {
      id: 'tl-2',
      time: '10:31 AM',
      actor: 'Vikramaditya Sharma',
      role: 'Verification Officer',
      action: 'Reviewed discrepancy',
      details: 'Officer reviewed MCA21 vs GST registration name variance. Applied Knowledge Precedent Case #1024 (substantive responsiveness under GFR 173).',
      category: 'Officer Decision',
      badgeColor: 'bg-[#FAF5EE] text-[#553E2B] border-[#DFD3C2]',
      tenderOrBidder: 'Apex InfraTech Solutions Pvt Ltd',
      hash: 'SHA256:4d2b9910...aa99',
    },
    {
      id: 'tl-3',
      time: '10:15 AM',
      actor: 'AI Verification Engine',
      role: 'Automated AI Core',
      action: 'Detected company-name mismatch',
      details: 'Cross-document verification flagged subtle name mismatch: GST Certificate lists "Apex InfraTech Solutions Pvt Ltd" while PAN card states "Apex InfraTech Solutions Private Limited".',
      category: 'AI Result',
      badgeColor: 'bg-[#FFF3E8] text-[#9E4D14] border-[#FCD5B5]',
      tenderOrBidder: 'Apex InfraTech Solutions Pvt Ltd',
      hash: 'SHA256:99cfa12e...38b1',
    },
    {
      id: 'tl-4',
      time: '09:42 AM',
      actor: 'Vikramaditya Sharma',
      role: 'Verification Officer',
      action: 'Updated GST document',
      details: 'Uploaded verified Form REG-06 GSTIN registration filing and initiated live GSTN API validation check.',
      category: 'Upload',
      badgeColor: 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]',
      tenderOrBidder: 'Apex InfraTech Solutions Pvt Ltd',
      hash: 'SHA256:1a82bc99...77de',
    },
    {
      id: 'tl-5',
      time: '09:15 AM',
      actor: 'Smt. Ananya Sengupta',
      role: 'Procurement Officer',
      action: 'Published Tender Specification Corrigendum v2.1',
      details: 'Clarification issued on Clause 4.2: CA certificates with UDIN generated within 7 days of bid opening permitted.',
      category: 'Version',
      badgeColor: 'bg-[#F2EDE4] text-[#4A3525] border-[#DDD3C4]',
      tenderOrBidder: 'NHAI/2026/TECH-BID/4482',
      hash: 'SHA256:3d81ff00...91ab',
    },
    {
      id: 'tl-6',
      time: 'Yesterday 04:45 PM',
      actor: 'Vikramaditya Sharma',
      role: 'Verification Officer',
      action: 'Override recorded on Turnover Requirement',
      details: 'Overrode automated AI "Needs Review" flag on Zenith Systems after inspecting direct SBI Solvency Certificate letter.',
      category: 'Override',
      badgeColor: 'bg-[#FDF1EF] text-[#932F27] border-[#F2C9C5]',
      tenderOrBidder: 'Zenith Systems & Civil Works LLP',
      hash: 'SHA256:88bc4122...00da',
    },
    {
      id: 'tl-7',
      time: 'Yesterday 02:10 PM',
      actor: 'Dr. Rajeshwar Rao, IAS',
      role: 'Admin',
      action: 'Audited Technical Evaluation Committee Minutes',
      details: 'Endorsed preliminary qualification list of 18 MSME bidders under Public Procurement Policy Order 2012.',
      category: 'Verification',
      badgeColor: 'bg-[#FAF5EE] text-[#553E2B] border-[#DFD3C2]',
      tenderOrBidder: 'Public Procurement Committee',
      hash: 'SHA256:55ae8100...22ff',
    },
  ];

  const categories = [
    'All',
    'Upload',
    'Verification',
    'Change',
    'AI Result',
    'Officer Decision',
    'Version',
    'Override',
    'Clarification',
  ];

  const filteredTimeline = timelineEvents.filter((item) => {
    const matchesSearch =
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tenderOrBidder && item.tenderOrBidder.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 3 • Audit & Governance
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Tamper-Evident Ledger
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#8C5832]" />
            CPPP Cryptographic Compliance Audit Trail
          </h2>
          <p className="text-xs text-[#736355]">
            Chronological log tracking who uploaded, who verified, what changed, AI results, and officer decisions
          </p>
        </div>

        {/* View Switcher & Integrity Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#EFE8DD] p-0.5 rounded-lg border border-[#DDD3C4] text-xs">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#3D2513] shadow-2xs'
                  : 'text-[#6D5F52] hover:text-[#2E231C]'
              }`}
            >
              Timeline View
            </button>
            <button
              onClick={() => setViewMode('ledger')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'ledger'
                  ? 'bg-white text-[#3D2513] shadow-2xs'
                  : 'text-[#6D5F52] hover:text-[#2E231C]'
              }`}
            >
              Forensic Ledger
            </button>
          </div>

          <span className="text-xs text-[#1E5732] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF6F0] border border-[#C4DFC8] shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SHA-256 Synchronized</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-[#E8E0D4] bg-white/90 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8A7969] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline by officer, action, change, or company..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg glass-input text-[#2D231C]"
          />
        </div>

        {/* Category Filters (Who uploaded, Who verified, What changed, AI results, Officer decisions, Overrides, Clarifications) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-semibold text-[#8C6B52] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#8C5832]" />
            <span>Track:</span>
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#8C5832] text-white border-[#8C5832] shadow-2xs font-semibold'
                    : 'bg-[#FAF8F5] text-[#554233] border-[#DDD3C4] hover:bg-white'
                }`}
              >
                {cat === 'All' ? 'All Activities' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. SIMPLE & READABLE TIMELINE VIEW (As explicitly formatted in prompt) */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2D6C6]">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#FAF7F2] border-2 border-[#8C5832] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8C5832]" />
                </div>

                {/* Clean Timeline Card */}
                <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/95 shadow-2xs hover:border-[#8C5832]/40 transition-all space-y-2">
                  {/* Top Line: Time + Actor + Category Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#F0EAE0]">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#8C5832] bg-[#FAF5EE] px-2 py-0.5 rounded border border-[#E2D8C8]">
                        {item.time}
                      </span>
                      <span className="font-semibold text-xs text-[#2D231C]">
                        {item.role}
                      </span>
                      <span className="text-xs text-[#7A6B5D]">
                        ({item.actor})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${item.badgeColor}`}>
                        {item.category}
                      </span>
                      {item.hash && (
                        <span className="font-mono text-[9px] text-[#9E8E7E] hidden md:inline">
                          {item.hash}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Headline */}
                  <div className="text-xs font-bold text-[#2D231C]">
                    {item.action}
                  </div>

                  {/* Event Details */}
                  <div className="text-xs text-[#554233] leading-relaxed">
                    {item.details}
                  </div>

                  {/* Context footer */}
                  {item.tenderOrBidder && (
                    <div className="text-[11px] text-[#7A6B5D] pt-1 flex items-center gap-2 border-t border-[#F5EFE7]">
                      <span className="font-medium text-[#8C6B52]">Target Entity:</span>
                      <span className="font-semibold text-[#3D2C1F]">{item.tenderOrBidder}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTimeline.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8A7969] glass-card rounded-2xl border border-[#E6DDD0]">
              No timeline records matching the selected criteria.
            </div>
          )}
        </div>
      )}

      {/* 2. FORENSIC LEDGER VIEW */}
      {viewMode === 'ledger' && (
        <div className="glass-card rounded-2xl border border-[#E6DDD0] overflow-hidden bg-white/90 shadow-2xs">
          <div className="divide-y divide-[#F0EAE0]">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF4ED] text-[#8C5832] flex items-center justify-center font-mono font-semibold text-[11px] shrink-0 mt-0.5">
                    {log.module.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#2D231C] text-xs">{log.action}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#553E2B] border border-[#E2D8C8]">
                        {log.module}
                      </span>
                      <span className="text-[#7A6B5D] text-[11px]">
                        by <strong className="text-[#3D2C1F]">{log.user}</strong> ({log.role})
                      </span>
                    </div>
                    <div className="text-[#655648] text-xs mt-1 leading-relaxed">
                      {log.details}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-0.5">
                  <div className="text-[11px] font-mono text-[#8C7A6A] font-medium">
                    {log.timestamp}
                  </div>
                  {log.documentHash && (
                    <div className="text-[10px] font-mono text-[#9B8877] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EDE5DA]">
                      {log.documentHash}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-xs text-[#8A7969]">
                No audit records matching your criteria.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
