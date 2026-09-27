import React from 'react';
import { 
  FileText, 
  Sparkles, 
  ListChecks, 
  Building2, 
  UploadCloud, 
  Cpu, 
  GitCompare, 
  ChevronRight,
  Layers,
  GitBranch,
  ListFilter,
  UserCheck,
  Scale,
  Sliders,
  FolderArchive,
  LayoutDashboard
} from 'lucide-react';

interface WorkflowBarProps {
  currentTab: string;
  onNavigate: (tab: string, extraState?: any) => void;
}

export const WorkflowBar: React.FC<WorkflowBarProps> = ({ currentTab, onNavigate }) => {
  const steps = [
    { id: 'tenders', label: '1. Tender Requirement', tab: 'tenders', icon: ListChecks },
    { id: 'documents', label: '2. Bidder Evidence', tab: 'documents', icon: UploadCloud },
    { id: 'compliance', label: '3. AI Verification', tab: 'compliance', icon: GitCompare },
    { id: 'cross-validation', label: '4. Cross-Doc Validation', tab: 'cross-validation', icon: Layers },
    { id: 'evidence-trace', label: '5. Evidence Chain', tab: 'evidence-trace', icon: GitBranch },
    { id: 'review-queue', label: '6. Review Queue', tab: 'review-queue', icon: ListFilter, highlight: true },
    { id: 'compliance-decision', label: '7. Officer Decision', tab: 'compliance', icon: UserCheck, highlight: true },
  ];

  const div3Shortcuts = [
    { id: 'comp-dash', label: 'Compliance Overview', tab: 'compliance-dashboard', icon: LayoutDashboard },
    { id: 'bid-comp', label: 'Bidder Compare', tab: 'bidder-comparison', icon: Scale },
    { id: 'what-if', label: 'What-If Sandbox', tab: 'what-if', icon: Sliders },
    { id: 'repo', label: 'Repository', tab: 'repository', icon: FolderArchive },
  ];

  return (
    <div className="bg-[#FAF7F2] border-b border-[#E6DDD0] py-2 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Verification Pipeline Steps */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="font-semibold text-[#825C3E] uppercase tracking-wider text-[10px] shrink-0 mr-1">
            Verification Pipeline:
          </span>
          <div className="flex items-center gap-1 min-w-max">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentTab === step.tab;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => onNavigate(step.tab)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                      isActive
                        ? 'bg-[#EADECE] text-[#3D2513] shadow-2xs font-semibold'
                        : 'text-[#6C5F54] hover:text-[#2C211A] hover:bg-[#F2ECE1]'
                    } ${step.highlight && !isActive ? 'border border-[#DFD1BF] bg-[#F5EEE2]' : ''}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#854F27]' : 'text-[#8D7F72]'}`} />
                    <span>{step.label}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-[#C8BCAC] shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Division 3 Quick Shortcuts */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar pt-1 md:pt-0 border-t md:border-t-0 border-[#EADECE]">
          <span className="text-[10px] font-semibold text-[#8C6B52] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#8C5832]" />
            <span>Div 3 Tools:</span>
          </span>
          {div3Shortcuts.map((sc) => {
            const Icon = sc.icon;
            const isActive = currentTab === sc.tab;
            return (
              <button
                key={sc.id}
                onClick={() => onNavigate(sc.tab)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[#8C5832] text-white border-[#8C5832]'
                    : 'bg-[#F2ECE1] text-[#553E2B] border-[#DFD1BF] hover:bg-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

