import React from 'react';
import { DonationTypePreference } from '../../types';
import { Droplet, Sparkles, Layers, Info, Clock, CheckCircle2 } from 'lucide-react';

interface Step2Props {
  value: DonationTypePreference;
  onChange: (val: DonationTypePreference) => void;
}

export const Step2DonationType: React.FC<Step2Props> = ({ value, onChange }) => {
  const options: {
    id: DonationTypePreference;
    title: string;
    badge: string;
    desc: string;
    icon: typeof Droplet;
    duration: string;
    details: string;
  }[] = [
    {
      id: 'Single Donor Platelets (SDP)',
      title: 'Single Donor Platelets (SDP)',
      badge: 'High Priority for Nikon',
      desc: 'Collected via an apheresis machine that draws blood, separates platelets, and returns red blood cells.',
      icon: Sparkles,
      duration: 'Approx. 60–90 minutes',
      details: 'Critical for stopping bleeding and supporting platelet counts during cancer/chemotherapy treatments.',
    },
    {
      id: 'Whole blood',
      title: 'Whole blood',
      badge: 'Standard Donation',
      desc: 'Standard voluntary donation of red blood cells, plasma, and platelets in a single bag.',
      icon: Droplet,
      duration: 'Approx. 10–15 minutes (45 min total visit)',
      details: 'Helps maintain vital red cell reserves and whole blood supply for emergency transfusions.',
    },
    {
      id: 'Either, depending on the current medical requirement',
      title: 'Either, depending on medical requirement',
      badge: 'Most Flexible',
      desc: 'Willing to donate either SDP or Whole Blood depending on Nikon’s daily hospital requirement.',
      icon: Layers,
      duration: 'Determined at blood bank screening',
      details: 'Allows the treating team to assign you to whichever machine or unit is in highest deficit on that day.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">2. Donation Type</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          What would you be willing to donate?
        </p>
      </div>

      {/* Required explanation callout from brief */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          “Your preferred donation type helps us coordinate with the hospital. The treating team's current requirement and the hospital blood bank's assessment will determine whether your donation is suitable.”
        </p>
      </div>

      {/* Option cards */}
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-rose-600 bg-rose-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{opt.title}</span>
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{opt.desc}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{opt.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 mt-0.5">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-rose-600" />}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-rose-200/60 text-xs text-rose-950/80 bg-rose-100/30 -mx-4 -mb-4 p-3 rounded-b-2xl">
                  <span className="font-semibold">Note for next step: </span>
                  {opt.id === 'Single Donor Platelets (SDP)' &&
                    'We will ask specific SDP eligibility questions (e.g. 10-day donation interval and platelet count prep).'}
                  {opt.id === 'Whole blood' &&
                    'We will ask whole-blood questions (e.g. 3-month donation interval and haemoglobin guidance).'}
                  {opt.id.includes('Either') &&
                    'We will check preliminary eligibility for both SDP and Whole Blood intervals.'}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
