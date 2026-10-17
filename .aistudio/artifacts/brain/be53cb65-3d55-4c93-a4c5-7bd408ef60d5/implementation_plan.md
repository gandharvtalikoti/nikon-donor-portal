# Nikon Blood & SDP Donor Registration & Coordination Portal

A mobile-first, compassionate blood and single-donor platelet (SDP) coordination system for patient Nikon. The application features a 5-step donor registration wizard with real-time eligibility screening, strict donation-interval checking, duplicate booking prevention, and a PIN-protected family coordinator dashboard with Google Sheets export.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during Phase 1 clarification:
> - **Storage & Synchronization**: Built-in reactive coordinator dashboard backed by persistent local storage with live, formatted Google Sheets export (CSV download and 1-click clipboard format matching the exact Google Sheets schema).
> - **Coordinator Access Control**: Secure family coordinator PIN/passkey gate (default `1974`, configurable) protecting all private donor contact information and eligibility responses.
> - **Patient Appeal Card**: A prominent, reassuring patient appeal card at the top of the donor registration form detailing Nikon's current medical requirement, hospital blood bank coordination context, and family helpline.

---

## 1. Overview & Core Concept

When a patient like Nikon requires whole blood and single-donor platelets (SDP), rapid coordination of compatible, well-rested donors is essential. Blood banks enforce strict biological deferral intervals (e.g., 3 months for whole blood, 10 days for SDP), and hospital teams need accurate preliminary data to schedule apheresis machines and collection beds without duplicate reservations or last-minute deferrals.

This application provides:
1. **Donor-Facing Registration Experience**: A lightweight, reassuring, mobile-first 5-step form designed for smartphones. It collects contact info, donation preferences, detailed preliminary eligibility responses, and a single preferred donation window.
2. **Transparent Screening, Not Medical Clearance**: Prominently distinguishes between preliminary family coordination flags and formal hospital blood bank medical clearance.
3. **Donation Frequency & Duplicate Booking Engine**: Automatically cross-references a donor's mobile number and donation history to prevent duplicate active bookings, calculate earliest eligible review dates, and flag interval conflicts.
4. **Authorized Coordinator Dashboard**: A secure portal for Nikon's family and coordination team to review registrations, confirm hospital requirements, record completed donations separately from bookings, log administrative corrections, and export data in exact Google Sheets schemas.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Aesthetic Direction**: Healthcare editorial & compassionate clinical utility. Grounded, calm, high-contrast, and deeply respectful.
- **Palette Tokens**:
  - Dominant Canvas: Crisp clean white (`#FFFFFF`) with subtle soft-slate undertone (`#F8FAFC`).
  - Structural Surfaces: Pure white elevated cards with hairline slate borders (`border-slate-200`) and soft shadows (`shadow-sm`).
  - Primary Accent: Deep clinical crimson / pomegranate (`#BE123C` / `rose-700`) representing blood donation vitality without harsh alarms.
  - Secondary Accents: Warm amber (`amber-600`) for "Requires Review" or "Awaiting Hospital Confirmation", gentle emerald (`emerald-600`) for "Confirmed Appointment" and "Donation Completed".
- **Typography**: Clean display headline with `Plus Jakarta Sans` or `Manrope`, balanced body prose, and `tabular-nums` for all dates, intervals, weights, and counts.
- **Thumb-Zone Touch Ergonomics**:
  - Minimum touch target: $\ge 48\text{px}$ for all primary buttons and interactive radio/checkbox rows.
  - Sticky bottom action bar on mobile with subtle blur (`backdrop-blur-md bg-white/90`) occupying $<15\%$ of mobile viewport.
  - Section progress indicator with step badges and readable stage names.

### Donor Flow (5-Step Form)

```
┌────────────────────────────────────────────────────────┐
│ [Nikon Emergency Appeal Card: Blood & SDP Need]        │
├────────────────────────────────────────────────────────┤
│ Step Progress: 1. Personal · 2. Type · 3. Screening    │
│                4. Availability · 5. Consent            │
├────────────────────────────────────────────────────────┤
│ [Active Step Form Card]                                │
│                                                        │
│  - Step 1: Name, +91 Phone, Blood Group, WhatsApp/Call │
│  - Step 2: Whole Blood / SDP / Either + Guidance       │
│  - Step 3: 12-Question Eligibility & Interval Check    │
│  - Step 4: Preferred Date (30-60d) + 1-Hour Time Slot  │
│  - Step 5: 3 Explicit Consents + Submission Button     │
│                                                        │
├────────────────────────────────────────────────────────┤
│ [Previous]                             [Continue / Submit]
└────────────────────────────────────────────────────────┘
```

#### Step Walkthrough
1. **Step 1: Personal Details**:
   - Full name, Mobile number (+91 default prefix with validation), Blood group dropdown/grid (`A+`, `A−`, `B+`, `B−`, `AB+`, `AB−`, `O+`, `O−`, `Unknown`), Preferred contact method (`WhatsApp`, `Phone call`, `Either`), optional alternate phone and email.
2. **Step 2: Donation Type**:
   - Radio selection: `Whole blood`, `Single Donor Platelets (SDP)`, `Either, depending on the current medical requirement`.
   - Explanatory guidance explaining hospital blood bank coordination and apheresis suitability.
3. **Step 3: Donor Eligibility & Safety Check**:
   - Header: **Donor Eligibility & Safety Check** with subtitle clarifying preliminary screening vs hospital final decision.
   - Part A (Basic): Age in completed years (with 18-59, <18, 60+ guidance), Body weight (with 60 kg family threshold notice, configurable by donation type), Feeling well today, Food and hydration today.
   - Part B (Donation intervals): Last whole-blood donation (Never, <3 months, $\ge$3 months, Unsure) + date picker; Last SDP donation (Never, <10 days, $\ge$10 days, Unsure) + date picker; Recent deferral or other components note.
   - Part C (Tattoos & Piercings): Within 6 months, $\ge$6 months, None + optional date.
   - Part D (General Health): Fever/infection, medications/treatment, surgery/transfusions/procedures, malaria/infection travel.
   - Real-time gentle guidance banner: If under 18, under 60 kg, or recent donation interval detected, displays the respectful "Requires blood bank review" note without disqualifying submission.
4. **Step 4: Date & Time Availability**:
   - Date picker restricted to next 30–60 days.
   - Single preferred time slot selector from coordinator slots (e.g., 9:00 AM – 10:00 AM up to 4:00 PM – 5:00 PM).
   - Availability note (e.g., "Can arrive 15 minutes early if needed").
5. **Step 5: Consent & Submission**:
   - 3 mandatory acknowledgment checkboxes.
   - Prominent button: **Register My Availability**.
   - Confirmation screen displaying the exact required message for Nikon's family review and hospital coordination.

---

## 3. Key Product Decisions & Trade-Offs

### 1. Dual Lifecycle Tracking (Registrations vs Bookings vs Completed Donations)
- **Chosen Approach**: Maintain two linked entities:
  - `DonorRegistration`: Captures the full intake submission, contact channels, and complete 15-field eligibility answers.
  - `DonationBooking`: Captures the specific scheduled slot, interval checks, hospital clearance status, and separate `actualDonationDate` and `actualDonationType`.
- **Why**: Conforming strictly to the prompt criteria: completed donations must be recorded separately from bookings; cancelled bookings must never count as completed donations; and multiple recurring bookings for the same donor are strictly blocked.

### 2. Client-Side Frequency & Duplicate Booking Rule Engine
- **Duplicate Rule 1**: A donor (identified by normalized phone number) cannot have more than 1 active confirmed booking (`Confirmed appointment` or `Awaiting hospital confirmation`).
- **Duplicate Rule 2**: If the donor previously completed a whole-blood donation within 90 days, or an SDP donation within 10 days of the requested booking date, the status is flagged as `Eligibility review required` with the reason logged.
- **Duplicate Rule 3**: If previous donation date is unknown, status is automatically marked `Donation history needs verification`.
- **Duplicate Rule 4**: Automatic conflict warning during Step 3 and Step 4 so donors know their date may be rescheduled respectfully.

### 3. Google Sheets Integration & Security
- **Chosen Approach**: Two dedicated views in the coordinator dashboard with complete schemas:
  - **Donor Registrations Sheet**: 15 specific fields including completed years, weight range, food/hydration, last dates, all screening answers, review status, and timestamp.
  - **Donation Bookings Sheet**: 7 specific booking fields including previous donation date checked, preliminary interval check status, hospital eligibility confirmation, and actual completion records.
  - Live export buttons: Instant `.csv` download for each sheet + "Copy Google Sheets Tabular Format" button for direct paste into Google Drive Sheets.
  - Privacy barrier: Public registration form never exposes existing donor data or other donors' medical screening answers.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Navigation Bar                              │
│  [Nikon Blood & Platelet Donor Portal]       [Donor Form | Admin Portal] │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          ▼                                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     Donor Registration View     │   │   Coordinator Admin Dashboard   │
│                                 │   │      (PIN Protected: 1974)      │
│ 1. Urgent Patient Appeal Card   │   ├─────────────────────────────────┤
│ 2. 5-Section Mobile Form Wizard │   │ • KPI Cards (Needs Review, etc) │
│ 3. Real-time Interval Guard     │   │ • Registrations Table (15 cols) │
│ 4. Clear Medical Disclaimers    │   │ • Bookings Table (7 cols)       │
│ 5. Submission Success State     │   │ • Status Transition Dialogs     │
└────────────────┬────────────────┘   │ • Record Completed Donations    │
                 │                    │ • Activity Audit Log            │
                 │                    │ • Export to Google Sheets / CSV │
                 ▼                    └────────────────┬────────────────┘
┌──────────────────────────────────────────────────────┴────────────────┐
│               Central Coordination Store (LocalStorage)               │
│  - registrations: DonorRegistration[]                                 │
│  - bookings: DonationBooking[]                                        │
│  - activityLog: AdminActivityLog[]                                    │
│  - config: AppCoordinationConfig (intervals, slots, threshold)        │
│  - verificationEngine (interval math, duplicate blocking)             │
└───────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy
- `src/App.tsx`: Main layout, view routing, persistent storage initialization with rich sample donor records for immediate testing.
- `src/components/DonorAppealBanner.tsx`: High-visibility patient bulletin with Nikon's current medical requirement, hospital info, and coordinator helpline.
- `src/components/RegistrationWizard/`:
  - `WizardProgress.tsx`: 5-step visual indicator with clean responsive labels.
  - `Step1PersonalDetails.tsx`: Name, phone, blood group buttons, contact preference.
  - `Step2DonationType.tsx`: Whole blood, SDP, Either, with educational context.
  - `Step3EligibilityScreening.tsx`: 12-question clinical screening checklist with real-time preliminary guidance.
  - `Step4Availability.tsx`: Date picker (30–60d), slot picker, note field.
  - `Step5ConsentSubmission.tsx`: 3 mandatory checkboxes and final submission trigger.
  - `RegistrationSuccess.tsx`: Verified submission feedback with exact wording.
- `src/components/CoordinatorPortal/`:
  - `AdminAuthModal.tsx`: Secure PIN/passkey gate (`1974`).
  - `RegistrationsSheetView.tsx`: Full 15-column table with search, blood-group filters, and review status actions.
  - `BookingsManagementView.tsx`: Duplicate prevention view, slot schedules, hospital confirmation triggers, and "Mark Donation Completed" modal.
  - `ActivityAuditLogView.tsx`: Timestamped trail of coordinator status changes and date adjustments.
  - `GoogleSheetsExportModal.tsx`: Generates clean CSV and TSV formats conforming to Google Sheets specs.
  - `CoordinatorConfigModal.tsx`: Allows adjusting preliminary weight threshold (e.g. 60 kg), WB gap (90 days), SDP gap (10 days), and active time slots.
- `src/lib/coordinationEngine.ts`: Core validation logic for interval computation, duplicate booking prevention, and status derivation.

---

## 5. Verification Plan

1. **Compilation Check**:
   - Run `compile_applet` to ensure TypeScript compilation, Tailwind CSS classes, and Lucide icon imports build with zero errors.
2. **Donor Registration Testing**:
   - Test Step 1: Input validation for name, +91 mobile phone, and blood group.
   - Test Step 2: Switch between Whole Blood, SDP, and Either to verify contextual prompt adjustments.
   - Test Step 3: Answer questions with recent donation dates (<3 months WB, <10 days SDP, recent tattoo, weight <60 kg) and verify that the system flags "Requires blood bank review" without blocking submission.
   - Test Step 4: Pick a valid future date and time slot.
   - Test Step 5: Check all 3 consent boxes and submit; verify the exact required thank-you text.
3. **Duplicate Booking & Interval Conflict Guard Testing**:
   - Attempt to book another slot for the same mobile number; verify that the system detects the active confirmed booking and enforces the 1-active-booking rule.
   - Test marking a previous donation as completed; verify that subsequent booking attempts calculate the correct earliest eligible date.
4. **Coordinator Dashboard & Google Sheets Export Testing**:
   - Access admin portal with PIN `1974`.
   - Inspect the 15-field Donor Registrations sheet and 7-field Bookings sheet.
   - Perform status updates (e.g. confirm hospital clearance, record completed donation) and check the activity log.
   - Export CSV and verify clipboard copy formatting for Google Sheets.
