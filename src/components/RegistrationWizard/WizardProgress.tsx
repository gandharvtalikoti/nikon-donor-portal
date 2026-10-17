import React from 'react';
import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { number: 1, title: 'Personal Details', short: 'Personal' },
  { number: 2, title: 'Donation Type', short: 'Donation' },
  { number: 3, title: 'Eligibility Screening', short: 'Screening' },
  { number: 4, title: 'Date & Time', short: 'Availability' },
  { number: 5, title: 'Consent & Submit', short: 'Consent' },
];

export const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full mb-6">
      {/* Mobile progress bar */}
      <div className="sm:hidden mb-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span className="text-rose-700">Step {currentStep} of {STEPS.length}</span>
          <span className="text-slate-900 font-bold">{STEPS[currentStep - 1]?.title}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-600 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop & tablet stepped indicator */}
      <div className="hidden sm:grid grid-cols-5 gap-2">
        {STEPS.map((step) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <button
              key={step.number}
              type="button"
              disabled={step.number > currentStep}
              onClick={() => onStepClick && step.number < currentStep && onStepClick(step.number)}
              className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                isActive
                  ? 'border-rose-600 bg-rose-50/50 text-slate-900 shadow-2xs'
                  : isCompleted
                  ? 'border-emerald-200 bg-white text-slate-700 hover:border-slate-300 cursor-pointer'
                  : 'border-slate-200 bg-white/60 text-slate-400 cursor-not-allowed opacity-80'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isActive
                      ? 'bg-rose-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.number}
                </span>
                <span className="font-semibold truncate">
                  {step.short}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden md:block">
                {step.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
