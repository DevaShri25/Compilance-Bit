import React from 'react';
import { UserProfile, UserRole } from '../types';
import { ShieldCheck, UserCheck, Building2, ChevronDown, CheckCircle2, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  availableUsers,
  onSelectUser,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-[#4A3222] text-[#F9F6F0] border-[#382518]';
      case 'Procurement Officer':
        return 'bg-[#EAE0D2] text-[#55361D] border-[#D9CEBF]';
      case 'Verification Officer':
        return 'bg-[#E3EBE4] text-[#1E4D2B] border-[#CADACD]';
      case 'Company / Bidder':
        return 'bg-[#FAF5EE] text-[#8C5832] border-[#DFD3C2]';
      default:
        return 'bg-[#F2EDE4] text-[#553E2B] border-[#DDD3C4]';
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E6DDD0] bg-[#FAF8F5]/90 backdrop-blur-md px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Government Identification */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#3C2A1E] flex items-center justify-center text-[#F5EFE6] shadow-sm ring-1 ring-[#3C2A1E]/10">
            {currentUser.userType === 'Company / Bidder' ? (
              <Building2 className="w-5 h-5 text-[#E6CDA3]" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-[#E6CDA3]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#8C6B52]">
                {currentUser.userType === 'Company / Bidder' ? 'CPPP Bidder Portal' : 'Government of India • CPPP'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#EBF3EC] text-[#235832] font-medium border border-[#CFE4D3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D42] animate-pulse"></span>
                {currentUser.userType === 'Company / Bidder' ? 'Bidder Gateway Active' : 'AI Verification Active'}
              </span>
            </div>
            <h1 className="text-base font-semibold text-[#2D231C] tracking-tight">
              GovTender AI <span className="font-normal text-[#756557]">| {currentUser.userType === 'Company / Bidder' ? 'Corporate Bid Workspace' : 'Bid Verification & Human Review Engine'}</span>
            </h1>
          </div>
        </div>

        {/* Right Section: Role Switcher, User Profile & Logout */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#DDD3C4] bg-white/90 hover:bg-white text-left transition-all shadow-xs cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-[#F0EBE1] flex items-center justify-center text-[#4E3827]">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="leading-tight pr-1">
                <div className="text-xs font-semibold text-[#2E241D] flex items-center gap-1.5">
                  {currentUser.name}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-[#7A6B5D] truncate max-w-[180px]">
                  {currentUser.department}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8A7969] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown for Role Switching */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-[#DDD3C4] shadow-lg py-1.5 z-50">
                  <div className="px-3.5 py-2 border-b border-[#F0EBE1]">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7969]">
                      Switch Persona Context
                    </div>
                    <div className="text-xs text-[#736354]">
                      Dashboard views and permissions adapt to role
                    </div>
                  </div>
                  <div className="py-1">
                    {availableUsers.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSelectUser(user);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#F6F1E8]' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-[#7A4B27]" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-[#D5C9B8]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#2E241D] flex items-center justify-between">
                              <span className="truncate pr-1">{user.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium shrink-0 ${getRoleBadgeStyle(user.role)}`}>
                                {user.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#756557] truncate mt-0.5">
                              {user.department}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dedicated Sign Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out / Return to Login"
              className="px-2.5 py-1.5 rounded-lg border border-[#DDD3C4] bg-white/80 hover:bg-[#FDF1EF] text-[#932F27] hover:border-[#F2C9C5] text-xs font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
