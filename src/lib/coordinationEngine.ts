import {
  AgeCategory,
  BookingStatus,
  CoordinationConfig,
  DonationBooking,
  DonorRegistration,
  EligibilityReviewStatus,
  IntervalCheckStatus,
  LastSdpOption,
  LastWholeBloodOption,
  WeightRange,
  YesNoUnsure,
} from '../types';

export const DEFAULT_CONFIG: CoordinationConfig = {
  patientName: 'Nikon',
  preliminaryWeightThresholdKg: 60,
  wholeBloodIntervalDays: 90, // 3 months
  sdpIntervalDays: 10,
  tattooDeferralMonths: 6,
  planningWindowDaysMin: 0,
  planningWindowDaysMax: 45,
  timeSlots: [
    '9:00 AM – 10:00 AM',
    '10:00 AM – 11:00 AM',
    '11:00 AM – 12:00 PM',
    '12:00 PM – 1:00 PM',
    '2:00 PM – 3:00 PM',
    '3:00 PM – 4:00 PM',
    '4:00 PM – 5:00 PM',
  ],
  hospitalName: 'Kidwai Memorial Institute of Oncology Hospital, Bangalore Blood Centre',
  hospitalDepartment: 'Department of Transfusion Medicine & Apheresis Unit',
  coordinatorContact: '+91 98450 78910',
  coordinatorPin: '1974',
};

/**
 * Standardize phone numbers to clean comparison format (e.g. +91 9876543210 -> 9876543210)
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return digits.slice(2);
  }
  return digits.slice(-10);
}

/**
 * Derives age category from completed years
 */
export function getAgeCategory(years: number | null): AgeCategory {
  if (years === null || isNaN(years)) return '18–59';
  if (years < 18) return 'Below 18';
  if (years >= 60) return '60 or above';
  return '18–59';
}

/**
 * Add days to a YYYY-MM-DD date string
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Calculate difference in days between two YYYY-MM-DD dates (d2 - d1)
 */
export function diffDays(d1Str: string, d2Str: string): number {
  const d1 = new Date(d1Str);
  const d2 = new Date(d2Str);
  const ms = d2.getTime() - d1.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Run comprehensive preliminary eligibility screening on registration inputs
 */
export interface ScreeningResult {
  reviewStatus: EligibilityReviewStatus;
  requiresReview: boolean;
  notes: string[];
  intervalStatus: IntervalCheckStatus;
  earliestEligibleDate?: string;
  isIntervalConflict: boolean;
  intervalConflictMessage?: string;
}

export function evaluateEligibility(
  reg: {
    ageYears: number | null;
    weightRange: WeightRange;
    donationType: string;
    feelsWellToday: string;
    foodAndHydration: string;
    lastWholeBloodOption: LastWholeBloodOption;
    lastWholeBloodDate?: string;
    lastSdpOption: LastSdpOption;
    lastSdpDate?: string;
    otherDonationOrDeferral: YesNoUnsure;
    otherDonationOrDeferralNote?: string;
    tattooPiercing: string;
    tattooDate?: string;
    feverInfection: YesNoUnsure;
    medicationTreatment: YesNoUnsure;
    surgeryTransfusion: YesNoUnsure;
    travelInfection: YesNoUnsure;
    preferredDate: string;
  },
  config: CoordinationConfig = DEFAULT_CONFIG
): ScreeningResult {
  const notes: string[] = [];
  let requiresReview = false;
  let isIntervalConflict = false;
  let intervalConflictMessage = '';
  let intervalStatus: IntervalCheckStatus = 'Passed preliminary interval';
  let earliestDate: string | undefined = undefined;

  // 1. Age check
  if (reg.ageYears !== null && reg.ageYears !== undefined) {
    if (reg.ageYears < 18) {
      requiresReview = true;
      notes.push(`Age reported: ${reg.ageYears} years (Under 18). Preliminary screening flags minors for blood bank confirmation.`);
    } else if (reg.ageYears >= 60) {
      requiresReview = true;
      notes.push(`Age reported: ${reg.ageYears} years (60+). Blood bank will review physical vitals and previous donation history.`);
    }
  }

  // 2. Weight check
  if (reg.weightRange === 'Below 45 kg') {
    requiresReview = true;
    notes.push('Weight reported: Below 45 kg (General medical threshold is 45-50 kg minimum; hospital assessment required).');
  } else if (reg.weightRange === '45–49 kg') {
    requiresReview = true;
    notes.push(`Weight reported: 45–49 kg. Family preliminary coordination threshold is ${config.preliminaryWeightThresholdKg} kg; blood bank confirms specific suitability.`);
  } else if (reg.weightRange === '50–59 kg') {
    if (config.preliminaryWeightThresholdKg >= 60) {
      requiresReview = true;
      notes.push(`Weight reported: 50–59 kg (Family requested preliminary threshold is ${config.preliminaryWeightThresholdKg} kg for high-yield SDP donation). Hospital confirms criteria.`);
    }
  }

  // 3. Vitals & Hydration
  if (reg.feelsWellToday === 'No, I am currently unwell') {
    requiresReview = true;
    notes.push('Donor reports feeling unwell today. Rest and recovery required prior to scheduling.');
  } else if (reg.feelsWellToday === 'I am unsure whether I am fit to donate') {
    requiresReview = true;
    notes.push('Donor is unsure of fitness to donate today; requires coordinator & medical check.');
  }

  if (reg.foodAndHydration === 'Not yet') {
    notes.push('Food and hydration: Not yet completed. Reminder sent to eat a balanced meal and hydrate well before visit.');
  } else if (reg.foodAndHydration === 'I am unable to do so') {
    requiresReview = true;
    notes.push('Donor reported unable to eat/hydrate properly today; blood bank requires adequate meal/hydration.');
  }

  // 4. Whole Blood Donation Interval Check (3 months = 90 days)
  const isWholeBloodRelevant = reg.donationType === 'Whole blood' || reg.donationType.includes('Either');
  if (isWholeBloodRelevant) {
    if (reg.lastWholeBloodOption === 'Within the last 3 months') {
      requiresReview = true;
      isIntervalConflict = true;
      intervalStatus = 'Interval conflict (too soon)';
      notes.push('Whole-blood donation within last 3 months reported (minimum 3-month gap required).');
      if (reg.lastWholeBloodDate && reg.preferredDate) {
        const daysSince = diffDays(reg.lastWholeBloodDate, reg.preferredDate);
        if (daysSince < config.wholeBloodIntervalDays) {
          const eligibleOn = addDays(reg.lastWholeBloodDate, config.wholeBloodIntervalDays);
          earliestDate = eligibleOn;
          intervalConflictMessage = `Based on your last whole-blood donation on ${reg.lastWholeBloodDate}, the preliminary 3-month gap completes around ${eligibleOn}. Our family will verify with the blood bank before scheduling.`;
        }
      } else {
        intervalConflictMessage = 'Whole blood was donated within the last 3 months. Our family will verify the exact interval with the hospital blood bank.';
      }
    } else if (reg.lastWholeBloodOption === 'I do not remember the exact date') {
      requiresReview = true;
      intervalStatus = 'Donation history needs verification';
      notes.push('Last whole blood donation date is unknown; needs verification with donor/blood bank.');
    }
  }

  // 5. SDP Donation Interval Check (10 days)
  const isSdpRelevant = reg.donationType === 'Single Donor Platelets (SDP)' || reg.donationType.includes('Either');
  if (isSdpRelevant) {
    if (reg.lastSdpOption === 'Within the last 10 days') {
      requiresReview = true;
      isIntervalConflict = true;
      intervalStatus = 'Interval conflict (too soon)';
      notes.push('SDP donation within last 10 days reported (preliminary minimum 10-day gap between SDP donations).');
      if (reg.lastSdpDate && reg.preferredDate) {
        const daysSince = diffDays(reg.lastSdpDate, reg.preferredDate);
        if (daysSince < config.sdpIntervalDays) {
          const eligibleOn = addDays(reg.lastSdpDate, config.sdpIntervalDays);
          if (!earliestDate || eligibleOn > earliestDate) {
            earliestDate = eligibleOn;
          }
          intervalConflictMessage = `Based on your SDP donation on ${reg.lastSdpDate}, the preliminary 10-day gap completes on ${eligibleOn}. The hospital team will confirm your platelet count and interval.`;
        }
      } else if (!intervalConflictMessage) {
        intervalConflictMessage = 'SDP was donated within the last 10 days. The hospital team must confirm your applicable interval.';
      }
    } else if (reg.lastSdpOption === 'I do not remember the exact date') {
      requiresReview = true;
      if (intervalStatus === 'Passed preliminary interval') {
        intervalStatus = 'Donation history needs verification';
      }
      notes.push('Last SDP donation date is unknown; needs verification before apheresis booking.');
    }
  }

  // 6. Other recent component or deferral
  if (reg.otherDonationOrDeferral === 'Yes') {
    requiresReview = true;
    notes.push(`Recent deferral or component donation reported: ${reg.otherDonationOrDeferralNote || 'No specific note provided'}. Hospital review required.`);
  } else if (reg.otherDonationOrDeferral === 'Unsure') {
    requiresReview = true;
    notes.push('Unsure about past deferral or recent component donation.');
  }

  // 7. Tattoo / Piercing
  if (reg.tattooPiercing === 'Yes, within the last 6 months') {
    requiresReview = true;
    notes.push(`Tattoo, piercing, or skin-puncturing procedure within last 6 months (${reg.tattooDate || 'date not given'}). Hospital blood bank must verify procedure conditions.`);
  } else if (reg.tattooPiercing === 'Unsure') {
    requiresReview = true;
    notes.push('Unsure about recent tattoo or skin-puncturing procedure date.');
  }

  // 8. General Health (Fever, medication, surgery, travel)
  if (reg.feverInfection === 'Yes' || reg.feverInfection === 'Unsure') {
    requiresReview = true;
    notes.push(`Fever or infection reported (${reg.feverInfection}). Requires hospital blood bank consultation.`);
  }
  if (reg.medicationTreatment === 'Yes' || reg.medicationTreatment === 'Unsure') {
    requiresReview = true;
    notes.push(`Current medication/treatment reported (${reg.medicationTreatment}). Hospital medical officer will assess safety.`);
  }
  if (reg.surgeryTransfusion === 'Yes' || reg.surgeryTransfusion === 'Unsure') {
    requiresReview = true;
    notes.push(`Recent surgery, transfusion, or invasive procedure reported (${reg.surgeryTransfusion}). Requires clinical deferral period check.`);
  }
  if (reg.travelInfection === 'Yes' || reg.travelInfection === 'Unsure') {
    requiresReview = true;
    notes.push(`Recent travel to malaria/infection endemic area reported (${reg.travelInfection}). Geographic deferral check required.`);
  }

  const reviewStatus: EligibilityReviewStatus = requiresReview
    ? 'Requires blood bank review'
    : 'Preliminary screening complete';

  return {
    reviewStatus,
    requiresReview,
    notes,
    intervalStatus,
    earliestEligibleDate: earliestDate,
    isIntervalConflict,
    intervalConflictMessage: intervalConflictMessage || undefined,
  };
}

/**
 * Check if a donor already has an active booking that prevents booking a new date
 */
export function checkDuplicateBooking(
  mobile: string,
  existingBookings: DonationBooking[]
): { hasActiveBooking: boolean; activeBooking?: DonationBooking } {
  const norm = normalizePhone(mobile);
  const activeStatuses: BookingStatus[] = [
    'Availability registered',
    'Eligibility review required',
    'Awaiting hospital confirmation',
    'Confirmed appointment',
  ];

  const active = existingBookings.find(
    (b) => normalizePhone(b.donorMobile) === norm && activeStatuses.includes(b.bookingStatus)
  );

  return {
    hasActiveBooking: !!active,
    activeBooking: active,
  };
}

/**
 * Determine the initial booking status based on screening and history
 */
export function determineInitialBookingStatus(screening: ScreeningResult): BookingStatus {
  if (screening.isIntervalConflict || screening.requiresReview) {
    return 'Eligibility review required';
  }
  return 'Availability registered';
}
