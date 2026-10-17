import React, { useState } from 'react';
import { Droplet, Sparkles, Shield, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { CoordinationConfig } from '../types';

interface ScreeningGuidelinesCardProps {
  config: CoordinationConfig;
}

export const ScreeningGuidelinesCard: React.FC<ScreeningGuidelinesCardProps> = ({ config }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is Single Donor Platelet (SDP) donation and why does Nikon need it?',
      a: 'Platelets are tiny blood cells that help form clots and stop bleeding. During critical chemotherapy or hematological treatment, patient platelet counts drop dangerously low. In SDP donation, an apheresis machine separates platelets and safely returns red blood cells and plasma to the donor. One SDP unit provides the equivalent platelets of 6 to 8 whole-blood donations.',
    },
    {
      q: 'What is the required waiting interval between donations?',
      a: `Our preliminary coordination interval is a minimum of 3 months (${config.wholeBloodIntervalDays} days) between whole-blood donations, and a minimum of 10 days (${config.sdpIntervalDays} days) between SDP donations. The hospital blood bank will verify your last donation record and current platelet counts before clearing you.`,
    },
    {
      q: 'Why does the form ask for weight 60 kg or above?',
      a: `For high-yield apheresis (SDP) collections, blood banks prefer donors weighing ${config.preliminaryWeightThresholdKg} kg or more to ensure safe total blood volume processing and high platelet yield. However, general whole blood donation can be performed at 45–50 kg. The hospital medical team makes the final determination.`,
    },
    {
      q: 'Does completing this form mean I am approved to donate?',
      a: 'No. This form is strictly for voluntary preliminary screening and scheduling with Nikon’s family coordination team. Final medical fitness is evaluated in person at the hospital blood bank by a qualified medical officer, who will check hemoglobin, vitals, vein suitability, and blood screening tests.',
    },
    {
      q: 'Which blood groups are accepted for Nikon?',
      a: 'For Whole Blood donation, the donor HAS TO BE A+ (this is mandatory because Nikon specifically requires A+ whole blood). For Single Donor Platelets (SDP), ANY blood group is fine (A+, A−, B+, B−, AB+, AB−, O+, O−) and urgently welcomed, as apheresis platelets can be safely matched across groups!',
    },
    {
      q: 'Can I cancel or reschedule my time slot?',
      a: 'Yes. If your availability changes, please inform our family coordinator immediately via the hotline so the apheresis bed can be allocated to another volunteer without disrupting Nikon’s treatment schedule.',
    },
  ];

  return (
    <div id="screening-guidelines" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 mt-8">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Blood & Platelet (SDP) Guidelines for Volunteers
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Essential information regarding the donation process, intervals, and hospital coordination.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <Droplet className="w-4 h-4 text-rose-600" />
              <span>Whole Blood Donation</span>
            </div>
            <span className="text-[10px] font-bold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-md">
              Mandatory A+ Only
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Standard donation of 350ml or 450ml. For Nikon, <strong>the donor HAS TO BE A+ (mandatory)</strong>. Requires a minimum gap of <strong>3 months (90 days)</strong> between donations to replenish red blood cell hemoglobin stores.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Single Donor Platelets (SDP)</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
              Any Blood Group Fine
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Apheresis process lasting 60–90 minutes. <strong>Any blood group is fine and urgently needed!</strong> Requires a minimum gap of <strong>10 days</strong> between SDP sessions and good accessible veins in both arms.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div id="faq" className="space-y-2.5 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Frequently Asked Questions
        </h4>
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-3.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
              </button>
              {isOpen && (
                <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
