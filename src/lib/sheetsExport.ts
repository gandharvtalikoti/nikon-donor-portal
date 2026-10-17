import { DonationBooking, DonorRegistration } from '../types';

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function escapeTsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
}

export function generateRegistrationsCsv(registrations: DonorRegistration[]): string {
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

  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  return csvLines.join('\n');
}

export function generateBookingsCsv(bookings: DonationBooking[]): string {
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

  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  return csvLines.join('\n');
}

export function generateTsvForClipboard(
  headers: string[],
  rows: (string | number | undefined | null)[][]
): string {
  const headerLine = headers.map(escapeTsvCell).join('\t');
  const dataLines = rows.map((row) => row.map(escapeTsvCell).join('\t'));
  return [headerLine, ...dataLines].join('\n');
}

export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
