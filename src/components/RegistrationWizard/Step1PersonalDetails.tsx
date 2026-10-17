import React from 'react';
import { BloodGroup, ContactMethod } from '../../types';
import { User, Phone, Mail, MessageSquare, PhoneCall, HelpCircle, Droplet } from 'lucide-react';

interface Step1Props {
  data: {
    fullName: string;
    mobileNumber: string;
    bloodGroup: BloodGroup;
    preferredContact: ContactMethod;
    alternatePhone?: string;
    emailAddress?: string;
  };
  onChange: (updates: Partial<Step1Props['data']>) => void;
  errors: Record<string, string>;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown'];

export const Step1PersonalDetails: React.FC<Step1Props> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">1. Personal Details</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Please provide your contact details so our family can reach out to coordinate with the hospital.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
          Full Name <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="e.g. Rahul Sharma"
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all ${
              errors.fullName ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
            }`}
          />
        </div>
        {errors.fullName && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName}</p>}
      </div>

      {/* Mobile Number with +91 */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
          Mobile Number <span className="text-rose-600">*</span>
        </label>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 bg-white transition-all">
          <span className="inline-flex items-center px-3 text-xs font-semibold text-slate-600 bg-slate-50 border-r border-slate-200 select-none">
            🇮🇳 +91
          </span>
          <input
            type="tel"
            required
            value={data.mobileNumber.replace(/^\+91\s?/, '')}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              onChange({ mobileNumber: val ? `+91 ${val}` : '' });
            }}
            placeholder="98450 12345"
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-1">10-digit Indian mobile number for coordination calls & WhatsApp.</p>
        {errors.mobileNumber && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.mobileNumber}</p>}
      </div>

      {/* Blood Group */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Blood Group <span className="text-rose-600">*</span>
          </label>
          <span className="text-[11px] text-slate-500">Select Unknown if unsure</span>
        </div>

        {/* Blood Group Requirement Guideline */}
        <div className="p-3 bg-rose-50/70 border border-rose-200/90 rounded-xl text-xs text-rose-950 mb-2.5 flex items-start gap-2.5">
          <Droplet className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-rose-900 block mb-0.5">Nikon's Medical Blood Requirements:</span>
            <span>• <strong>Whole Blood:</strong> Donor <u className="font-semibold">HAS TO BE A+</u> (Mandatory).</span>
            <br />
            <span>• <strong>Single Donor Platelets (SDP):</strong> <u className="font-semibold">Any blood group is fine</u> and urgently needed!</span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {BLOOD_GROUPS.map((bg) => {
            const isSelected = data.bloodGroup === bg;
            const isAplus = bg === 'A+';
            return (
              <button
                key={bg}
                type="button"
                onClick={() => onChange({ bloodGroup: bg })}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-sm relative flex flex-col items-center justify-center ${
                  isSelected
                    ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                    : isAplus
                    ? 'border-rose-300 bg-rose-50/40 text-rose-900 hover:border-rose-400 hover:bg-rose-50'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{bg}</span>
                <span
                  className={`text-[9px] font-medium tracking-tight mt-0.5 px-1 py-0.2 rounded-xs ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isAplus
                      ? 'bg-rose-100 text-rose-800'
                      : 'text-slate-400'
                  }`}
                >
                  {isAplus ? 'WB + SDP' : 'SDP fine'}
                </span>
              </button>
            );
          })}
        </div>
        {errors.bloodGroup && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.bloodGroup}</p>}
      </div>

      {/* Preferred Contact Method */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
          Preferred Contact Method <span className="text-rose-600">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare, desc: 'Quick coordination text' },
            { id: 'Phone call', label: 'Phone call', icon: PhoneCall, desc: 'Direct voice call' },
            { id: 'Either', label: 'Either', icon: Phone, desc: 'Whichever is faster' },
          ].map((item) => {
            const isSelected = data.preferredContact === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ preferredContact: item.id as ContactMethod })}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-rose-600 bg-rose-50/60 text-slate-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                <span className="text-[11px] text-slate-500">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Contact Fields */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-slate-500">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Optional contact details (helpful backup)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Alternate Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <input
                type="tel"
                value={data.alternatePhone || ''}
                onChange={(e) => onChange({ alternatePhone: e.target.value })}
                placeholder="+91 or landline"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                value={data.emailAddress || ''}
                onChange={(e) => onChange({ emailAddress: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
