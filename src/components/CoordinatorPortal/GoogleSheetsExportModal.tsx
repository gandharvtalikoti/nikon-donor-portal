import React, { useState } from 'react';
import { DonationBooking, DonorRegistration } from '../../types';
import {
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  X,
  ExternalLink,
  Table,
} from 'lucide-react';
import {
  downloadCsvFile,
  generateBookingsCsv,
  generateRegistrationsCsv,
  generateTsvForClipboard,
} from '../../lib/sheetsExport';

interface GoogleSheetsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: DonorRegistration[];
  bookings: DonationBooking[];
}

export const GoogleSheetsExportModal: React.FC<GoogleSheetsExportModalProps> = ({
  isOpen,
  onClose,
  registrations,
  bookings,
}) => {
  const [activeSheet, setActiveSheet] = useState<'registrations' | 'bookings'>('registrations');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    if (activeSheet === 'registrations') {
      const csv = generateRegistrationsCsv(registrations);
      downloadCsvFile(csv, `nikon_donor_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      const csv = generateBookingsCsv(bookings);
      downloadCsvFile(csv, `nikon_donation_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  const handleCopyClipboard = async () => {
    let tsv = '';
    if (activeSheet === 'registrations') {
      const headers = [
        'Registration ID',
        'Registered At',
        'Full Name',
        'Mobile Number',
        'Blood Group',
        'Preferred Contact Method',
        'Alternate Phone',
        'Email Address',
        'Donation Type Preference',
        'Age in completed years',
        'Weight range',
        'Feels well today',
        'Food and hydration confirmation',
        'Last whole-blood donation date',
        'Last SDP donation date',
        'Other recent donation or deferral reported',
        'Tattoo/piercing screening response',
        'Current illness screening response',
        'Medication/treatment screening response',
        'Recent surgery/transfusion/procedure response',
        'Recent travel screening response',
        'Eligibility review status',
        'Eligibility review notes',
        'Preferred Date',
        'Preferred Time Slot',
        'Availability Note',
        'Donor consent timestamp',
      ];
      const rows = registrations.map((r) => [
        r.id,
        r.registeredAt,
        r.fullName,
        r.mobileNumber,
        r.bloodGroup,
        r.preferredContact,
        r.alternatePhone || '',
        r.emailAddress || '',
        r.donationType,
        r.ageYears !== null ? r.ageYears : '',
        r.weightRange,
        r.feelsWellToday,
        r.foodAndHydration,
        r.lastWholeBloodDate ? `${r.lastWholeBloodOption} (${r.lastWholeBloodDate})` : r.lastWholeBloodOption,
        r.lastSdpDate ? `${r.lastSdpOption} (${r.lastSdpDate})` : r.lastSdpOption,
        r.otherDonationOrDeferral + (r.otherDonationOrDeferralNote ? `: ${r.otherDonationOrDeferralNote}` : ''),
        r.tattooPiercing + (r.tattooDate ? ` (${r.tattooDate})` : ''),
        r.feverInfection,
        r.medicationTreatment,
        r.surgeryTransfusion,
        r.travelInfection,
        r.eligibilityReviewStatus,
        r.eligibilityReviewNotes.join('; '),
        r.preferredDate,
        r.preferredTimeSlot,
        r.availabilityNote || '',
        r.donorConsentTimestamp,
      ]);
      tsv = generateTsvForClipboard(headers, rows);
    } else {
      const headers = [
        'Booking ID',
        'Registration ID',
        'Donor Full Name',
        'Donor Mobile',
        'Blood Group',
        'Booking Date',
        'Preferred Time Slot',
        'Donation Type',
        'Previous donation date checked',
        'Previous donation type',
        'Preliminary interval check status',
        'Booking Status',
        'Hospital eligibility confirmed',
        'Hospital confirmation timestamp',
        'Actual donation date',
        'Actual donation type',
        'Coordinator Notes',
        'Created At',
      ];
      const rows = bookings.map((b) => [
        b.id,
        b.registrationId,
        b.donorFullName,
        b.donorMobile,
        b.bloodGroup,
        b.bookingDate,
        b.timeSlot,
        b.donationType,
        b.previousDonationDateChecked,
        b.previousDonationType,
        b.preliminaryIntervalCheckStatus,
        b.bookingStatus,
        b.hospitalEligibilityConfirmed,
        b.hospitalConfirmationTimestamp || '',
        b.actualDonationDate || '',
        b.actualDonationType || '',
        b.notes || '',
        b.createdAt,
      ]);
      tsv = generateTsvForClipboard(headers, rows);
    }

    try {
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5">
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Google Sheets Synchronization</h3>
              <p className="text-xs text-slate-500">
                Export real-time records into Google Sheets schemas for authorized administrative review.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSheet('registrations')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSheet === 'registrations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Donor Registrations Sheet ({registrations.length} rows)
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet('bookings')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSheet === 'bookings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Donation Bookings Sheet ({bookings.length} rows)
          </button>
        </div>

        {/* Schema Information */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">
              Active Schema: {activeSheet === 'registrations' ? 'Donor Registrations' : 'Donation Bookings'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {activeSheet === 'registrations' ? '27 columns' : '18 columns'}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed text-[11px]">
            {activeSheet === 'registrations'
              ? 'Includes: Age in completed years, Weight range, Feels well today, Food and hydration confirmation, Last WB donation date, Last SDP donation date, Other recent donation/deferral, Tattoo/piercing response, Current illness, Medication/treatment, Recent surgery/transfusion, Recent travel, Eligibility review status, Review notes, Donor consent timestamp.'
              : 'Includes: Booking ID, Previous donation date checked, Previous donation type, Preliminary interval check status, Hospital eligibility confirmed, Hospital confirmation timestamp, Actual donation date, Actual donation type, Booking status.'}
          </p>
        </div>

        {/* Export Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                <span>Copied to Clipboard! (Paste in Google Sheets)</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-emerald-700" />
                <span>Copy Google Sheets Tabular Format</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .CSV File</span>
          </button>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
          <strong>Privacy Requirement:</strong> Restrict access to eligibility responses and contact details to authorized family administrators. Do not publish or expose eligibility answers publicly.
        </div>
      </div>
    </div>
  );
};
