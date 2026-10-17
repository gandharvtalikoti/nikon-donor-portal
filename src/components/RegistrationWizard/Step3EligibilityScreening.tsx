import React from 'react';
import {
  AgeCategory,
  CoordinationConfig,
  DonationTypePreference,
  FeelingWellOption,
  FoodHydrationOption,
  LastSdpOption,
  LastWholeBloodOption,
  TattooOption,
  WeightRange,
  YesNoUnsure,
} from '../../types';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  HelpCircle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { evaluateEligibility, getAgeCategory } from '../../lib/coordinationEngine';

interface Step3Props {
  donationType: DonationTypePreference;
  config: CoordinationConfig;
  data: {
    ageYears: number | null;
    ageCategory: AgeCategory;
    weightRange: WeightRange;
    feelsWellToday: FeelingWellOption;
    foodAndHydration: FoodHydrationOption;
    lastWholeBloodOption: LastWholeBloodOption;
    lastWholeBloodDate?: string;
    lastSdpOption: LastSdpOption;
    lastSdpDate?: string;
    otherDonationOrDeferral: YesNoUnsure;
    otherDonationOrDeferralNote?: string;
    tattooPiercing: TattooOption;
    tattooDate?: string;
    feverInfection: YesNoUnsure;
    medicationTreatment: YesNoUnsure;
    surgeryTransfusion: YesNoUnsure;
    travelInfection: YesNoUnsure;
    preferredDate: string;
  };
  onChange: (updates: Partial<Step3Props['data']>) => void;
  errors: Record<string, string>;
}

export const Step3EligibilityScreening: React.FC<Step3Props> = ({
  donationType,
  config,
  data,
  onChange,
  errors,
}) => {
  const showWholeBloodQuestions = donationType === 'Whole blood' || donationType.includes('Either');
  const showSdpQuestions = donationType === 'Single Donor Platelets (SDP)' || donationType.includes('Either');

  // Compute live screening results for immediate, transparent feedback
  const screening = evaluateEligibility(
    {
      ...data,
      donationType,
    },
    config
  );

  const handleAgeChange = (valStr: string) => {
    if (!valStr) {
      onChange({ ageYears: null, ageCategory: '18–59' });
      return;
    }
    const num = parseInt(valStr, 10);
    const cat = getAgeCategory(num);
    onChange({ ageYears: isNaN(num) ? null : num, ageCategory: cat });
  };

  return (
    <div className="space-y-8">
      {/* Required Header and Subtitle from brief */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Donor Eligibility & Safety Check
        </h2>
        <div className="mt-2 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            “Please answer these questions honestly. These questions help us coordinate suitable donors, but completing this form does not mean you are medically cleared to donate. The hospital blood bank will make the final decision.”
          </p>
        </div>
      </div>

      {/* SECTION A: Basic Eligibility */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            A
          </span>
          <h3 className="text-base font-bold text-slate-900">Basic Eligibility</h3>
        </div>

        {/* Q1: Age */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
            1. What is your age in completed years? <span className="text-rose-600">*</span>
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-32">
              <input
                type="number"
                min={16}
                max={80}
                required
                value={data.ageYears !== null && data.ageYears !== undefined ? data.ageYears : ''}
                onChange={(e) => handleAgeChange(e.target.value)}
                placeholder="e.g. 28"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 font-bold ${
                  errors.ageYears ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['Below 18', '18–59', '60 or above'] as AgeCategory[]).map((cat) => {
                const isActive = data.ageCategory === cat && data.ageYears !== null;
                return (
                  <span
                    key={cat}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                      isActive
                        ? cat === '18–59'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {cat}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Age ranges are an initial screening aid only. We do not automatically approve or reject solely based on these ranges; the hospital blood bank must confirm the applicable age criteria.
          </p>
          {errors.ageYears && <p className="text-xs text-rose-600 font-medium">{errors.ageYears}</p>}
        </div>

        {/* Q2: Body weight */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
              2. What is your current body weight? <span className="text-rose-600">*</span>
            </label>
            <span className="text-[11px] font-semibold text-rose-700">
              Family preliminary target: {config.preliminaryWeightThresholdKg} kg+
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Below 45 kg', '45–49 kg', '50–59 kg', '60 kg or above'] as WeightRange[]).map((w) => {
              const isSelected = data.weightRange === w;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => onChange({ weightRange: w })}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                    isSelected
                      ? 'border-rose-600 bg-rose-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 space-y-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <p>
              <strong>Hospital Context:</strong> The family requests a preliminary threshold of {config.preliminaryWeightThresholdKg} kg or above to optimize platelet yields for SDP. This is subject to the hospital’s current criteria and is not a universal medical barrier for every donation type.
            </p>
          </div>
        </div>

        {/* Q3: Feeling well today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
            3. Are you feeling well today? <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(
              [
                'Yes, I feel well',
                'No, I am currently unwell',
                'I am unsure whether I am fit to donate',
              ] as FeelingWellOption[]
            ).map((opt) => {
              const isSelected = data.feelsWellToday === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ feelsWellToday: opt })}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/60 text-slate-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Q4: Food & Hydration */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
            4. Have you eaten a proper meal and had enough fluids today? <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['Yes', 'Not yet', 'I am unable to do so'] as FoodHydrationOption[]).map((opt) => {
              const isSelected = data.foodAndHydration === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ foodAndHydration: opt })}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/60 text-slate-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-blue-900 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/80 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Pre-donation reminder:</strong> Please ensure you eat a nutritious, non-greasy meal and drink 500ml+ of water or fluids 2–3 hours before your blood bank visit.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION B: Previous donations and intervals */}
      <div className="space-y-6 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            B
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Previous Donations & Intervals
            </h3>
            <p className="text-xs text-slate-500">
              {showWholeBloodQuestions && showSdpQuestions
                ? 'Showing questions for both Whole Blood and SDP'
                : showSdpQuestions
                ? 'Showing SDP specific interval questions'
                : 'Showing Whole Blood specific interval questions'}
            </p>
          </div>
        </div>

        {/* Q5: Whole-blood donation */}
        {showWholeBloodQuestions && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
              5. When was your last whole-blood donation? <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  'Never donated before',
                  'Within the last 3 months',
                  '3 months or more ago',
                  'I do not remember the exact date',
                ] as LastWholeBloodOption[]
              ).map((opt) => {
                const isSelected = data.lastWholeBloodOption === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange({ lastWholeBloodOption: opt })}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/60 text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Optional date picker */}
            {data.lastWholeBloodOption !== 'Never donated before' && (
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Exact or approximate date of last whole-blood donation (if known):
                </label>
                <div className="relative max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="date"
                    value={data.lastWholeBloodDate || ''}
                    onChange={(e) => onChange({ lastWholeBloodDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              “Our preliminary coordination rule is a minimum 3-month gap between whole-blood donations. The hospital blood bank must confirm your eligibility and the applicable interval before accepting your donation.”
            </div>
          </div>
        )}

        {/* Q6: SDP donation */}
        {showSdpQuestions && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
              6. When was your last SDP (platelet) donation? <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  'Never donated SDP before',
                  'Within the last 10 days',
                  '10 days or more ago',
                  'I do not remember the exact date',
                ] as LastSdpOption[]
              ).map((opt) => {
                const isSelected = data.lastSdpOption === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange({ lastSdpOption: opt })}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/60 text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Optional date picker */}
            {data.lastSdpOption !== 'Never donated SDP before' && (
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Exact or approximate date of last SDP donation (if known):
                </label>
                <div className="relative max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="date"
                    value={data.lastSdpDate || ''}
                    onChange={(e) => onChange({ lastSdpDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              “Our preliminary coordination rule is a minimum 10-day gap between SDP donations. The hospital must confirm the applicable interval, platelet count requirements, and your eligibility before donation.”
            </div>
          </div>
        )}

        {/* Q7: Other blood component or deferral */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
            7. Have you donated any other blood component recently, or have you been deferred from donating by a blood bank? <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['No', 'Yes', 'Unsure'] as YesNoUnsure[]).map((ans) => {
              const isSelected = data.otherDonationOrDeferral === ans;
              return (
                <button
                  key={ans}
                  type="button"
                  onClick={() => onChange({ otherDonationOrDeferral: ans })}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/60 text-slate-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {ans}
                </button>
              );
            })}
          </div>

          {(data.otherDonationOrDeferral === 'Yes' || data.otherDonationOrDeferral === 'Unsure') && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Optional note for hospital coordinator to review (no sensitive medical details required):
              </label>
              <input
                type="text"
                value={data.otherDonationOrDeferralNote || ''}
                onChange={(e) => onChange({ otherDonationOrDeferralNote: e.target.value })}
                placeholder="e.g. Mild low hemoglobin deferral 2 months ago"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-rose-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION C: Recent tattoos, piercings and procedures */}
      <div className="space-y-6 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            C
          </span>
          <h3 className="text-base font-bold text-slate-900">
            Recent Tattoos, Piercings & Procedures
          </h3>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
            8. Have you had a tattoo, piercing, or similar skin-puncturing procedure recently? <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(
              [
                'No',
                'Yes, within the last 6 months',
                'Yes, 6 months or more ago',
                'Unsure',
              ] as TattooOption[]
            ).map((opt) => {
              const isSelected = data.tattooPiercing === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ tattooPiercing: opt })}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/60 text-slate-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {(data.tattooPiercing === 'Yes, within the last 6 months' ||
            data.tattooPiercing === 'Yes, 6 months or more ago') && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Optional approximate date of procedure:
              </label>
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <input
                  type="date"
                  value={data.tattooDate || ''}
                  onChange={(e) => onChange({ tattooDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            “Our preliminary checklist flags tattoos and piercings within the last 6 months for review. The hospital blood bank must confirm the current deferral rules based on the procedure and circumstances.”
          </div>
        </div>
      </div>

      {/* SECTION D: General Health Screening */}
      <div className="space-y-6 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            D
          </span>
          <h3 className="text-base font-bold text-slate-900">
            General Health Screening
          </h3>
        </div>

        {/* Q9 - Q12 */}
        {[
          {
            num: 9,
            field: 'feverInfection' as const,
            title: 'Do you currently have a fever, infection, or feel significantly unwell?',
            val: data.feverInfection,
          },
          {
            num: 10,
            field: 'medicationTreatment' as const,
            title: 'Are you currently taking medication or receiving medical treatment that you think could affect donation eligibility?',
            val: data.medicationTreatment,
          },
          {
            num: 11,
            field: 'surgeryTransfusion' as const,
            title: 'Have you recently undergone surgery, received a blood transfusion, or had a significant medical procedure?',
            val: data.surgeryTransfusion,
          },
          {
            num: 12,
            field: 'travelInfection' as const,
            title: 'Have you travelled recently to an area where malaria or another locally relevant infection is a concern?',
            val: data.travelInfection,
          },
        ].map((q) => {
          const isFlagged = q.val === 'Yes' || q.val === 'Unsure';

          return (
            <div key={q.num} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
                {q.num}. {q.title} <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['No', 'Yes', 'Unsure'] as YesNoUnsure[]).map((ans) => {
                  const isSelected = q.val === ans;
                  return (
                    <button
                      key={ans}
                      type="button"
                      onClick={() => onChange({ [q.field]: ans })}
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/60 text-slate-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {ans}
                    </button>
                  );
                })}
              </div>

              {isFlagged && (
                <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    “Please discuss this with the hospital blood bank before donating. This answer does not automatically determine your eligibility.”
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Real-time Preliminary Screening Status Summary */}
      <div
        className={`p-4 rounded-2xl border ${
          screening.requiresReview
            ? 'bg-amber-50/50 border-amber-200'
            : 'bg-emerald-50/50 border-emerald-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {screening.requiresReview ? (
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900">
                Preliminary Screening Status:
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  screening.requiresReview
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {screening.reviewStatus}
              </span>
            </div>

            {screening.requiresReview ? (
              <div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {screening.isIntervalConflict
                    ? screening.intervalConflictMessage ||
                      'Based on your recorded answers, your next donation may need to be scheduled later. Our family will verify the applicable interval with the hospital blood bank before confirming.'
                    : 'One or more of your responses requires review by the family coordinator and hospital blood bank. You may still proceed to choose your availability, and we will verify the criteria before scheduling.'}
                </p>
                {screening.notes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[11px] text-amber-800 list-disc list-inside">
                    {screening.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-xs text-emerald-900 leading-relaxed">
                Preliminary answers align with standard voluntary donation parameters. Final medical clearance will be confirmed on-site by the hospital blood bank medical officer.
              </p>
            )}

            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              * Note: In compliance with medical guidelines, the system never marks any donor as "Approved to donate" or "Medically cleared" based solely on form inputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
