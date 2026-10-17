import React, { useState, useEffect } from 'react';
import {
  AdminActivityLog,
  BloodGroup,
  BookingStatus,
  ContactMethod,
  CoordinationConfig,
  DonationBooking,
  DonationTypePreference,
  DonorRegistration,
  FeelingWellOption,
  FoodHydrationOption,
  LastSdpOption,
  LastWholeBloodOption,
  SpecificDonationType,
  TattooOption,
  WeightRange,
  YesNoUnsure,
} from './types';
import {
  checkDuplicateBooking,
  DEFAULT_CONFIG,
  evaluateEligibility,
  getAgeCategory,
  normalizePhone,
} from './lib/coordinationEngine';
import {
  getStoredBookings,
  getStoredConfig,
  getStoredLogs,
  getStoredRegistrations,
  resetAllDataToDefault,
  saveBookings,
  saveConfig,
  saveLogs,
  saveRegistrations,
} from './lib/storage';
import { TopBar } from './components/TopBar';
import { DonorAppealBanner } from './components/DonorAppealBanner';
import { WizardProgress } from './components/RegistrationWizard/WizardProgress';
import { Step1PersonalDetails } from './components/RegistrationWizard/Step1PersonalDetails';
import { Step2DonationType } from './components/RegistrationWizard/Step2DonationType';
import { Step3EligibilityScreening } from './components/RegistrationWizard/Step3EligibilityScreening';
import { Step4Availability } from './components/RegistrationWizard/Step4Availability';
import { Step5ConsentSubmission } from './components/RegistrationWizard/Step5ConsentSubmission';
import { RegistrationSuccess } from './components/RegistrationWizard/RegistrationSuccess';
import { CoordinatorDashboard } from './components/CoordinatorPortal/CoordinatorDashboard';
import { AdminAuthModal } from './components/CoordinatorPortal/AdminAuthModal';
import { ScreeningGuidelinesCard } from './components/ScreeningGuidelinesCard';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentView, setCurrentView] = useState<'donor' | 'coordinator'>('donor');
  const [isCoordinatorAuthenticated, setIsCoordinatorAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Repository state
  const [registrations, setRegistrations] = useState<DonorRegistration[]>([]);
  const [bookings, setBookings] = useState<DonationBooking[]>([]);
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [config, setConfig] = useState<CoordinationConfig>(DEFAULT_CONFIG);

  // Form Wizard State
  const [step, setStep] = useState(1);
  const [submittedReg, setSubmittedReg] = useState<DonorRegistration | null>(null);
  const [submittedBkg, setSubmittedBkg] = useState<DonationBooking | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default initial date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Wizard form data
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    mobileNumber: '+91 ',
    bloodGroup: 'Unknown' as BloodGroup,
    preferredContact: 'WhatsApp' as ContactMethod,
    alternatePhone: '',
    emailAddress: '',

    // Step 2
    donationType: 'Single Donor Platelets (SDP)' as DonationTypePreference,

    // Step 3
    ageYears: 26 as number | null,
    ageCategory: '18–59' as any,
    weightRange: '60 kg or above' as WeightRange,
    feelsWellToday: 'Yes, I feel well' as FeelingWellOption,
    foodAndHydration: 'Yes' as FoodHydrationOption,

    lastWholeBloodOption: 'Never donated before' as LastWholeBloodOption,
    lastWholeBloodDate: '',

    lastSdpOption: 'Never donated SDP before' as LastSdpOption,
    lastSdpDate: '',

    otherDonationOrDeferral: 'No' as YesNoUnsure,
    otherDonationOrDeferralNote: '',

    tattooPiercing: 'No' as TattooOption,
    tattooDate: '',

    feverInfection: 'No' as YesNoUnsure,
    medicationTreatment: 'No' as YesNoUnsure,
    surgeryTransfusion: 'No' as YesNoUnsure,
    travelInfection: 'No' as YesNoUnsure,

    // Step 4
    preferredDate: tomorrowStr,
    preferredTimeSlot: '10:00 AM – 11:00 AM',
    availabilityNote: '',

    // Step 5
    consentAccurateInfo: false,
    consentPreliminaryOnly: false,
    consentContactByFamily: false,
  });

  // Load persistent store on mount
  useEffect(() => {
    setRegistrations(getStoredRegistrations());
    setBookings(getStoredBookings());
    setLogs(getStoredLogs());
    setConfig(getStoredConfig());
  }, []);

  const handleUpdateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      // If blood group is changed to non-A+, ensure Whole Blood or Either auto-switches to SDP
      if (next.bloodGroup !== 'A+' && (next.donationType === 'Whole blood' || next.donationType.includes('Either'))) {
        next.donationType = 'Single Donor Platelets (SDP)';
      }
      return next;
    });
    setErrors({});
  };

  const handleNavigateView = (view: 'donor' | 'coordinator') => {
    if (view === 'coordinator') {
      if (isCoordinatorAuthenticated) {
        setCurrentView('coordinator');
      } else {
        setIsAuthModalOpen(true);
      }
    } else {
      setCurrentView('donor');
    }
  };

  const handleCoordinatorAuth = (enteredPin: string): boolean => {
    if (enteredPin === config.coordinatorPin) {
      setIsCoordinatorAuthenticated(true);
      setCurrentView('coordinator');
      return true;
    }
    return false;
  };

  // Step validation
  const validateStep = (currentStepNum: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStepNum === 1) {
      if (!formData.fullName.trim()) {
        errs.fullName = 'Please enter your full name.';
      }
      const rawMobile = formData.mobileNumber.replace(/\D/g, '');
      if (rawMobile.length < 10) {
        errs.mobileNumber = 'Please enter a valid 10-digit mobile number.';
      }
      if (!formData.bloodGroup) {
        errs.bloodGroup = 'Please select a blood group (or Unknown).';
      }
    } else if (currentStepNum === 2) {
      if (formData.donationType === 'Whole blood' && formData.bloodGroup !== 'A+') {
        errs.donationType = `For Whole Blood donation, the donor HAS TO BE A+ (mandatory for Nikon). For Single Donor Platelets (SDP), any blood group is fine! Please select Single Donor Platelets (SDP).`;
      } else if (formData.donationType.includes('Either') && formData.bloodGroup !== 'A+') {
        errs.donationType = `Whole Blood requires mandatory A+ blood group. Since your blood group is ${formData.bloodGroup}, please choose Single Donor Platelets (SDP), where any blood group is fine!`;
      }
    } else if (currentStepNum === 3) {
      if (formData.ageYears === null || isNaN(formData.ageYears)) {
        errs.ageYears = 'Please enter your age in completed years.';
      }
    } else if (currentStepNum === 4) {
      if (!formData.preferredDate) {
        errs.preferredDate = 'Please select a preferred donation date.';
      }
      if (!formData.preferredTimeSlot) {
        errs.preferredTimeSlot = 'Please select a time slot.';
      }
    } else if (currentStepNum === 5) {
      if (
        !formData.consentAccurateInfo ||
        !formData.consentPreliminaryOnly ||
        !formData.consentContactByFamily
      ) {
        errs.consents = 'Please check all three required acknowledgments to proceed.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form submission handler
  const handleRegisterAvailability = () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Run full preliminary screening
      const screening = evaluateEligibility(formData, config);

      // 2. Check for duplicate active booking
      const duplicate = checkDuplicateBooking(formData.mobileNumber, bookings);
      if (duplicate.hasActiveBooking && duplicate.activeBooking) {
        setErrors({
          consents: `You already hold an active booking on ${duplicate.activeBooking.bookingDate} (${duplicate.activeBooking.timeSlot}). A donor may have only one active booking at a time. Please contact our coordinator to reschedule.`,
        });
        setIsSubmitting(false);
        return;
      }

      const nowIso = new Date().toISOString();
      const newRegId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBkgId = `BKG-2026-${Math.floor(500 + Math.random() * 500)}`;

      // 3. Create new Registration object
      const newRegistration: DonorRegistration = {
        id: newRegId,
        registeredAt: nowIso,
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        bloodGroup: formData.bloodGroup,
        preferredContact: formData.preferredContact,
        alternatePhone: formData.alternatePhone.trim() || undefined,
        emailAddress: formData.emailAddress.trim() || undefined,
        donationType: formData.donationType,
        ageYears: formData.ageYears,
        ageCategory: getAgeCategory(formData.ageYears),
        weightRange: formData.weightRange,
        feelsWellToday: formData.feelsWellToday,
        foodAndHydration: formData.foodAndHydration,
        lastWholeBloodOption: formData.lastWholeBloodOption,
        lastWholeBloodDate: formData.lastWholeBloodDate || undefined,
        lastSdpOption: formData.lastSdpOption,
        lastSdpDate: formData.lastSdpDate || undefined,
        otherDonationOrDeferral: formData.otherDonationOrDeferral,
        otherDonationOrDeferralNote: formData.otherDonationOrDeferralNote || undefined,
        tattooPiercing: formData.tattooPiercing,
        tattooDate: formData.tattooDate || undefined,
        feverInfection: formData.feverInfection,
        medicationTreatment: formData.medicationTreatment,
        surgeryTransfusion: formData.surgeryTransfusion,
        travelInfection: formData.travelInfection,
        eligibilityReviewStatus: screening.reviewStatus,
        eligibilityReviewNotes: screening.notes,
        requiresReview: screening.requiresReview,
        earliestEligibleDate: screening.earliestEligibleDate,
        preferredDate: formData.preferredDate,
        preferredTimeSlot: formData.preferredTimeSlot,
        availabilityNote: formData.availabilityNote || undefined,
        consentAccurateInfo: formData.consentAccurateInfo,
        consentPreliminaryOnly: formData.consentPreliminaryOnly,
        consentContactByFamily: formData.consentContactByFamily,
        donorConsentTimestamp: nowIso,
      };

      // 4. Derive initial booking status:
      // Never "Approved to donate"! Distinguish: "Availability registered" vs "Eligibility review required"
      const initialBookingStatus: BookingStatus = screening.requiresReview
        ? 'Eligibility review required'
        : 'Availability registered';

      const specificType: SpecificDonationType =
        formData.donationType === 'Single Donor Platelets (SDP)' || formData.bloodGroup !== 'A+'
          ? 'Single Donor Platelets (SDP)'
          : 'Whole blood';

      const prevDateChecked =
        formData.lastWholeBloodDate ||
        formData.lastSdpDate ||
        (formData.lastWholeBloodOption.includes('Never') && formData.lastSdpOption.includes('Never')
          ? 'None recorded (First time donor)'
          : 'Needs verification');

      const newBooking: DonationBooking = {
        id: newBkgId,
        registrationId: newRegId,
        donorFullName: formData.fullName.trim(),
        donorMobile: formData.mobileNumber.trim(),
        bloodGroup: formData.bloodGroup,
        bookingDate: formData.preferredDate,
        timeSlot: formData.preferredTimeSlot,
        donationType: specificType,
        previousDonationDateChecked: prevDateChecked,
        previousDonationType: formData.lastSdpDate ? 'SDP' : formData.lastWholeBloodDate ? 'Whole blood' : 'Unknown',
        preliminaryIntervalCheckStatus: screening.intervalStatus,
        bookingStatus: initialBookingStatus,
        hospitalEligibilityConfirmed: 'Pending',
        notes: screening.notes.length > 0 ? screening.notes.join('; ') : 'Preliminary screening completed online.',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      // 5. Update state and storage
      const updatedRegs = [newRegistration, ...registrations];
      const updatedBkgs = [newBooking, ...bookings];

      const newLog: AdminActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp: nowIso,
        action: 'New Registration Submitted',
        recordType: 'registration',
        recordId: newRegId,
        details: `Donor ${newRegistration.fullName} registered for ${newRegistration.donationType} on ${newRegistration.preferredDate}. Status: ${initialBookingStatus}.`,
        performedBy: 'Donor Form Intake',
      };

      const updatedLogs = [newLog, ...logs];

      setRegistrations(updatedRegs);
      setBookings(updatedBkgs);
      setLogs(updatedLogs);

      saveRegistrations(updatedRegs);
      saveBookings(updatedBkgs);
      saveLogs(updatedLogs);

      setSubmittedReg(newRegistration);
      setSubmittedBkg(newBooking);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  const handleResetRegistrationForm = () => {
    setSubmittedReg(null);
    setSubmittedBkg(null);
    setStep(1);
    setFormData((prev) => ({
      ...prev,
      fullName: '',
      mobileNumber: '+91 ',
      alternatePhone: '',
      emailAddress: '',
      consentAccurateInfo: false,
      consentPreliminaryOnly: false,
      consentContactByFamily: false,
    }));
  };

  // Coordinator state updaters
  const handleUpdateRegistration = (id: string, updates: Partial<DonorRegistration>) => {
    const updated = registrations.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setRegistrations(updated);
    saveRegistrations(updated);

    const logEntry: AdminActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Registration Updated',
      recordType: 'registration',
      recordId: id,
      details: `Coordinator updated review status/notes for registration ${id}.`,
      performedBy: 'Family Coordinator',
    };
    const updatedLogs = [logEntry, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  };

  const handleUpdateBooking = (
    id: string,
    updates: Partial<DonationBooking>,
    logReason: string
  ) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBookings(updated);
    saveBookings(updated);

    const logEntry: AdminActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Booking Status/Date Changed',
      recordType: 'booking',
      recordId: id,
      details: logReason,
      performedBy: 'Family Coordinator',
    };
    const updatedLogs = [logEntry, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  };

  const handleRecordCompletedDonation = (
    id: string,
    actualDate: string,
    actualType: SpecificDonationType,
    notes: string
  ) => {
    const nowIso = new Date().toISOString();
    const updated = bookings.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          bookingStatus: 'Donation completed' as BookingStatus,
          hospitalEligibilityConfirmed: 'Yes' as const,
          actualDonationDate: actualDate,
          actualDonationType: actualType,
          notes: notes ? `${b.notes || ''} | Completed: ${notes}` : b.notes,
          updatedAt: nowIso,
        };
      }
      return b;
    });

    setBookings(updated);
    saveBookings(updated);

    const targetBooking = bookings.find((b) => b.id === id);
    const donorName = targetBooking?.donorFullName || id;

    const logEntry: AdminActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: nowIso,
      action: 'Donation Completed Recorded',
      recordType: 'booking',
      recordId: id,
      details: `Recorded completed donation for ${donorName}: ${actualType} on ${actualDate}. (Previous booking closed, historical interval updated).`,
      performedBy: 'Family Coordinator',
    };
    const updatedLogs = [logEntry, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  };

  const handleSaveConfig = (updated: CoordinationConfig) => {
    setConfig(updated);
    saveConfig(updated);

    const logEntry: AdminActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Config Updated',
      recordType: 'config',
      recordId: 'SETTINGS',
      details: `Coordinator updated preliminary weight threshold (${updated.preliminaryWeightThresholdKg}kg), intervals (WB ${updated.wholeBloodIntervalDays}d, SDP ${updated.sdpIntervalDays}d).`,
      performedBy: 'Family Coordinator',
    };
    const updatedLogs = [logEntry, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  };

  const handleResetDemoData = () => {
    resetAllDataToDefault();
    setRegistrations(getStoredRegistrations());
    setBookings(getStoredBookings());
    setLogs(getStoredLogs());
    setConfig(getStoredConfig());
  };

  const currentScreening = evaluateEligibility(formData, config);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar with Single-Line wordmark & Coordinator Access */}
      <TopBar
        currentView={currentView}
        onNavigate={handleNavigateView}
        isCoordinatorAuthenticated={isCoordinatorAuthenticated}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === 'coordinator' ? (
          <CoordinatorDashboard
            registrations={registrations}
            bookings={bookings}
            logs={logs}
            config={config}
            onUpdateRegistration={handleUpdateRegistration}
            onUpdateBooking={handleUpdateBooking}
            onRecordCompletedDonation={handleRecordCompletedDonation}
            onSaveConfig={handleSaveConfig}
            onResetDemoData={handleResetDemoData}
            onLockCoordinator={() => {
              setIsCoordinatorAuthenticated(false);
              setCurrentView('donor');
            }}
            onBackToRegistrationForm={() => setCurrentView('donor')}
          />
        ) : submittedReg ? (
          <RegistrationSuccess
            registration={submittedReg}
            booking={submittedBkg || undefined}
            config={config}
            onReset={handleResetRegistrationForm}
          />
        ) : (
          <div className="space-y-6">
            {/* Urgent Patient Appeal Card */}
            <DonorAppealBanner config={config} />

            {/* Main Form Container Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs">
              {/* Step Progress Indicator */}
              <WizardProgress currentStep={step} totalSteps={5} onStepClick={(s) => setStep(s)} />

              {/* Step Content */}
              {step === 1 && (
                <Step1PersonalDetails
                  data={{
                    fullName: formData.fullName,
                    mobileNumber: formData.mobileNumber,
                    bloodGroup: formData.bloodGroup,
                    preferredContact: formData.preferredContact,
                    alternatePhone: formData.alternatePhone,
                    emailAddress: formData.emailAddress,
                  }}
                  onChange={handleUpdateFormData}
                  errors={errors}
                />
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Step2DonationType
                    value={formData.donationType}
                    bloodGroup={formData.bloodGroup}
                    onChange={(val) => handleUpdateFormData({ donationType: val })}
                  />
                  {errors.donationType && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-semibold">
                      {errors.donationType}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <Step3EligibilityScreening
                  donationType={formData.donationType}
                  config={config}
                  data={{
                    ageYears: formData.ageYears,
                    ageCategory: formData.ageCategory,
                    weightRange: formData.weightRange,
                    feelsWellToday: formData.feelsWellToday,
                    foodAndHydration: formData.foodAndHydration,
                    lastWholeBloodOption: formData.lastWholeBloodOption,
                    lastWholeBloodDate: formData.lastWholeBloodDate,
                    lastSdpOption: formData.lastSdpOption,
                    lastSdpDate: formData.lastSdpDate,
                    otherDonationOrDeferral: formData.otherDonationOrDeferral,
                    otherDonationOrDeferralNote: formData.otherDonationOrDeferralNote,
                    tattooPiercing: formData.tattooPiercing,
                    tattooDate: formData.tattooDate,
                    feverInfection: formData.feverInfection,
                    medicationTreatment: formData.medicationTreatment,
                    surgeryTransfusion: formData.surgeryTransfusion,
                    travelInfection: formData.travelInfection,
                    preferredDate: formData.preferredDate,
                  }}
                  onChange={handleUpdateFormData}
                  errors={errors}
                />
              )}

              {step === 4 && (
                <Step4Availability
                  config={config}
                  donationType={formData.donationType}
                  mobileNumber={formData.mobileNumber}
                  existingBookings={bookings}
                  data={{
                    preferredDate: formData.preferredDate,
                    preferredTimeSlot: formData.preferredTimeSlot,
                    availabilityNote: formData.availabilityNote,
                  }}
                  screeningResult={currentScreening}
                  onChange={handleUpdateFormData}
                  errors={errors}
                />
              )}

              {step === 5 && (
                <Step5ConsentSubmission
                  data={{
                    fullName: formData.fullName,
                    mobileNumber: formData.mobileNumber,
                    bloodGroup: formData.bloodGroup,
                    donationType: formData.donationType,
                    preferredDate: formData.preferredDate,
                    preferredTimeSlot: formData.preferredTimeSlot,
                    consentAccurateInfo: formData.consentAccurateInfo,
                    consentPreliminaryOnly: formData.consentPreliminaryOnly,
                    consentContactByFamily: formData.consentContactByFamily,
                  }}
                  screeningRequiresReview={currentScreening.requiresReview}
                  screeningReviewNotes={currentScreening.notes}
                  onChange={handleUpdateFormData}
                  onSubmit={handleRegisterAvailability}
                  isSubmitting={isSubmitting}
                  errors={errors}
                />
              )}

              {/* Wizard Nav Controls (Previous & Continue buttons) */}
              {step < 5 && (
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Step {step + 1}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Informational Guidance & FAQ Card */}
            <ScreeningGuidelinesCard config={config} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-medium">
          <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
          <span>Voluntary Blood & Platelet Donor Coordination for Nikon</span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-lg mx-auto px-4">
          All preliminary screening is subject to on-site medical evaluation and confirmatory viral testing by the hospital blood bank medical officer.
        </p>
        <div className="text-[11px] text-slate-400">
          Coordinator Helpline: {config.coordinatorContact} · {config.hospitalName}
        </div>
        <div className="pt-3 border-t border-slate-100 max-w-xl mx-auto px-4">
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            This portal is developed by Gandharv Talikoti a curious Software engineer with expereince in startup in Banglore, currently working on multiple things!
          </p>
        </div>
      </footer>

      {/* Coordinator PIN Authentication Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleCoordinatorAuth}
        correctPin={config.coordinatorPin}
      />
    </div>
  );
}
