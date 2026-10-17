import React from 'react';
import { CheckCircle2, Phone, Calendar, Heart, Shield, ArrowRight } from 'lucide-react';
import { CoordinationConfig, DonationBooking, DonorRegistration } from '../../types';
import { formatDateDMY } from '../../lib/coordinationEngine';

interface RegistrationSuccessProps {
  registration: DonorRegistration;
  booking?: DonationBooking;
  config: CoordinationConfig;
  onReset: () => void;
  onViewDashboard?: () => void;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  registration,
  booking,
  config,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl mx-auto shadow-xs text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs shadow-emerald-600/20">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          Registration Recorded
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Thank you, {registration.fullName}!
        </h2>
      </div>

      {/* Required Text from Prompt */}
      <div className="p-4 sm:p-5 bg-rose-50/70 border border-rose-200/80 rounded-2xl text-left text-slate-800 text-sm leading-relaxed">
        <p className="font-medium text-slate-900">
          “Thank you for offering to help Nikon. Your registration has been recorded. Our family will review your availability and contact you to confirm the current requirement, donation type, and arrangements with the hospital. Please wait for confirmation before visiting.”
        </p>
      </div>

      {/* Record Reference Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <span className="text-slate-500 block">Registration Reference:</span>
          <span className="font-mono font-bold text-slate-900 text-sm">{registration.id}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Booking Reference:</span>
          <span className="font-mono font-bold text-slate-900 text-sm">{booking?.id || 'Pending Generation'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Requested Date & Time:</span>
          <span className="font-semibold text-slate-900">{formatDateDMY(registration.preferredDate)} ({registration.preferredTimeSlot})</span>
        </div>
        <div>
          <span className="text-slate-500 block">Screening Status:</span>
          <span className={`inline-block font-bold px-2 py-0.5 rounded-md text-[11px] ${
            registration.requiresReview ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
          }`}>
            {registration.eligibilityReviewStatus}
          </span>
        </div>
      </div>

      {/* What happens next */}
      <div className="text-left space-y-3 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Next Steps for Coordination
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-600" />
              <span>1. Family Call</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Our coordinator will contact you via {registration.preferredContact} to verify current medical needs.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <span>2. Slot Lock</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              We book the machine with Kidwai Memorial Institute of Oncology Hospital, Bangalore Blood Centre for the agreed window.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              <span>3. Blood Bank Test</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Final medical vitals and viral clearance are completed on-site before collection.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Submit Another Registration
        </button>
        <a
          href={`tel:${config.coordinatorContact.replace(/\D/g, '')}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Coordinator Helpline</span>
        </a>
      </div>
    </div>
  );
};
