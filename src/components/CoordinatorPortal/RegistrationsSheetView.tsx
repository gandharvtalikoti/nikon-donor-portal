import React, { useState } from 'react';
import { DonorRegistration, BloodGroup, EligibilityReviewStatus } from '../../types';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, Eye, Edit3, X, MessageSquare, Phone } from 'lucide-react';

interface RegistrationsSheetViewProps {
  registrations: DonorRegistration[];
  onUpdateRegistration: (id: string, updates: Partial<DonorRegistration>) => void;
  onOpenSheetsExport: () => void;
}

export const RegistrationsSheetView: React.FC<RegistrationsSheetViewProps> = ({
  registrations,
  onUpdateRegistration,
  onOpenSheetsExport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReg, setSelectedReg] = useState<DonorRegistration | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<EligibilityReviewStatus>('Preliminary screening complete');

  // Filtered registrations
  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mobileNumber.includes(searchTerm) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBg = filterBloodGroup === 'all' || r.bloodGroup === filterBloodGroup;
    const matchesStatus = filterStatus === 'all' || r.eligibilityReviewStatus === filterStatus;

    return matchesSearch && matchesBg && matchesStatus;
  });

  const handleOpenDetail = (r: DonorRegistration) => {
    setSelectedReg(r);
    setEditNotes(r.eligibilityReviewNotes.join('\n'));
    setEditStatus(r.eligibilityReviewStatus);
  };

  const handleSaveDetail = () => {
    if (!selectedReg) return;
    const updatedNotes = editNotes
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    onUpdateRegistration(selectedReg.id, {
      eligibilityReviewStatus: editStatus,
      eligibilityReviewNotes: updatedNotes,
      requiresReview: editStatus === 'Requires blood bank review',
    });
    setSelectedReg(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by donor name, phone (+91), or registration ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Blood group filter */}
          <select
            value={filterBloodGroup}
            onChange={(e) => setFilterBloodGroup(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Blood Groups</option>
            {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Review Statuses</option>
            <option value="Requires blood bank review">Requires Review</option>
            <option value="Preliminary screening complete">Screening Complete</option>
            <option value="Medically cleared">Medically Cleared</option>
            <option value="Deferred by blood bank">Deferred</option>
          </select>

          <button
            type="button"
            onClick={onOpenSheetsExport}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <span>Google Sheets Export</span>
          </button>
        </div>
      </div>

      {/* Registrations Data Sheet Table (Strict 15+ Google Sheets fields) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider select-none text-[11px]">
                <th className="py-3 px-3.5 whitespace-nowrap">ID & Date</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Donor Name</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Phone & Contact</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Blood Group</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Type Preference</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Age & Weight</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Screening Vitals</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Last WB / SDP Dates</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Tattoo / Procedures</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Eligibility Review Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No registrations match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isReviewRequired = r.eligibilityReviewStatus === 'Requires blood bank review';

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(r)}
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">{r.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.registeredAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{r.fullName}</span>
                        {r.emailAddress && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                            {r.emailAddress}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-700 block">{r.mobileNumber}</span>
                        <span className="text-[10px] font-medium text-slate-500">
                          Pref: {r.preferredContact}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          {r.bloodGroup}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-700 text-[11px] block max-w-[120px] truncate">
                          {r.donationType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Pref: {r.preferredDate} ({r.preferredTimeSlot.split('–')[0]?.trim()})
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900">
                          {r.ageYears !== null ? `${r.ageYears} yrs` : 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{r.weightRange}</span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px]">
                        <span className={r.feelsWellToday.includes('Yes') ? 'text-emerald-700 font-medium' : 'text-amber-700 font-bold'}>
                          {r.feelsWellToday.includes('Yes') ? 'Well' : 'Unwell/Unsure'}
                        </span>
                        <span className="text-slate-400"> · </span>
                        <span className={r.foodAndHydration === 'Yes' ? 'text-slate-600' : 'text-amber-700 font-medium'}>
                          Hydr: {r.foodAndHydration}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px]">
                        <div className="space-y-0.5">
                          <span className="block text-slate-600 truncate max-w-[150px]">
                            WB: {r.lastWholeBloodDate || r.lastWholeBloodOption}
                          </span>
                          <span className="block text-slate-500 truncate max-w-[150px]">
                            SDP: {r.lastSdpDate || r.lastSdpOption}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px]">
                        <span className={r.tattooPiercing.includes('within') ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                          {r.tattooPiercing}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            isReviewRequired
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : r.eligibilityReviewStatus === 'Medically cleared'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {isReviewRequired ? (
                            <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-emerald-700 shrink-0" />
                          )}
                          <span>{r.eligibilityReviewStatus}</span>
                        </span>
                        {r.eligibilityReviewNotes.length > 0 && (
                          <span className="text-[10px] text-amber-800 block mt-0.5 truncate max-w-[150px]">
                            {r.eligibilityReviewNotes[0]}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(r);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {filtered.length} of {registrations.length} total registrations</span>
          <span>Fields match Google Sheets "Donor Registrations" schema exactly</span>
        </div>
      </div>

      {/* Detail / Review Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-rose-600 block">{selectedReg.id}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedReg.fullName}</h3>
                <p className="text-xs text-slate-500">
                  Registered: {new Date(selectedReg.registeredAt).toLocaleString()} · Blood Group: {selectedReg.bloodGroup}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`tel:${selectedReg.mobileNumber.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Call {selectedReg.mobileNumber}</span>
              </a>
              <a
                href={`https://wa.me/${selectedReg.mobileNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 border border-emerald-200"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Donor</span>
              </a>
            </div>

            {/* Complete 12 Screening Responses Audit */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Preliminary Screening Audit
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div><strong>Age:</strong> {selectedReg.ageYears} completed years ({selectedReg.ageCategory})</div>
                <div><strong>Weight Range:</strong> {selectedReg.weightRange}</div>
                <div><strong>Feels Well Today:</strong> {selectedReg.feelsWellToday}</div>
                <div><strong>Food & Hydration:</strong> {selectedReg.foodAndHydration}</div>
                <div><strong>Last Whole Blood:</strong> {selectedReg.lastWholeBloodOption} {selectedReg.lastWholeBloodDate && `(${selectedReg.lastWholeBloodDate})`}</div>
                <div><strong>Last SDP:</strong> {selectedReg.lastSdpOption} {selectedReg.lastSdpDate && `(${selectedReg.lastSdpDate})`}</div>
                <div><strong>Other Component / Deferral:</strong> {selectedReg.otherDonationOrDeferral} {selectedReg.otherDonationOrDeferralNote && `(${selectedReg.otherDonationOrDeferralNote})`}</div>
                <div><strong>Tattoos/Piercings:</strong> {selectedReg.tattooPiercing} {selectedReg.tattooDate && `(${selectedReg.tattooDate})`}</div>
                <div><strong>Fever/Infection:</strong> {selectedReg.feverInfection}</div>
                <div><strong>Current Medication:</strong> {selectedReg.medicationTreatment}</div>
                <div><strong>Surgery/Transfusion:</strong> {selectedReg.surgeryTransfusion}</div>
                <div><strong>Travel Infection Area:</strong> {selectedReg.travelInfection}</div>
              </div>
            </div>

            {/* Coordinator Review Action */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Coordinator Action & Notes
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Update Eligibility Review Status:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as EligibilityReviewStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="Preliminary screening complete">Preliminary screening complete</option>
                  <option value="Requires blood bank review">Requires blood bank review</option>
                  <option value="Medically cleared">Medically cleared (Hospital Confirmed)</option>
                  <option value="Deferred by blood bank">Deferred by blood bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Coordinator Review Notes (one per line):
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Spoke to donor; last donation interval verified with hospital register"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDetail}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-2xs"
                >
                  Save Review Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
