import React, { useEffect } from 'react';
import { BloodGroup, DonationTypePreference } from '../../types';
import { Droplet, Sparkles, Layers, Info, Clock, CheckCircle2, AlertTriangle, Lock, Check } from 'lucide-react';

interface Step2Props {
  value: DonationTypePreference;
  bloodGroup: BloodGroup;
  onChange: (val: DonationTypePreference) => void;
}

export const Step2DonationType: React.FC<Step2Props> = ({ value, bloodGroup, onChange }) => {
  const isAplus = bloodGroup === 'A+';

  // If donor is not A+ and has Whole Blood selected, auto-switch to SDP
  useEffect(() => {
    if (!isAplus && (value === 'Whole blood' || value.includes('Either'))) {
      onChange('Single Donor Platelets (SDP)');
    }
  }, [isAplus, value, onChange]);

  const options: {
    id: DonationTypePreference;
    title: string;
    badge: string;
    badgeColor: string;
    desc: string;
    icon: typeof Droplet;
    duration: string;
    details: string;
    isLocked?: boolean;
    lockReason?: string;
  }[] = [
    {
      id: 'Single Donor Platelets (SDP)',
      title: 'Single Donor Platelets (SDP)',
      badge: 'Any Blood Group is Fine',
      badgeColor: 'text-emerald-700 bg-emerald-100/90 border border-emerald-200',
      desc: 'Collected via an apheresis machine that separates platelets and returns red blood cells. Any blood group is fine and deeply needed for Nikon!',
      icon: Sparkles,
      duration: 'Approx. 60–90 minutes',
      details: 'Critical for stopping bleeding and supporting platelet counts during cancer/chemotherapy treatments.',
    },
    {
      id: 'Whole blood',
      title: 'Whole blood',
      badge: isAplus ? 'Matches Your A+ Group' : 'Mandatory A+ Only (Locked)',
      badgeColor: isAplus
        ? 'text-rose-700 bg-rose-100/90 border border-rose-200'
        : 'text-slate-600 bg-slate-100 border border-slate-200',
      desc: isAplus
        ? 'Standard voluntary donation of whole blood. Matches Nikon’s A+ blood requirement!'
        : `Nikon strictly requires A+ whole blood. Since your blood group is ${bloodGroup}, whole blood cannot be accepted for Nikon.`,
      icon: Droplet,
      duration: 'Approx. 10–15 minutes (45 min total visit)',
      details: 'Helps maintain vital red cell reserves. Must strictly match Nikon’s A+ blood type.',
      isLocked: !isAplus,
      lockReason: `Mandatory A+ only. Since your blood group is ${bloodGroup}, please choose Single Donor Platelets (SDP) where any blood group is fine!`,
    },
    {
      id: 'Either, depending on the current medical requirement',
      title: 'Either, depending on medical requirement',
      badge: isAplus ? 'Most Flexible' : 'SDP Assigned for Non-A+',
      badgeColor: isAplus
        ? 'text-amber-700 bg-amber-100/90 border border-amber-200'
        : 'text-slate-600 bg-slate-100 border border-slate-200',
      desc: isAplus
        ? 'Willing to donate either SDP or Whole Blood depending on Nikon’s daily hospital requirement.'
        : `Willing to help wherever needed. Since your group is ${bloodGroup} (not A+), you will be assigned to SDP (Platelets) where all blood groups are accepted.`,
      icon: Layers,
      duration: 'Determined at blood bank screening',
      details: 'Allows the treating team to assign you to whichever machine or unit is in highest deficit on that day.',
      isLocked: !isAplus,
      lockReason: `Whole blood requires mandatory A+. For ${bloodGroup}, only Single Donor Platelets (SDP) is eligible.`,
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

      {/* Blood group criteria callout */}
      <div className="p-3.5 bg-rose-50/80 border border-rose-200/90 rounded-xl text-xs text-rose-950 leading-relaxed flex items-start gap-3">
        <Droplet className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Important Blood Group Requirements for Nikon:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-900">
            <li>
              <strong>Whole Blood:</strong> Donor <u>must strictly be A+</u> (Nikon requires A+ whole blood).
            </li>
            <li>
              <strong>Single Donor Platelets (SDP):</strong> <u>Any blood group is fine</u> and deeply welcomed!
            </li>
          </ul>
        </div>
      </div>

      {/* Required explanation callout from brief */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          “Your preferred donation type helps us coordinate with the hospital. The treating team's current requirement and the hospital blood bank's assessment will determine whether your donation is suitable.”
        </p>
      </div>

      {/* Non-A+ warning if donor selected non-A+ in Step 1 */}
      {!isAplus && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your recorded blood group is <strong>{bloodGroup}</strong>. Since Nikon strictly needs <strong>A+</strong> for Whole Blood, please choose <strong>Single Donor Platelets (SDP)</strong>, where any blood group is suitable and deeply appreciated!
          </p>
        </div>
      )}

      {/* Option cards */}
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          const Icon = opt.icon;
          const isLocked = Boolean(opt.isLocked);

          return (
            <div
              key={opt.id}
              onClick={() => {
                if (isLocked) {
                  // Prevent selection and ensure SDP is selected
                  onChange('Single Donor Platelets (SDP)');
                  return;
                }
                onChange(opt.id);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all relative ${
                isLocked
                  ? 'border-slate-200 bg-slate-50/80 opacity-85 cursor-not-allowed'
                  : isSelected
                  ? 'border-rose-600 bg-rose-50/40 shadow-xs cursor-pointer'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isLocked
                        ? 'bg-slate-200 text-slate-500'
                        : isSelected
                        ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isLocked ? <Lock className="w-5 h-5 text-slate-500" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-bold text-sm sm:text-base ${isLocked ? 'text-slate-600' : 'text-slate-900'}`}>
                        {opt.title}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{opt.desc}</p>
                    
                    {isLocked && opt.lockReason && (
                      <div className="mt-2 text-[11px] font-semibold text-rose-800 bg-rose-50/90 border border-rose-200/80 p-2 rounded-lg flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{opt.lockReason}</span>
                      </div>
                    )}

                    {!isLocked && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{opt.duration}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 mt-0.5">
                  {isLocked ? (
                    <div className="w-5 h-5 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center text-slate-400">
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-rose-600" />}
                    </div>
                  )}
                </div>
              </div>

              {isSelected && !isLocked && (
                <div className="mt-3 pt-3 border-t border-rose-200/60 text-xs text-rose-950/80 bg-rose-100/30 -mx-4 -mb-4 p-3 rounded-b-2xl">
                  <span className="font-semibold">Note for next step: </span>
                  {opt.id === 'Single Donor Platelets (SDP)' &&
                    'We will ask specific SDP eligibility questions (e.g. 10-day donation interval and platelet count prep). Any blood group is fine!'}
                  {opt.id === 'Whole blood' &&
                    'We will ask whole-blood questions (e.g. 3-month donation interval). Note: A+ blood group is strictly mandatory for Nikon.'}
                  {opt.id.includes('Either') &&
                    'We will check preliminary eligibility for both SDP and Whole Blood intervals.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
