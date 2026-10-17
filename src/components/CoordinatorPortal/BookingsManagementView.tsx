import React, { useState } from 'react';
import { BookingStatus, DonationBooking, SpecificDonationType } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit2,
  Check,
  X,
  Droplet,
  Sparkles,
  Phone,
  FileCheck,
} from 'lucide-react';

interface BookingsManagementViewProps {
  bookings: DonationBooking[];
  onUpdateBooking: (id: string, updates: Partial<DonationBooking>, logReason: string) => void;
  onRecordCompletedDonation: (
    id: string,
    actualDate: string,
    actualType: SpecificDonationType,
    notes: string
  ) => void;
  onOpenSheetsExport: () => void;
}

export const BookingsManagementView: React.FC<BookingsManagementViewProps> = ({
  bookings,
  onUpdateBooking,
  onRecordCompletedDonation,
  onOpenSheetsExport,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [completionModalBooking, setCompletionModalBooking] = useState<DonationBooking | null>(null);
  const [actualDate, setActualDate] = useState(new Date().toISOString().split('T')[0]);
  const [actualType, setActualType] = useState<SpecificDonationType>('Whole blood');
  const [completionNotes, setCompletionNotes] = useState('');

  const [rescheduleBooking, setRescheduleBooking] = useState<DonationBooking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.donorFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.donorMobile.includes(searchTerm) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || b.bookingStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCompletionModal = (b: DonationBooking) => {
    setCompletionModalBooking(b);
    setActualDate(b.bookingDate || new Date().toISOString().split('T')[0]);
    setActualType(b.donationType);
    setCompletionNotes(b.notes || '');
  };

  const handleSaveCompletion = () => {
    if (!completionModalBooking) return;
    onRecordCompletedDonation(completionModalBooking.id, actualDate, actualType, completionNotes);
    setCompletionModalBooking(null);
  };

  const handleOpenReschedule = (b: DonationBooking) => {
    setRescheduleBooking(b);
    setNewDate(b.bookingDate);
    setNewSlot(b.timeSlot);
    setRescheduleReason('');
  };

  const handleSaveReschedule = () => {
    if (!rescheduleBooking) return;
    onUpdateBooking(
      rescheduleBooking.id,
      {
        bookingDate: newDate,
        timeSlot: newSlot,
        updatedAt: new Date().toISOString(),
      },
      `Administrator rescheduled booking to ${newDate} (${newSlot}). Reason: ${rescheduleReason || 'Coordinator adjustment'}`
    );
    setRescheduleBooking(null);
  };

  const handleConfirmHospital = (b: DonationBooking) => {
    const nowIso = new Date().toISOString();
    onUpdateBooking(
      b.id,
      {
        bookingStatus: 'Confirmed appointment',
        hospitalEligibilityConfirmed: 'Yes',
        hospitalConfirmationTimestamp: nowIso,
        updatedAt: nowIso,
      },
      `Confirmed hospital blood bank eligibility and reserved slot for ${b.donorFullName}`
    );
  };

  const handleCancelBooking = (b: DonationBooking) => {
    const reason = prompt('Please enter reason for cancellation:', 'Donor unavailable / Rescheduled by hospital');
    if (reason === null) return;
    const nowIso = new Date().toISOString();
    onUpdateBooking(
      b.id,
      {
        bookingStatus: 'Cancelled',
        notes: `${b.notes ? b.notes + ' | ' : ''}Cancelled: ${reason}`,
        updatedAt: nowIso,
      },
      `Cancelled booking for ${b.donorFullName}. Reason: ${reason} (Note: Cancelled bookings do not count as completed donations)`
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings by donor name, phone (+91), or booking ID..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Booking Statuses</option>
            <option value="Availability registered">Availability registered</option>
            <option value="Eligibility review required">Eligibility review required</option>
            <option value="Awaiting hospital confirmation">Awaiting hospital confirmation</option>
            <option value="Confirmed appointment">Confirmed appointment</option>
            <option value="Donation completed">Donation completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={onOpenSheetsExport}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
          >
            Google Sheets Export
          </button>
        </div>
      </div>

      {/* Bookings Table matching Google Sheets Donation Bookings schema */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider select-none text-[11px]">
                <th className="py-3 px-3.5 whitespace-nowrap">Booking ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Donor Details</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Scheduled Slot</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Donation Type</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Prev Date Checked</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Interval Check Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Booking Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Hospital Confirmed</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Actual Completed Date</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No bookings match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const isConflict = b.preliminaryIntervalCheckStatus === 'Interval conflict (too soon)';
                  const isCompleted = b.bookingStatus === 'Donation completed';
                  const isCancelled = b.bookingStatus === 'Cancelled';
                  const isConfirmed = b.bookingStatus === 'Confirmed appointment';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">{b.id}</span>
                        <span className="text-[10px] text-slate-400">Ref: {b.registrationId}</span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{b.donorFullName}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200">
                            {b.bloodGroup}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 block">{b.donorMobile}</span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.bookingDate}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">{b.timeSlot}</span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          {b.donationType === 'Single Donor Platelets (SDP)' ? (
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Droplet className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span>{b.donationType}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px]">
                        <span className="text-slate-800 font-medium block">
                          {b.previousDonationDateChecked}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Type: {b.previousDonationType}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isConflict
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : b.preliminaryIntervalCheckStatus === 'Donation history needs verification'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {b.preliminaryIntervalCheckStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isConfirmed
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : isCancelled
                              ? 'bg-slate-100 text-slate-500 line-through'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-3 h-3 text-emerald-700" />
                          ) : isCancelled ? (
                            <XCircle className="w-3 h-3 text-slate-400" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-700" />
                          )}
                          <span>{b.bookingStatus}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px]">
                        <span className={b.hospitalEligibilityConfirmed === 'Yes' ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                          {b.hospitalEligibilityConfirmed}
                        </span>
                        {b.hospitalConfirmationTimestamp && (
                          <span className="block text-[10px] text-slate-400">
                            {new Date(b.hospitalConfirmationTimestamp).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px]">
                        {b.actualDonationDate ? (
                          <div>
                            <span className="font-bold text-emerald-700 block">{b.actualDonationDate}</span>
                            <span className="text-[10px] text-slate-500">{b.actualDonationType}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not completed</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Confirm with hospital button */}
                          {!isConfirmed && !isCompleted && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleConfirmHospital(b)}
                              title="Confirm Hospital Clearance"
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>Confirm</span>
                            </button>
                          )}

                          {/* Record completed donation button */}
                          {!isCompleted && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleOpenCompletionModal(b)}
                              title="Record Actual Completed Donation"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Completed</span>
                            </button>
                          )}

                          {/* Reschedule button */}
                          {!isCompleted && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleOpenReschedule(b)}
                              title="Reschedule Date/Slot"
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Cancel button */}
                          {!isCancelled && !isCompleted && (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(b)}
                              title="Cancel Booking"
                              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {filtered.length} of {bookings.length} total bookings</span>
          <span>Complies with Single Active Booking & Interval Constraints</span>
        </div>
      </div>

      {/* Completion Modal */}
      {completionModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Completed Donation</h3>
                <p className="text-xs text-slate-500">
                  Donor: {completionModalBooking.donorFullName} ({completionModalBooking.donorMobile})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompletionModalBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actual Donation Date:
                </label>
                <input
                  type="date"
                  value={actualDate}
                  onChange={(e) => setActualDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actual Donation Type Collected:
                </label>
                <select
                  value={actualType}
                  onChange={(e) => setActualType(e.target.value as SpecificDonationType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                >
                  <option value="Whole blood">Whole blood</option>
                  <option value="Single Donor Platelets (SDP)">Single Donor Platelets (SDP)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Blood Bank Bag / Verification Notes:
                </label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. 1 unit SDP collected, platelet yield 3.2 x 10^11. Donor tolerated procedure well."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                * Recording this completed donation updates the donor's historical donation date and resets their next eligible interval ({actualType === 'Whole blood' ? '90 days' : '10 days'}).
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompletionModalBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCompletion}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-2xs cursor-pointer"
              >
                Record Donation Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reschedule Booking Slot</h3>
                <p className="text-xs text-slate-500">
                  Donor: {rescheduleBooking.donorFullName} ({rescheduleBooking.id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Date:</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Time Slot:</label>
                <input
                  type="text"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  placeholder="e.g. 10:00 AM – 11:00 AM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Change (Logged in Audit Trail):
                </label>
                <textarea
                  rows={2}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Donor requested afternoon slot due to travel"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-2xs cursor-pointer"
              >
                Save New Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
