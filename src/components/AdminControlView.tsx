import React, { useState } from 'react';
import { UserProfile, AdminSystemConfig } from '../types';
import { 
  ShieldAlert, 
  Users, 
  Key, 
  Settings, 
  FileText, 
  Cpu, 
  Sliders, 
  Lock, 
  CheckCircle2, 
  Save,
  Clock
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface AdminControlViewProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  adminConfig: AdminSystemConfig;
  onUpdateAdminConfig: (updated: AdminSystemConfig) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const AdminControlView: React.FC<AdminControlViewProps> = ({
  currentUser,
  availableUsers,
  adminConfig,
  onUpdateAdminConfig,
  onNavigate,
  onLogAudit,
}) => {
  const [config, setConfig] = useState<AdminSystemConfig>(adminConfig);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'audit' | 'documents' | 'ai'>('users');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdminConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    onLogAudit(
      'System Settings Modified',
      'System',
      `Admin ${currentUser.name} updated procurement system governance parameters.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 3 • System Governance
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Admin Restricted
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            Administration Control Center
          </h2>
          <p className="text-xs text-[#736355]">
            Configure role permissions, GFR regulatory thresholds, cryptographic audit levels, and neural OCR sensitivity
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-3.5 py-1.5 rounded-lg bg-[#8C5832] text-white hover:bg-[#724523] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-[#EEF6F0] border border-[#C4DFC8] text-xs text-[#1E5732] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#1E5732]" />
          <span>System configuration successfully updated and committed to security audit ledger.</span>
        </div>
      )}

      {/* Admin Nav Sub-Tabs (As requested in prompt: Users, Roles, Permissions, Audit Settings, Document Settings, AI Settings) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'roles', label: 'Roles', icon: ShieldAlert },
          { id: 'permissions', label: 'Permissions', icon: Key },
          { id: 'audit', label: 'Audit Settings', icon: Lock },
          { id: 'documents', label: 'Document Settings', icon: FileText },
          { id: 'ai', label: 'AI Settings', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#8C5832] text-white shadow-2xs font-semibold'
                  : 'bg-white/80 border border-[#DDD3C4] text-[#635345] hover:bg-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#8C5832]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl border border-[#E6DDD0] overflow-hidden bg-white/90 shadow-2xs">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E6DDD0] flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#2D231C]">
              Authorized Government Personnel ({availableUsers.length})
            </span>
            <span className="text-[#7A6B5D]">CPPP Employee Directory</span>
          </div>

          <div className="divide-y divide-[#F0EAE0]">
            {availableUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF4ED] text-[#8C5832] flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#2D231C]">{user.name}</div>
                    <div className="text-[11px] text-[#7A6B5D]">{user.department} • ID: {user.employeeId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#FAF5EE] text-[#553E2B] border border-[#E2D8C8]">
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ROLES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-2">
            <div className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
              1. Admin Role
            </div>
            <p className="text-[11px] text-[#7A6B5D]">
              Full oversight over CPPP audit log, system-wide configuration, officer user credentials, and tender un-locking.
            </p>
            <div className="pt-2 border-t border-[#F0EAE0] text-[10px] text-[#25633A] font-semibold">
              ✓ Unrestricted Governance Access
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-2">
            <div className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
              2. Procurement Officer
            </div>
            <p className="text-[11px] text-[#7A6B5D]">
              Author of tender notices, RFP ingestion, AI criteria extraction, and checklist generation under GFR rules.
            </p>
            <div className="pt-2 border-t border-[#F0EAE0] text-[10px] text-[#25633A] font-semibold">
              ✓ Tender Authoring & Document Ingestion
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-2">
            <div className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
              3. Verification Officer
            </div>
            <p className="text-[11px] text-[#7A6B5D]">
              Technical evaluator responsible for document OCR audit, discrepancy flags, manual overrides, and final stage sign-off.
            </p>
            <div className="pt-2 border-t border-[#F0EAE0] text-[10px] text-[#25633A] font-semibold">
              ✓ Evaluation Committee Sign-off Authority
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="glass-card rounded-2xl p-5 border border-[#E6DDD0] bg-white/90 shadow-2xs space-y-3 text-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
            RBAC Permission Matrix
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#2D231C]">Tender Authoring & PDF Upload</div>
                <div className="text-[11px] text-[#7A6B5D]">Permissions to issue new public dockets</div>
              </div>
              <span className="text-[11px] font-mono text-[#8C5832]">Admin, Procurement Officer</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#2D231C]">Officer Assessment Override & Clarifications</div>
                <div className="text-[11px] text-[#7A6B5D]">Permissions to supercede AI evaluations and dispatch inquiry letters</div>
              </div>
              <span className="text-[11px] font-mono text-[#8C5832]">Verification Officer, Admin</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#2D231C]">SHA-256 Ledger Audit Log Inspection</div>
                <div className="text-[11px] text-[#7A6B5D]">Permissions to inspect cryptographic tamper seals</div>
              </div>
              <span className="text-[11px] font-mono text-[#8C5832]">All Roles (Read-Only)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT SETTINGS */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-2xl p-5 border border-[#DFD5C6] space-y-4 text-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
            Cryptographic Audit & Logging Configuration
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-2">
              <label className="font-semibold text-[#2D231C] block">Audit Granularity Level</label>
              <select
                value={config.activeAuditLevel}
                onChange={(e) => setConfig({ ...config, activeAuditLevel: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
              >
                <option value="Standard">Standard Compliance (GFR Minimum)</option>
                <option value="Verbose">Verbose (All OCR Interactions)</option>
                <option value="Strict Forensic">Strict Forensic (SHA-256 + Officer Timestamps)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-2">
              <label className="font-semibold text-[#2D231C] block">Cryptographic Hash Validation</label>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hash-enforce"
                  checked={config.sha256HashingEnabled}
                  onChange={(e) => setConfig({ ...config, sha256HashingEnabled: e.target.checked })}
                  className="w-4 h-4 text-[#8C5832] rounded cursor-pointer"
                />
                <label htmlFor="hash-enforce" className="text-xs text-[#2D231C] cursor-pointer">
                  Require SHA-256 digital seals on all document uploads and officer approvals
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENT SETTINGS */}
      {activeTab === 'documents' && (
        <div className="glass-panel rounded-2xl p-5 border border-[#DFD5C6] space-y-4 text-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
            Document Retention & Storage Mandates
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-2">
              <label className="font-semibold text-[#2D231C] block">Statutory Retention Window (Years)</label>
              <input
                type="number"
                value={config.retentionPeriodYears}
                onChange={(e) => setConfig({ ...config, retentionPeriodYears: parseInt(e.target.value) || 8 })}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
              />
              <p className="text-[11px] text-[#7A6B5D]">
                Mandatory minimum for public works tenders under Comptroller & Auditor General (CAG) guidelines: 8 years.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-2">
              <label className="font-semibold text-[#2D231C] block">Dual-Officer Technical Sign-off</label>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dual-sign"
                  checked={config.requireDualOfficerSignoff}
                  onChange={(e) => setConfig({ ...config, requireDualOfficerSignoff: e.target.checked })}
                  className="w-4 h-4 text-[#8C5832] rounded cursor-pointer"
                />
                <label htmlFor="dual-sign" className="text-xs text-[#2D231C] cursor-pointer">
                  Require minimum 2 distinct officer endorsements for tender packages &gt; ₹10.0 Cr
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AI SETTINGS */}
      {activeTab === 'ai' && (
        <div className="glass-panel rounded-2xl p-5 border border-[#DFD5C6] space-y-4 text-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#2D231C]">
            AI Assistance & OCR Extraction Parameters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#2D231C]">Confidence Threshold for Auto-Pass</label>
                <span className="font-mono text-xs font-bold text-[#8C5832]">
                  {(config.aiConfidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.80"
                max="0.99"
                step="0.01"
                value={config.aiConfidenceThreshold}
                onChange={(e) => setConfig({ ...config, aiConfidenceThreshold: parseFloat(e.target.value) })}
                className="w-full accent-[#8C5832] cursor-pointer"
              />
              <p className="text-[11px] text-[#7A6B5D]">
                Extractions below this threshold are automatically routed to the "Needs Review" queue for human examination.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E6DDD0] space-y-2">
              <label className="font-semibold text-[#2D231C] block">Automated Reference Matching</label>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="auto-ref"
                  checked={config.allowAutoEvidenceSuggestion}
                  onChange={(e) => setConfig({ ...config, allowAutoEvidenceSuggestion: e.target.checked })}
                  className="w-4 h-4 text-[#8C5832] rounded cursor-pointer"
                />
                <label htmlFor="auto-ref" className="text-xs text-[#2D231C] cursor-pointer">
                  Surface similar approved historical rulings from Knowledge Memory
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
