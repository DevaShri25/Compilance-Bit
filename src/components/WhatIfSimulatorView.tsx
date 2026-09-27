import React, { useState } from 'react';
import { 
  WhatIfScenarioItem, 
  Tender, 
  Bidder, 
  UserProfile, 
  ComplianceDetailedStatus 
} from '../types';
import { 
  Sparkles, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Scale, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface WhatIfSimulatorViewProps {
  whatIfItems: WhatIfScenarioItem[];
  tenders: Tender[];
  bidders: Bidder[];
  selectedTender: Tender;
  selectedBidder: Bidder;
  currentUser: UserProfile;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
  onNavigate: (tab: NavTabId, extraState?: any) => void;
  onLogAudit: (action: string, module: any, details: string) => void;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({
  whatIfItems: initialItems,
  tenders,
  bidders,
  selectedTender,
  selectedBidder,
  currentUser,
  onSelectTender,
  onSelectBidder,
  onNavigate,
  onLogAudit,
}) => {
  const [items, setItems] = useState<WhatIfScenarioItem[]>(initialItems);

  const toggleSimulate = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSimulated: !item.isSimulated } : item
      )
    );
  };

  const handleResetAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isSimulated: false })));
  };

  const activeSimulationsCount = items.filter((i) => i.isSimulated).length;

  // Compute hypothetical overall status
  const allSatisfiedAfter = items.every((i) =>
    i.isSimulated ? i.simulatedOutcome === 'Compliant' : i.currentOutcome === 'Compliant'
  );

  return (
    <div className="space-y-6">
      {/* Critical Mandatory Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#FFF8EB] border-2 border-[#E3B575] shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F8E3C0] text-[#8C5832] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-[#8C5832]" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#8C5832]">
              SIMULATION — NOT APPLIED TO ACTUAL EVALUATION
            </div>
            <div className="text-xs text-[#5C4533] mt-0.5">
              This sandbox allows committee officers to model hypothetical submissions and gap remedies. The official procurement record remains 100% unaltered.
            </div>
          </div>
        </div>

        {activeSimulationsCount > 0 && (
          <button
            onClick={handleResetAll}
            className="px-3 py-1.5 rounded-lg border border-[#D5C9B8] bg-white text-xs font-semibold text-[#4A3423] hover:bg-[#FAF6F0] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>
        )}
      </div>

      {/* Header and Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#8C6B52]">
              Division 3 • Decision Support Engine
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#553E2B] font-mono border border-[#E0D5C5]">
              Sandbox Mode
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#2C211A] tracking-tight mt-0.5">
            What-If Compliance Simulator
          </h2>
          <p className="text-xs text-[#736355]">
            Forecast how pending clarifications or supplementary certifications would impact bidder eligibility
          </p>
        </div>

        {/* Bidder Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A6B5D] font-medium">Model Bidder:</span>
          <select
            value={selectedBidder.id}
            onChange={(e) => {
              const b = bidders.find((item) => item.id === e.target.value);
              if (b) onSelectBidder(b);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#DDD3C4] text-[#2D231C] outline-none shadow-2xs max-w-[210px] truncate"
          >
            {bidders.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Before vs After Simulation Impact Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-[#DFD5C6] grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before Simulation */}
        <div className="p-4 rounded-xl bg-white border border-[#E6DDD0] space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6B52]">
            1. Current Official Evaluation State
          </div>
          <div className="text-xs font-semibold text-[#2D231C]">
            Overall Status: <span className="text-[#932F27]">Technically Disqualified / Deficits Noted</span>
          </div>
          <p className="text-[11px] text-[#7A6B5D]">
            Official state recorded on CPPP portal based on initial uploaded documents.
          </p>
        </div>

        {/* After Simulation */}
        <div
          className={`p-4 rounded-xl border space-y-2 transition-all ${
            activeSimulationsCount > 0
              ? 'bg-[#FAF5EE] border-[#8C5832]/40 shadow-xs'
              : 'bg-[#FAF8F5] border-[#E8E0D4]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6B52]">
              2. Simulated Hypothetical Outcome
            </span>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white border border-[#DDD3C4]">
              {activeSimulationsCount} Parameter(s) Modified
            </span>
          </div>
          <div className="text-xs font-semibold text-[#2D231C]">
            Hypothetical Standing:{' '}
            <span className={allSatisfiedAfter && activeSimulationsCount > 0 ? 'text-[#1E5732]' : 'text-[#8C5832]'}>
              {activeSimulationsCount === 0
                ? 'Toggle scenarios below to simulate'
                : allSatisfiedAfter
                ? '✓ 100% Meets Technical Requirements'
                : 'Partial Compliance (Further evidence needed)'}
            </span>
          </div>
          <p className="text-[11px] text-[#7A6B5D]">
            Simulated result will vanish upon leaving this sandbox. No official records are altered.
          </p>
        </div>
      </div>

      {/* Scenario Items (As specified in prompt: Current State -> Hypothetical Change -> Before -> After Simulation) */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider">
          Hypothetical Parameter Scenarios
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className={`glass-card rounded-2xl p-5 border transition-all ${
              item.isSimulated
                ? 'border-[#8C5832] bg-white ring-1 ring-[#8C5832]/20 shadow-sm'
                : 'border-[#E6DDD0] bg-white/90 shadow-2xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EAE0] gap-3">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#8C6B52]">
                  {item.requirementId}
                </span>
                <h4 className="text-xs font-semibold text-[#2D231C]">
                  {item.requirementTitle}
                </h4>
              </div>

              {/* Simulation Toggle Switch */}
              <button
                onClick={() => toggleSimulate(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  item.isSimulated
                    ? 'bg-[#8C5832] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] border border-[#D5C9B8] text-[#554233] hover:bg-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{item.isSimulated ? 'Simulation Active' : 'Apply Hypothetical Change'}</span>
              </button>
            </div>

            {/* Current State vs Hypothetical Change Grid */}
            <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Current State */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE5DA] space-y-1">
                <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                  Current State
                </div>
                <div className="font-semibold text-[#2D231C] text-xs">
                  {item.currentState}
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] text-[#7A6B5D]">Before:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FDF1EF] text-[#932F27] border border-[#F2C9C5]">
                    {item.currentOutcome}
                  </span>
                </div>
              </div>

              {/* Hypothetical Change */}
              <div
                className={`p-3.5 rounded-xl border space-y-1 ${
                  item.isSimulated
                    ? 'bg-[#FAF5EE] border-[#8C5832]/50'
                    : 'bg-[#FAF8F5] border-[#EDE5DA]'
                }`}
              >
                <div className="text-[10px] font-semibold uppercase text-[#8C6B52]">
                  Hypothetical Change (Simulated)
                </div>
                <div className="font-semibold text-[#2D231C] text-xs">
                  {item.hypotheticalChange}
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] text-[#7A6B5D]">After Simulation:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      item.isSimulated
                        ? 'bg-[#EEF6F0] text-[#1E5732] border-[#C4DFC8]'
                        : 'bg-[#FAF5EE] text-[#7A6B5D] border-[#E2D8C8]'
                    }`}
                  >
                    {item.isSimulated
                      ? `✓ ${item.simulatedOutcome} (Requirement Satisfied)`
                      : 'Pending Simulation Toggle'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-[#6E5D4F] italic bg-[#FAF8F5] p-2 rounded-lg border border-[#EDE5DA]">
              <strong>Simulation Rationale:</strong> {item.notes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
