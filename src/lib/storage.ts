import {
  AdminActivityLog,
  CoordinationConfig,
  DonationBooking,
  DonorRegistration,
} from '../types';
import { DEFAULT_CONFIG } from './coordinationEngine';

const STORAGE_KEYS = {
  REGISTRATIONS: 'nikon_donor_registrations_v2',
  BOOKINGS: 'nikon_donation_bookings_v2',
  ACTIVITY_LOG: 'nikon_activity_log_v2',
  CONFIG: 'nikon_coordination_config_v2',
};

const SEED_REGISTRATIONS: DonorRegistration[] = [
  {
    id: 'REG-2026-1001',
    registeredAt: '2026-10-14T09:30:00Z',
    fullName: 'Rahul Sharma',
    mobileNumber: '+91 98451 23456',
    bloodGroup: 'O+',
    preferredContact: 'WhatsApp',
    alternatePhone: '+91 98451 99999',
    emailAddress: 'rahul.sharma@example.in',
    donationType: 'Single Donor Platelets (SDP)',
    ageYears: 28,
    ageCategory: '18–59',
    weightRange: '60 kg or above',
    feelsWellToday: 'Yes, I feel well',
    foodAndHydration: 'Yes',
    lastWholeBloodOption: '3 months or more ago',
    lastWholeBloodDate: '2026-06-10',
    lastSdpOption: 'Never donated SDP before',
    otherDonationOrDeferral: 'No',
    tattooPiercing: 'No',
    feverInfection: 'No',
    medicationTreatment: 'No',
    surgeryTransfusion: 'No',
    travelInfection: 'No',
    eligibilityReviewStatus: 'Preliminary screening complete',
    eligibilityReviewNotes: [],
    requiresReview: false,
    preferredDate: '2026-10-22',
    preferredTimeSlot: '10:00 AM – 11:00 AM',
    availabilityNote: 'Can come anytime in the morning; office is near hospital',
    consentAccurateInfo: true,
    consentPreliminaryOnly: true,
    consentContactByFamily: true,
    donorConsentTimestamp: '2026-10-14T09:30:00Z',
  },
  {
    id: 'REG-2026-1002',
    registeredAt: '2026-10-15T11:15:00Z',
    fullName: 'Dr. Ananya Iyer',
    mobileNumber: '+91 98860 45678',
    bloodGroup: 'B+',
    preferredContact: 'Phone call',
    emailAddress: 'ananya.iyer@example.org',
    donationType: 'Single Donor Platelets (SDP)',
    ageYears: 34,
    ageCategory: '18–59',
    weightRange: '60 kg or above',
    feelsWellToday: 'Yes, I feel well',
    foodAndHydration: 'Yes',
    lastWholeBloodOption: '3 months or more ago',
    lastWholeBloodDate: '2026-04-12',
    lastSdpOption: '10 days or more ago',
    lastSdpDate: '2026-09-28',
    otherDonationOrDeferral: 'No',
    tattooPiercing: 'No',
    feverInfection: 'No',
    medicationTreatment: 'No',
    surgeryTransfusion: 'No',
    travelInfection: 'No',
    eligibilityReviewStatus: 'Preliminary screening complete',
    eligibilityReviewNotes: [],
    requiresReview: false,
    preferredDate: '2026-10-20',
    preferredTimeSlot: '11:00 AM – 12:00 PM',
    availabilityNote: 'Hospital doctor; can coordinate directly with apheresis lab',
    consentAccurateInfo: true,
    consentPreliminaryOnly: true,
    consentContactByFamily: true,
    donorConsentTimestamp: '2026-10-15T11:15:00Z',
  },
  {
    id: 'REG-2026-1003',
    registeredAt: '2026-10-16T14:40:00Z',
    fullName: 'Vikram Patel',
    mobileNumber: '+91 97412 88776',
    bloodGroup: 'A+',
    preferredContact: 'Either',
    donationType: 'Whole blood',
    ageYears: 24,
    ageCategory: '18–59',
    weightRange: '60 kg or above',
    feelsWellToday: 'Yes, I feel well',
    foodAndHydration: 'Yes',
    lastWholeBloodOption: 'Within the last 3 months',
    lastWholeBloodDate: '2026-09-05',
    lastSdpOption: 'Never donated SDP before',
    otherDonationOrDeferral: 'No',
    tattooPiercing: 'No',
    feverInfection: 'No',
    medicationTreatment: 'No',
    surgeryTransfusion: 'No',
    travelInfection: 'No',
    eligibilityReviewStatus: 'Requires blood bank review',
    eligibilityReviewNotes: [
      'Whole-blood donation within last 3 months reported (minimum 3-month gap required).',
      'Preliminary interval conflict: donated on 2026-09-05; eligible after ~2026-12-04.',
    ],
    requiresReview: true,
    earliestEligibleDate: '2026-12-04',
    preferredDate: '2026-10-24',
    preferredTimeSlot: '2:00 PM – 3:00 PM',
    availabilityNote: 'Eager to help if hospital clears an exception or for next round',
    consentAccurateInfo: true,
    consentPreliminaryOnly: true,
    consentContactByFamily: true,
    donorConsentTimestamp: '2026-10-16T14:40:00Z',
  },
  {
    id: 'REG-2026-1004',
    registeredAt: '2026-10-16T16:20:00Z',
    fullName: 'Sneha Reddy',
    mobileNumber: '+91 99001 54321',
    bloodGroup: 'AB+',
    preferredContact: 'WhatsApp',
    donationType: 'Either, depending on the current medical requirement',
    ageYears: 22,
    ageCategory: '18–59',
    weightRange: '50–59 kg',
    feelsWellToday: 'Yes, I feel well',
    foodAndHydration: 'Not yet',
    lastWholeBloodOption: 'Never donated before',
    lastSdpOption: 'I do not remember the exact date',
    otherDonationOrDeferral: 'No',
    tattooPiercing: 'Yes, within the last 6 months',
    tattooDate: '2026-07-15',
    feverInfection: 'No',
    medicationTreatment: 'No',
    surgeryTransfusion: 'No',
    travelInfection: 'No',
    eligibilityReviewStatus: 'Requires blood bank review',
    eligibilityReviewNotes: [
      'Weight reported: 50–59 kg (Family requested preliminary threshold is 60 kg for high-yield SDP donation). Hospital confirms criteria.',
      'Last SDP donation date is unknown; needs verification before apheresis booking.',
      'Tattoo, piercing, or skin-puncturing procedure within last 6 months (2026-07-15). Hospital blood bank must verify procedure conditions.',
    ],
    requiresReview: true,
    preferredDate: '2026-10-26',
    preferredTimeSlot: '3:00 PM – 4:00 PM',
    availabilityNote: 'First time donor, will need guidance at blood bank',
    consentAccurateInfo: true,
    consentPreliminaryOnly: true,
    consentContactByFamily: true,
    donorConsentTimestamp: '2026-10-16T16:20:00Z',
  },
  {
    id: 'REG-2026-1005',
    registeredAt: '2026-10-10T08:15:00Z',
    fullName: 'Priya Nair',
    mobileNumber: '+91 94480 11223',
    bloodGroup: 'A+',
    preferredContact: 'WhatsApp',
    donationType: 'Whole blood',
    ageYears: 31,
    ageCategory: '18–59',
    weightRange: '60 kg or above',
    feelsWellToday: 'Yes, I feel well',
    foodAndHydration: 'Yes',
    lastWholeBloodOption: '3 months or more ago',
    lastWholeBloodDate: '2026-05-18',
    lastSdpOption: 'Never donated SDP before',
    otherDonationOrDeferral: 'No',
    tattooPiercing: 'No',
    feverInfection: 'No',
    medicationTreatment: 'No',
    surgeryTransfusion: 'No',
    travelInfection: 'No',
    eligibilityReviewStatus: 'Preliminary screening complete',
    eligibilityReviewNotes: [],
    requiresReview: false,
    preferredDate: '2026-10-12',
    preferredTimeSlot: '9:00 AM – 10:00 AM',
    consentAccurateInfo: true,
    consentPreliminaryOnly: true,
    consentContactByFamily: true,
    donorConsentTimestamp: '2026-10-10T08:15:00Z',
  },
];

const SEED_BOOKINGS: DonationBooking[] = [
  {
    id: 'BKG-2026-501',
    registrationId: 'REG-2026-1001',
    donorFullName: 'Rahul Sharma',
    donorMobile: '+91 98451 23456',
    bloodGroup: 'O+',
    bookingDate: '2026-10-22',
    timeSlot: '10:00 AM – 11:00 AM',
    donationType: 'Single Donor Platelets (SDP)',
    previousDonationDateChecked: '2026-06-10',
    previousDonationType: 'Whole blood',
    preliminaryIntervalCheckStatus: 'Passed preliminary interval',
    bookingStatus: 'Awaiting hospital confirmation',
    hospitalEligibilityConfirmed: 'Pending',
    notes: 'Family coordinator reached out via WhatsApp. Non-A+ donor registered for SDP (Platelets).',
    createdAt: '2026-10-14T09:35:00Z',
    updatedAt: '2026-10-14T09:35:00Z',
  },
  {
    id: 'BKG-2026-502',
    registrationId: 'REG-2026-1002',
    donorFullName: 'Dr. Ananya Iyer',
    donorMobile: '+91 98860 45678',
    bloodGroup: 'B+',
    bookingDate: '2026-10-20',
    timeSlot: '11:00 AM – 12:00 PM',
    donationType: 'Single Donor Platelets (SDP)',
    previousDonationDateChecked: '2026-09-28',
    previousDonationType: 'Single Donor Platelets (SDP)',
    preliminaryIntervalCheckStatus: 'Passed preliminary interval',
    bookingStatus: 'Confirmed appointment',
    hospitalEligibilityConfirmed: 'Yes',
    hospitalConfirmationTimestamp: '2026-10-15T15:20:00Z',
    notes: 'Apheresis slot #2 reserved at Kidwai Memorial Blood Bank. Platelet count verified.',
    createdAt: '2026-10-15T11:20:00Z',
    updatedAt: '2026-10-15T15:20:00Z',
  },
  {
    id: 'BKG-2026-503',
    registrationId: 'REG-2026-1003',
    donorFullName: 'Vikram Patel',
    donorMobile: '+91 97412 88776',
    bloodGroup: 'A+',
    bookingDate: '2026-10-24',
    timeSlot: '2:00 PM – 3:00 PM',
    donationType: 'Whole blood',
    previousDonationDateChecked: '2026-09-05',
    previousDonationType: 'Whole blood',
    preliminaryIntervalCheckStatus: 'Interval conflict (too soon)',
    bookingStatus: 'Eligibility review required',
    hospitalEligibilityConfirmed: 'Pending',
    notes: 'Preliminary interval conflict. Donated on 2026-09-05. Earliest review date: 2026-12-04.',
    createdAt: '2026-10-16T14:45:00Z',
    updatedAt: '2026-10-16T14:45:00Z',
  },
  {
    id: 'BKG-2026-504',
    registrationId: 'REG-2026-1004',
    donorFullName: 'Sneha Reddy',
    donorMobile: '+91 99001 54321',
    bloodGroup: 'AB+',
    bookingDate: '2026-10-26',
    timeSlot: '3:00 PM – 4:00 PM',
    donationType: 'Single Donor Platelets (SDP)',
    previousDonationDateChecked: 'Unknown (Needs verification)',
    previousDonationType: 'Unknown',
    preliminaryIntervalCheckStatus: 'Donation history needs verification',
    bookingStatus: 'Eligibility review required',
    hospitalEligibilityConfirmed: 'Pending',
    notes: 'Last SDP date unknown; weight 50-59kg and tattoo in July 2026 flag for review.',
    createdAt: '2026-10-16T16:25:00Z',
    updatedAt: '2026-10-16T16:25:00Z',
  },
  {
    id: 'BKG-2026-505',
    registrationId: 'REG-2026-1005',
    donorFullName: 'Priya Nair',
    donorMobile: '+91 94480 11223',
    bloodGroup: 'A+',
    bookingDate: '2026-10-12',
    timeSlot: '9:00 AM – 10:00 AM',
    donationType: 'Whole blood',
    previousDonationDateChecked: '2026-05-18',
    previousDonationType: 'Whole blood',
    preliminaryIntervalCheckStatus: 'Passed preliminary interval',
    bookingStatus: 'Donation completed',
    hospitalEligibilityConfirmed: 'Yes',
    hospitalConfirmationTimestamp: '2026-10-11T16:00:00Z',
    actualDonationDate: '2026-10-12',
    actualDonationType: 'Whole blood',
    notes: 'Donation successfully completed at Kidwai Memorial Blood Bank. 450ml A+ whole blood collected for Nikon.',
    createdAt: '2026-10-10T08:20:00Z',
    updatedAt: '2026-10-12T10:45:00Z',
  },
];

const SEED_LOGS: AdminActivityLog[] = [
  {
    id: 'LOG-1',
    timestamp: '2026-10-12T10:45:00Z',
    action: 'Donation Completed',
    recordType: 'booking',
    recordId: 'BKG-2026-505',
    details: 'Recorded actual donation completion for Priya Nair (Whole blood, 450ml) on 2026-10-12.',
    performedBy: 'Family Coordinator',
  },
  {
    id: 'LOG-2',
    timestamp: '2026-10-15T15:20:00Z',
    action: 'Hospital Confirmed',
    recordType: 'booking',
    recordId: 'BKG-2026-502',
    details: 'Confirmed hospital clearance and apheresis slot for Dr. Ananya Iyer on 2026-10-20.',
    performedBy: 'Family Coordinator',
  },
  {
    id: 'LOG-3',
    timestamp: '2026-10-16T14:45:00Z',
    action: 'Interval Conflict Flagged',
    recordType: 'booking',
    recordId: 'BKG-2026-503',
    details: 'System flagged Vikram Patel: last donation 2026-09-05 falls within 3-month gap.',
    performedBy: 'System Engine',
  },
];

export function getStoredRegistrations(): DonorRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
      return SEED_REGISTRATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_REGISTRATIONS;
  }
}

export function saveRegistrations(regs: DonorRegistration[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(regs));
  } catch (err) {
    console.error('Failed to save registrations', err);
  }
}

export function getStoredBookings(): DonationBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
      return SEED_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_BOOKINGS;
  }
}

export function saveBookings(bookings: DonationBooking[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch (err) {
    console.error('Failed to save bookings', err);
  }
}

export function getStoredLogs(): AdminActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(SEED_LOGS));
      return SEED_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_LOGS;
  }
}

export function saveLogs(logs: AdminActivityLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save activity logs', err);
  }
}

export function getStoredConfig(): CoordinationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (parsed.hospitalName && parsed.hospitalName.includes("St. John")) {
      parsed.hospitalName = 'Kidwai Memorial Institute of Oncology Hospital, Bangalore Blood Centre';
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(cfg: CoordinationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
  } catch (err) {
    console.error('Failed to save config', err);
  }
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(SEED_LOGS));
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
}
