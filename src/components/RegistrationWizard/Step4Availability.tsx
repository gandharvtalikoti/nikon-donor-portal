import React from 'react';
import { CoordinationConfig, DonationBooking, DonationTypePreference } from '../../types';
import { Calendar, Clock, AlertCircle, Info, ShieldAlert, Sparkles, Droplet, Layers } from 'lucide-react';
import { checkDuplicateBooking } from '../../lib/coordinationEngine';

interface Step4Props {
  config: CoordinationConfig;
  donationType: DonationTypePreference;
  mobileNumber: string;
  existingBookings: DonationBooking[];
  data: {
    preferredDate: string;
    preferredTimeSlot: string;
    availabilityNote?: string;
  };
  screeningResult: {
    isIntervalConflict: boolean;
    intervalConflictMessage?: string;
    earliestEligibleDate?: string;
  };
  onChange: (updates: Partial<Step4Props['data']>) => void;
  errors: Record<string, string>;
}

export const Step4Availability: React.FC<Step4Props> = ({
  config,
  donationType,
  mobileNumber,
  existingBookings,
  data,
  screeningResult,
  onChange,
  errors,
}) => {
  // Compute minimum and maximum selectable dates
  const today = new Date();
  const minDateObj = new Date(today);
  minDateObj.setDate(minDateObj.getDate() + (config.planningWindowDaysMin || 0));
  const minDateStr = minDateObj.toISOString().split('T')[0];

  const maxDateObj = new Date(today);
  maxDateObj.setDate(maxDateObj.getDate() + (config.planningWindowDaysMax || 45));
  const maxDateStr = maxDateObj.toISOString().split('T')[0];

  // Check for duplicate active booking
  const duplicateCheck = checkDuplicateBooking(mobileNumber, existingBookings);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          4. Date & Time Availability
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          When are you available to donate?
        </p>
      </div>

      {/* Required Note from brief */}
      <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-start gap-3 text-xs text-rose-950 leading-relaxed">
        <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <p>
          “Please choose a date and time when you are genuinely available. Our family will contact you to confirm the current requirement and appointment before you visit.”
        </p>
      </div>

      {/* Duplicate Booking Warning if active booking already exists */}
      {duplicateCheck.hasActiveBooking && duplicateCheck.activeBooking && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-950">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Active Booking Already on Record</h4>
            <p className="leading-relaxed">
              Our records show an active booking for this phone number on{' '}
              <strong>{duplicateCheck.activeBooking.bookingDate}</strong> (
              {duplicateCheck.activeBooking.timeSlot}) with status: "
              <strong>{duplicateCheck.activeBooking.bookingStatus}</strong>".
            </p>
            <p className="text-[11px] text-amber-800 pt-1">
              * To ensure fair apheresis machine availability and patient safety, a donor may hold only one active appointment at a time. If you wish to reschedule or cancel your previous booking, please contact the family coordinator helpline.
            </p>
          </div>
        </div>
      )}

      {/* Interval Conflict Warning if earlier than minimum gap */}
      {screeningResult.isIntervalConflict && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-950">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Donation Interval Notice</h4>
            <p className="leading-relaxed">
              “Thank you for volunteering. Based on the donation date recorded in your registration, your next donation may need to be scheduled later. Our family will verify the applicable interval with the hospital blood bank before confirming an appointment.”
            </p>
            {screeningResult.earliestEligibleDate && (
              <p className="text-xs font-semibold text-rose-800">
                Recommended earliest date according to preliminary rules: {screeningResult.earliestEligibleDate}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Donation Type Confirmation */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {donationType === 'Single Donor Platelets (SDP)' ? (
            <Sparkles className="w-4 h-4 text-rose-600" />
          ) : donationType === 'Whole blood' ? (
            <Droplet className="w-4 h-4 text-rose-600" />
          ) : (
            <Layers className="w-4 h-4 text-rose-600" />
          )}
          <span className="text-slate-600 font-medium">Selected Donation:</span>
          <span className="font-bold text-slate-900">{donationType}</span>
        </div>
        <span className="text-[11px] text-slate-500">1 date & 1 time slot</span>
      </div>

      {/* Date Picker */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-baseline justify-between">
          <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Preferred Donation Date <span className="text-rose-600">*</span>
          </label>
          <span className="text-[11px] text-slate-500">Planning window: Next 45 days</span>
        </div>

        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Calendar className="w-4 h-4" />
          </div>
          <input
            type="date"
            required
            min={minDateStr}
            max={maxDateStr}
            value={data.preferredDate}
            onChange={(e) => onChange({ preferredDate: e.target.value })}
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${
              errors.preferredDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
            }`}
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Available between {minDateStr} and {maxDateStr}.
        </p>
        {errors.preferredDate && <p className="text-xs text-rose-600 font-medium">{errors.preferredDate}</p>}
      </div>

      {/* Time Slot Picker (Predefined by Admin) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-baseline justify-between">
          <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Preferred Time Slot <span className="text-rose-600">*</span>
          </label>
          <span className="text-[11px] text-slate-500">Preferred window, not guaranteed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {config.timeSlots.map((slot) => {
            const isSelected = data.preferredTimeSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onChange({ preferredTimeSlot: slot })}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-rose-600 bg-rose-600 text-white shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{slot}</span>
                </span>
                {isSelected && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md">Selected</span>}
              </button>
            );
          })}
        </div>
        {errors.preferredTimeSlot && <p className="text-xs text-rose-600 font-medium">{errors.preferredTimeSlot}</p>}
      </div>

      {/* Optional Availability Note */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
        <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
          Availability Note (Optional)
        </label>
        <textarea
          rows={2}
          value={data.availabilityNote || ''}
          onChange={(e) => onChange({ availabilityNote: e.target.value })}
          placeholder="e.g. Can arrive 15 minutes before slot or come after 2 PM if morning is full"
          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500"
        />
      </div>
    </div>
  );
};
