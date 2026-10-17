import React, { useState } from 'react';
import { Heart, Phone, MapPin, AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { CoordinationConfig } from '../types';

interface DonorAppealBannerProps {
  config: CoordinationConfig;
}

export const DonorAppealBanner: React.FC<DonorAppealBannerProps> = ({ config }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50/40 border border-rose-200/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/20">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-rose-700 font-semibold uppercase tracking-wider mb-0.5">
              <span>Urgent Medical Coordination</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 font-normal normal-case">Bangalore</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Blood & Platelet (SDP) Coordination for {config.patientName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
              Nikon is undergoing critical medical treatment and requires scheduled Single Donor Platelets (SDP) and whole-blood reserves. We are coordinating voluntary donors in advance so the hospital apheresis team can plan collection without delays.
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <a
            href={`tel:${config.coordinatorContact.replace(/\D/g, '')}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Family Helpline: {config.coordinatorContact}</span>
          </a>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors"
          >
            {expanded ? 'Hide details' : 'Hospital & requirement details'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-rose-100/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
          <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Treating Blood Bank</span>
            </div>
            <p className="text-slate-600">{config.hospitalName}</p>
            <p className="text-slate-600 mt-0.5">{config.hospitalDepartment}</p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Current Priority Need</span>
            </div>
            <p className="text-slate-700 font-medium">Whole Blood: <strong className="text-rose-700">Mandatory A+ Only</strong></p>
            <p className="text-slate-600 mt-0.5">Single Donor Platelets (SDP): <strong className="text-emerald-700">Any Blood Group is fine</strong></p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Important Protocol</span>
            </div>
            <p className="text-slate-600">
              Please do not visit the hospital directly without coordinator confirmation. Each apheresis slot must be reserved in advance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
