import React from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Building, 
  FolderArchive, 
  Binary, 
  ShieldCheck, 
  FileBarChart, 
  History,
  ListFilter,
  GitBranch,
  Layers,
  FileDiff,
  Scale,
  FolderKanban,
  Sliders,
  BookOpen,
  Settings,
  Sparkles,
  Users,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  HelpCircle,
  Clock,
  Building2,
  FileCheck,
  Send
} from 'lucide-react';

export type NavTabId = 
  // Admin
  | 'admin-control'
  | 'admin-users'
  | 'admin-roles'
  | 'admin-settings'
  | 'repository'
  | 'audit'
  // Procurement Officer
  | 'procurement-dashboard'
  | 'tender-create'
  | 'tenders'
  | 'received-applications'
  | 'ai-shortlist'
  | 'reports'
  // Verification Officer
  | 'review-queue'
  | 'documents'
  | 'compliance'
  | 'cross-validation'
  | 'clarification-mgmt'
  | 'evidence-trace'
  // Company / Bidder
  | 'company-tenders'
  | 'company-recommended'
  | 'company-applications'
  | 'company-eligibility'
  | 'company-checklist'
  | 'company-vault'
  | 'company-clarifications'
  | 'company-status'
  | 'company-profile'
  // Existing tabs preserved
  | 'dashboard'
  | 'compliance-dashboard'
  | 'case-workspace'
  | 'bidder-comparison'
  | 'doc-versions'
  | 'what-if'
  | 'knowledge-memory'
  | 'bidders'
  | 'ai-analysis';

interface NavigationProps {
  currentTab: NavTabId;
  currentUser: UserProfile;
  onTabChange: (tab: NavTabId) => void;
  badgeCounts?: {
    tenders?: number;
    bidders?: number;
    documents?: number;
    pendingReviews?: number;
    reviewQueueCount?: number;
    mismatchesCount?: number;
    applicationsCount?: number;
    clarificationsCount?: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  currentUser,
  onTabChange,
  badgeCounts,
}) => {
  // Define strict role-based tabs according to specifications
  const getTabsForRole = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return [
          { id: 'admin-control', label: 'System Overview', icon: LayoutDashboard, tag: 'Admin' },
          { id: 'admin-users', label: 'Users & Permissions', icon: Users, tag: 'Admin' },
          { id: 'repository', label: 'Document Repository', icon: FolderArchive, tag: 'Security' },
          { id: 'audit', label: 'Audit Logs', icon: History, tag: 'Forensic' },
          { id: 'admin-settings', label: 'System Settings', icon: Settings, tag: 'Config' },
        ];

      case 'Procurement Officer':
        return [
          { id: 'procurement-dashboard', label: 'Tender Dashboard', icon: LayoutDashboard, tag: 'Overview' },
          { id: 'tender-create', label: 'Create / Draft Tender', icon: Plus, tag: 'AI Assist' },
          { id: 'tenders', label: 'Manage Tenders', icon: FileSpreadsheet, badge: badgeCounts?.tenders },
          { id: 'received-applications', label: 'Received Applications', icon: Building, badge: badgeCounts?.applicationsCount },
          { id: 'ai-shortlist', label: 'AI Shortlist Recommendations', icon: Sparkles, tag: 'Top 5', highlight: true },
          { id: 'reports', label: 'Bid Reports', icon: FileBarChart },
        ];

      case 'Verification Officer':
        return [
          { 
            id: 'review-queue', 
            label: 'Pending Verification', 
            icon: ListFilter, 
            badge: badgeCounts?.reviewQueueCount, 
            highlight: true,
            tag: 'Action Required'
          },
          { id: 'documents', label: 'Document Verification', icon: Binary, badge: badgeCounts?.documents },
          { id: 'compliance', label: 'Compliance Review', icon: ShieldCheck },
          { 
            id: 'cross-validation', 
            label: 'Discrepancies', 
            icon: Layers, 
            badge: badgeCounts?.mismatchesCount,
            tag: 'Audit' 
          },
          { id: 'clarification-mgmt', label: 'Clarification Requests', icon: HelpCircle, badge: badgeCounts?.clarificationsCount },
          { id: 'evidence-trace', label: 'Evidence Review', icon: GitBranch },
          { id: 'audit', label: 'Audit History', icon: History },
        ];

      case 'Company / Bidder':
        return [
          { id: 'company-tenders', label: 'Tender Discovery', icon: Search, tag: 'Browse' },
          { id: 'company-recommended', label: 'Recommended Tenders', icon: Sparkles, tag: 'Matched' },
          { id: 'company-applications', label: 'My Applications', icon: FileText, badge: badgeCounts?.applicationsCount },
          { id: 'company-eligibility', label: 'Eligibility Check', icon: CheckCircle2, tag: 'AI Tool' },
          { id: 'company-checklist', label: 'Required Documents', icon: FileCheck, tag: 'Checklist' },
          { id: 'company-vault', label: 'Document Vault', icon: FolderArchive, tag: 'Reusable' },
          { id: 'company-clarifications', label: 'Clarifications', icon: HelpCircle, badge: badgeCounts?.clarificationsCount, highlight: true },
          { id: 'company-profile', label: 'Company Profile', icon: Building2 },
        ];

      default:
        return [
          { id: 'compliance-dashboard', label: 'Compliance Overview', icon: LayoutDashboard },
          { id: 'tenders', label: 'Tenders', icon: FileSpreadsheet },
          { id: 'reports', label: 'Reports', icon: FileBarChart },
        ];
    }
  };

  const roleTabs = getTabsForRole(currentUser.role);

  return (
    <nav className="bg-[#FAF7F2] border-b border-[#E8E0D4] px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 py-1">
        {/* Scrollable Role-specific Tab Strip */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {roleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as NavTabId)}
                className={`group relative flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#8C5832] text-[#3D2513] font-semibold bg-[#F2EDE4]/60'
                    : 'border-transparent text-[#6D5F52] hover:text-[#2E231C] hover:bg-[#F4EFE7]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-[#8C5832]' : 'text-[#8E8073] group-hover:text-[#423225]'}`} />
                <span>{tab.label}</span>
                {tab.tag && (
                  <span className="text-[9px] px-1 py-0.1 rounded font-semibold uppercase tracking-wider bg-[#EFE8DD] text-[#715038] border border-[#DDD3C4]">
                    {tab.tag}
                  </span>
                )}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                      tab.highlight
                        ? 'bg-[#FDF1EF] text-[#932F27] border border-[#F2C9C5]'
                        : 'bg-[#E8DFD3] text-[#523B28]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Scope / Role Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#7A6B5D] shrink-0 border-l border-[#E2D8C8] pl-3">
          <span className="font-semibold text-[#8C6B52] uppercase tracking-wider text-[10px]">
            Portal Access:
          </span>
          <span className="font-bold text-[#3D2513]">
            {currentUser.role}
          </span>
        </div>
      </div>
    </nav>
  );
};
