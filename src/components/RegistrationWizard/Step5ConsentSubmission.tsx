import React from 'react';
import { BloodGroup, DonationTypePreference } from '../../types';
import { ShieldCheck, Check, Calendar, Clock, User, Phone, Droplet, AlertTriangle } from 'lucide-react';

interface Step5Props {
  data: {
    fullName: string;
    mobileNumber: string;
    bloodGroup: BloodGroup;
    donationType: DonationTypePreference;
    preferredDate: string;
    preferredTimeSlot: string;
    consentAccurateInfo: boolean;
    consentPreliminaryOnly: boolean;
    consentContactByFamily: boolean;
  };
  screeningRequiresReview: boolean;
  screeningReviewNotes: string[];
  onChange: (updates: Partial<Step5Props['data']>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export const Step5ConsentSubmission: React.FC<Step5Props> = ({
  data,
  screeningRequiresReview,
  screeningReviewNotes,
  onChange,
  onSubmit,
  isSubmitting,
  errors,
}) => {
  const allConsentsChecked =
    data.consentAccurateInfo && data.consentPreliminaryOnly && data.consentContactByFamily;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          5. Consent & Submission
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Please review your donation registration summary and confirm the required consents.
        </p>
      </div>

      {/* Summary Review Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Registration Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-900">{data.fullName || '—'}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{data.mobileNumber || '—'}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Droplet className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Blood Group: <strong className="text-slate-900">{data.bloodGroup}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Donation: <strong className="text-slate-900">{data.donationType}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Preferred Date: <strong className="text-slate-900">{data.preferredDate || 'Not selected'}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Time Window: <strong className="text-slate-900">{data.preferredTimeSlot || 'Not selected'}</strong></span>
          </div>
        </div>

        {screeningRequiresReview && (
          <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Status: Requires Family & Hospital Blood Bank Review</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your registration will be queued for coordinator verification before an appointment is confirmed with the hospital blood bank.
            </p>
          </div>
        )}
      </div>

      {/* Mandatory Consents Section */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Required Consents & Acknowledgments
        </h3>

        {/* Checkbox 1 */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={data.consentAccurateInfo}
            onChange={(e) => onChange({ consentAccurateInfo: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
          />
          <span className="text-xs text-slate-800 leading-relaxed font-medium select-none">
            “I confirm that the information I have provided is accurate to the best of my knowledge.”
          </span>
        </label>

        {/* Checkbox 2 */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={data.consentPreliminaryOnly}
            onChange={(e) => onChange({ consentPreliminaryOnly: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
          />
          <span className="text-xs text-slate-800 leading-relaxed font-medium select-none">
            “I understand that these questions are only preliminary screening and that the hospital blood bank will determine my final eligibility.”
          </span>
        </label>

        {/* Checkbox 3 */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={data.consentContactByFamily}
            onChange={(e) => onChange({ consentContactByFamily: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
          />
          <span className="text-xs text-slate-800 leading-relaxed font-medium select-none">
            “I agree to be contacted by the family about this donation request and understand how my information will be used for donation coordination.”
          </span>
        </label>

        {errors.consents && (
          <p className="text-xs text-rose-600 font-semibold pt-1">{errors.consents}</p>
        )}
      </div>

      {/* Prominent Action Button: Register My Availability */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !allConsentsChecked}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            allConsentsChecked && !isSubmitting
              ? 'bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white shadow-rose-600/25'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <span>Recording Registration...</span>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Register My Availability</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-slate-500 mt-2">
          Your information will be securely recorded for authorized coordinator review only.
        </p>
      </div>
    </div>
  );
};
