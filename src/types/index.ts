export type BloodGroup =
  | 'A+'
  | 'A−'
  | 'B+'
  | 'B−'
  | 'AB+'
  | 'AB−'
  | 'O+'
  | 'O−'
  | 'Unknown';

export type ContactMethod = 'WhatsApp' | 'Phone call' | 'Either';

export type DonationTypePreference =
  | 'Whole blood'
  | 'Single Donor Platelets (SDP)'
  | 'Either, depending on the current medical requirement';

export type SpecificDonationType = 'Whole blood' | 'Single Donor Platelets (SDP)';

export type AgeCategory = 'Below 18' | '18–59' | '60 or above';

export type WeightRange = 'Below 45 kg' | '45–49 kg' | '50–59 kg' | '60 kg or above';

export type YesNoUnsure = 'No' | 'Yes' | 'Unsure';

export type FeelingWellOption =
  | 'Yes, I feel well'
  | 'No, I am currently unwell'
  | 'I am unsure whether I am fit to donate';

export type FoodHydrationOption =
  | 'Yes'
  | 'Not yet'
  | 'I am unable to do so';

export type LastWholeBloodOption =
  | 'Never donated before'
  | 'Within the last 3 months'
  | '3 months or more ago'
  | 'I do not remember the exact date';

export type LastSdpOption =
  | 'Never donated SDP before'
  | 'Within the last 10 days'
  | '10 days or more ago'
  | 'I do not remember the exact date';

export type TattooOption =
  | 'No'
  | 'Yes, within the last 6 months'
  | 'Yes, 6 months or more ago'
  | 'Unsure';

export type EligibilityReviewStatus =
  | 'Preliminary screening complete'
  | 'Requires blood bank review'
  | 'Medically cleared'
  | 'Deferred by blood bank';

export type BookingStatus =
  | 'Availability registered'
  | 'Eligibility review required'
  | 'Awaiting hospital confirmation'
  | 'Confirmed appointment'
  | 'Donation completed'
  | 'Cancelled';

export type IntervalCheckStatus =
  | 'Passed preliminary interval'
  | 'Interval conflict (too soon)'
  | 'Donation history needs verification';

export interface DonorRegistration {
  id: string;
  registeredAt: string; // ISO date-time
  
  // Section 1: Personal Details
  fullName: string;
  mobileNumber: string; // e.g. +91 9876543210
  bloodGroup: BloodGroup;
  preferredContact: ContactMethod;
  alternatePhone?: string;
  emailAddress?: string;

  // Section 2: Donation Type Preference
  donationType: DonationTypePreference;

  // Section 3: Donor Eligibility Screening
  ageYears: number | null;
  ageCategory: AgeCategory;
  weightRange: WeightRange;
  feelsWellToday: FeelingWellOption;
  foodAndHydration: FoodHydrationOption;
  
  lastWholeBloodOption: LastWholeBloodOption;
  lastWholeBloodDate?: string; // YYYY-MM-DD
  
  lastSdpOption: LastSdpOption;
  lastSdpDate?: string; // YYYY-MM-DD
  
  otherDonationOrDeferral: YesNoUnsure;
  otherDonationOrDeferralNote?: string;
  
  tattooPiercing: TattooOption;
  tattooDate?: string;
  
  feverInfection: YesNoUnsure;
  medicationTreatment: YesNoUnsure;
  surgeryTransfusion: YesNoUnsure;
  travelInfection: YesNoUnsure;

  // Screening conclusions
  eligibilityReviewStatus: EligibilityReviewStatus;
  eligibilityReviewNotes: string[];
  requiresReview: boolean;
  earliestEligibleDate?: string; // YYYY-MM-DD

  // Section 4: Date & Time Availability
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: string; // e.g. "10:00 AM – 11:00 AM"
  availabilityNote?: string;

  // Section 5: Consent
  consentAccurateInfo: boolean;
  consentPreliminaryOnly: boolean;
  consentContactByFamily: boolean;
  donorConsentTimestamp: string;
}

export interface DonationBooking {
  id: string;
  registrationId: string;
  donorFullName: string;
  donorMobile: string;
  bloodGroup: BloodGroup;
  
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string;
  donationType: SpecificDonationType;
  
  previousDonationDateChecked: string; // Date or "None recorded" / "Unknown"
  previousDonationType: string; // "Whole blood" | "SDP" | "None" | "Unknown"
  preliminaryIntervalCheckStatus: IntervalCheckStatus;
  
  bookingStatus: BookingStatus;
  
  hospitalEligibilityConfirmed: 'Pending' | 'Yes' | 'No';
  hospitalConfirmationTimestamp?: string;
  
  actualDonationDate?: string; // Recorded only after completed
  actualDonationType?: SpecificDonationType;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  action: string;
  recordType: 'registration' | 'booking' | 'config';
  recordId: string;
  details: string;
  performedBy: string;
}

export interface CoordinationConfig {
  patientName: string;
  preliminaryWeightThresholdKg: number;
  wholeBloodIntervalDays: number; // 90 days default
  sdpIntervalDays: number; // 10 days default
  tattooDeferralMonths: number; // 6 months default
  planningWindowDaysMin: number;
  planningWindowDaysMax: number;
  timeSlots: string[];
  hospitalName: string;
  hospitalDepartment: string;
  coordinatorContact: string;
  coordinatorPin: string;
}
