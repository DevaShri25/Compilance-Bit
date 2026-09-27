import React, { useState } from 'react';
import { UserProfile, UserRole, UserType } from '../types';
import { 
  ShieldCheck, 
  Building2, 
  Lock, 
  ArrowRight, 
  UserCheck, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

interface LoginViewProps {
  availableUsers: UserProfile[];
  onLogin: (user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ availableUsers, onLogin }) => {
  const [selectedUserType, setSelectedUserType] = useState<UserType>('Government Staff');
  const [selectedGovRole, setSelectedGovRole] = useState<UserRole>('Procurement Officer');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('bid-001');

  // Filter available personas based on selection
  const govUsers = availableUsers.filter((u) => u.userType === 'Government Staff');
  const companyUsers = availableUsers.filter((u) => u.userType === 'Company / Bidder');

  const activeGovUser = govUsers.find((u) => u.role === selectedGovRole) || govUsers[0];
  const activeCompanyUser = companyUsers.find((u) => u.companyId === selectedCompanyId) || companyUsers[0];

  const handleProceedLogin = () => {
    if (selectedUserType === 'Government Staff' && activeGovUser) {
      onLogin(activeGovUser);
    } else if (selectedUserType === 'Company / Bidder' && activeCompanyUser) {
      onLogin(activeCompanyUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D231C] flex flex-col justify-between selection:bg-[#EFE8DD] selection:text-[#3D2513]">
      {/* Top Government Emblem Bar */}
      <header className="border-b border-[#E8E0D4] bg-[#FAF7F2]/95 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3C2A1E] flex items-center justify-center text-[#F5EFE6] shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#E6CDA3]" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-semibold text-[#8C6B52]">
                Government of India • Central Public Procurement Portal (CPPP)
              </div>
              <div className="text-sm font-bold text-[#2D231C] tracking-tight">
                National E-Procurement & Tender Compliance Gateway
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#7A6B5D] bg-[#EFE8DD]/70 px-3 py-1 rounded-full border border-[#DDD3C4]">
            <Lock className="w-3.5 h-3.5 text-[#8C5832]" />
            <span className="font-mono text-[11px]">GFR 2017 & NIC Security Protocol</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="max-w-2xl w-full">
          {/* Main Container */}
          <div className="glass-card rounded-3xl p-8 border border-[#DFD5C6] bg-white/95 shadow-xl space-y-6">
            
            {/* Header info */}
            <div className="text-center space-y-1.5 pb-2 border-b border-[#EDE5DA]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6B52] bg-[#FAF5EE] px-3 py-1 rounded-full border border-[#E8DCCF]">
                Single Sign-On Authentication
              </span>
              <h1 className="text-xl font-bold text-[#2D231C] tracking-tight pt-1">
                Select Your Access Portal
              </h1>
              <p className="text-xs text-[#736355] max-w-md mx-auto">
                Secure access for authorized government procurement officials and registered corporate bidders.
              </p>
            </div>

            {/* Step 1: User Type Selection (Government Staff vs Company / Bidder) */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#665140] uppercase tracking-wider block">
                1. Select User Classification:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Government Staff Option */}
                <button
                  type="button"
                  onClick={() => setSelectedUserType('Government Staff')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    selectedUserType === 'Government Staff'
                      ? 'border-[#8C5832] bg-[#FAF5EE] shadow-sm ring-1 ring-[#8C5832]/20'
                      : 'border-[#E8E0D4] bg-[#FCFAF7] hover:bg-[#F7F2EA] opacity-80'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedUserType === 'Government Staff' ? 'bg-[#8C5832] text-white shadow-2xs' : 'bg-[#EAE0D2] text-[#634833]'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D231C] flex items-center gap-1.5">
                      Government Staff
                      {selectedUserType === 'Government Staff' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8C5832]" />
                      )}
                    </div>
                    <div className="text-[11px] text-[#736355] mt-0.5 leading-snug">
                      Authorized officers for tender formulation, AI verification, and oversight.
                    </div>
                  </div>
                </button>

                {/* Company / Bidder Option */}
                <button
                  type="button"
                  onClick={() => setSelectedUserType('Company / Bidder')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    selectedUserType === 'Company / Bidder'
                      ? 'border-[#8C5832] bg-[#FAF5EE] shadow-sm ring-1 ring-[#8C5832]/20'
                      : 'border-[#E8E0D4] bg-[#FCFAF7] hover:bg-[#F7F2EA] opacity-80'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedUserType === 'Company / Bidder' ? 'bg-[#8C5832] text-white shadow-2xs' : 'bg-[#EAE0D2] text-[#634833]'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D231C] flex items-center gap-1.5">
                      Company / Bidder
                      {selectedUserType === 'Company / Bidder' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8C5832]" />
                      )}
                    </div>
                    <div className="text-[11px] text-[#736355] mt-0.5 leading-snug">
                      Registered contractors & suppliers for tender discovery, eligibility & bid submission.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Role Details Based on User Type */}
            {selectedUserType === 'Government Staff' ? (
              <div className="space-y-3 pt-1">
                <label className="text-[11px] font-semibold text-[#665140] uppercase tracking-wider block">
                  2. Select Government Role:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Admin */}
                  <button
                    type="button"
                    onClick={() => setSelectedGovRole('Admin')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedGovRole === 'Admin'
                        ? 'border-[#8C5832] bg-[#FAF5EE] font-semibold ring-1 ring-[#8C5832]/30'
                        : 'border-[#E8E0D4] bg-[#FCFAF7] hover:bg-white text-[#554233]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#2D231C] flex items-center justify-between">
                      <span>Admin</span>
                      {selectedGovRole === 'Admin' && <span className="w-2 h-2 rounded-full bg-[#8C5832]" />}
                    </div>
                    <div className="text-[10px] text-[#7A6B5D] mt-1 leading-snug">
                      Users, Permissions, Repository, System Settings & Audit Logs
                    </div>
                  </button>

                  {/* Procurement Officer */}
                  <button
                    type="button"
                    onClick={() => setSelectedGovRole('Procurement Officer')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedGovRole === 'Procurement Officer'
                        ? 'border-[#8C5832] bg-[#FAF5EE] font-semibold ring-1 ring-[#8C5832]/30'
                        : 'border-[#E8E0D4] bg-[#FCFAF7] hover:bg-white text-[#554233]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#2D231C] flex items-center justify-between">
                      <span>Procurement Officer</span>
                      {selectedGovRole === 'Procurement Officer' && <span className="w-2 h-2 rounded-full bg-[#8C5832]" />}
                    </div>
                    <div className="text-[10px] text-[#7A6B5D] mt-1 leading-snug">
                      Draft & Create Tenders, Received Bids, AI Shortlist, Reports
                    </div>
                  </button>

                  {/* Verification Officer */}
                  <button
                    type="button"
                    onClick={() => setSelectedGovRole('Verification Officer')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedGovRole === 'Verification Officer'
                        ? 'border-[#8C5832] bg-[#FAF5EE] font-semibold ring-1 ring-[#8C5832]/30'
                        : 'border-[#E8E0D4] bg-[#FCFAF7] hover:bg-white text-[#554233]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#2D231C] flex items-center justify-between">
                      <span>Verification Officer</span>
                      {selectedGovRole === 'Verification Officer' && <span className="w-2 h-2 rounded-full bg-[#8C5832]" />}
                    </div>
                    <div className="text-[10px] text-[#7A6B5D] mt-1 leading-snug">
                      Pending Reviews, Document OCR, Compliance & Evidence Review
                    </div>
                  </button>
                </div>

                {/* Selected Government Officer Summary Badge */}
                {activeGovUser && (
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDD0] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EFE8DD] text-[#553E2B] flex items-center justify-center font-bold font-mono text-xs">
                        {activeGovUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#2D231C]">{activeGovUser.name}</div>
                        <div className="text-[11px] text-[#7A6B5D]">{activeGovUser.department} • {activeGovUser.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#DDD3C4] text-[#634833]">
                      {activeGovUser.employeeId}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <label className="text-[11px] font-semibold text-[#665140] uppercase tracking-wider block">
                  2. Select Registered Company Persona:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {companyUsers.map((cu) => {
                    const isSelected = cu.companyId === selectedCompanyId;
                    return (
                      <button
                        key={cu.id}
                        type="button"
                        onClick={() => setSelectedCompanyId(cu.companyId || 'bid-001')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#8C5832] bg-[#FAF5EE] ring-1 ring-[#8C5832]/30'
                            : 'border-[#E8E0D4] bg-[#FCFAF7] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-[#2D231C]">{cu.companyName}</div>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#8C5832]" />}
                        </div>
                        <div className="text-[11px] text-[#665140] mt-0.5 font-medium">
                          Authorized Signatory: {cu.name}
                        </div>
                        <div className="text-[10px] text-[#8C7A6A] font-mono mt-1">
                          ID: {cu.companyId?.toUpperCase()} • {cu.email}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Company Context Notice */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DDD0] flex items-start gap-2 text-[11px] text-[#736355]">
                  <Info className="w-4 h-4 text-[#8C5832] shrink-0 mt-0.5" />
                  <div>
                    <strong>Data Isolation Notice:</strong> Companies only access their own profile, document vault, and tender submissions. Other bidders' documents and government internal deliberations remain completely protected.
                  </div>
                </div>
              </div>
            )}

            {/* Submit / Login Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProceedLogin}
                className="w-full py-3.5 px-6 rounded-xl bg-[#8C5832] hover:bg-[#724523] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>
                  {selectedUserType === 'Government Staff'
                    ? `Enter Portal as ${selectedGovRole}`
                    : `Enter Portal as ${activeCompanyUser?.companyName || 'Bidder'}`}
                </span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Footer Disclaimer */}
            <div className="text-center pt-2 border-t border-[#F0EAE0] text-[10px] text-[#8C7B6D] flex items-center justify-center gap-2">
              <Lock className="w-3 h-3 text-[#8C5832]" />
              <span>Certified under General Financial Rules (GFR) 2017 Rules 144 & 173</span>
            </div>
          </div>
        </div>
      </main>

      {/* Enterprise System Footer */}
      <footer className="border-t border-[#E8E0D4] bg-[#FAF7F2] py-3 px-6 text-center text-xs text-[#7A6B5D]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div>National Informatics Centre (NIC) • Ministry of Finance</div>
          <div className="text-[#8C6B52] font-mono">CPPP E-Procurement Portal v3.4.1 (2026 Release)</div>
        </div>
      </footer>
    </div>
  );
};
