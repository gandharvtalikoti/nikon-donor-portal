import React, { useState } from 'react';
import {
  AdminActivityLog,
  CoordinationConfig,
  DonationBooking,
  DonorRegistration,
  SpecificDonationType,
} from '../../types';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  History,
  Lock,
  Heart,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { RegistrationsSheetView } from './RegistrationsSheetView';
import { BookingsManagementView } from './BookingsManagementView';
import { ActivityAuditLogView } from './ActivityAuditLogView';
import { GoogleSheetsExportModal } from './GoogleSheetsExportModal';
import { CoordinatorConfigModal } from './CoordinatorConfigModal';

interface CoordinatorDashboardProps {
  registrations: DonorRegistration[];
  bookings: DonationBooking[];
  logs: AdminActivityLog[];
  config: CoordinationConfig;
  onUpdateRegistration: (id: string, updates: Partial<DonorRegistration>) => void;
  onUpdateBooking: (id: string, updates: Partial<DonationBooking>, logReason: string) => void;
  onRecordCompletedDonation: (
    id: string,
    actualDate: string,
    actualType: SpecificDonationType,
    notes: string
  ) => void;
  onSaveConfig: (updated: CoordinationConfig) => void;
  onResetDemoData: () => void;
  onLockCoordinator: () => void;
  onBackToRegistrationForm: () => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  registrations,
  bookings,
  logs,
  config,
  onUpdateRegistration,
  onUpdateBooking,
  onRecordCompletedDonation,
  onSaveConfig,
  onResetDemoData,
  onLockCoordinator,
  onBackToRegistrationForm,
}) => {
  const [activeTab, setActiveTab] = useState<'registrations' | 'bookings' | 'audit'>('bookings');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Calculate quick metrics
  const totalRegistrations = registrations.length;
  const requiresReviewCount = registrations.filter(
    (r) => r.eligibilityReviewStatus === 'Requires blood bank review'
  ).length;
  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'Confirmed appointment').length;
  const completedCount = bookings.filter((b) => b.bookingStatus === 'Donation completed').length;
  const awaitingHospitalCount = bookings.filter(
    (b) => b.bookingStatus === 'Awaiting hospital confirmation'
  ).length;

  return (
    <div className="space-y-6">
      {/* Coordinator Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
            <span>Family Coordination Portal</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 font-normal">Patient: {config.patientName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hospital Blood & Platelet Schedule Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {config.hospitalName} · Transfusion Medicine Apheresis Unit
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Google Sheets Export</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Settings & Rule Thresholds"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onLockCoordinator}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Lock Portal"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Registrations
          </span>
          <span className="text-2xl font-bold text-slate-900 block mt-1">
            {totalRegistrations}
          </span>
          <span className="text-[10px] text-slate-400">Total voluntary signups</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Needs Review
          </span>
          <span className="text-2xl font-bold text-amber-700 block mt-1">
            {requiresReviewCount}
          </span>
          <span className="text-[10px] text-amber-700">Interval / clinical checks</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
            Awaiting Hospital
          </span>
          <span className="text-2xl font-bold text-blue-700 block mt-1">
            {awaitingHospitalCount}
          </span>
          <span className="text-[10px] text-blue-600">Blood bank scheduling</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Confirmed Slots
          </span>
          <span className="text-2xl font-bold text-emerald-700 block mt-1">
            {confirmedCount}
          </span>
          <span className="text-[10px] text-emerald-600">Reserved appointments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
            Completed Units
          </span>
          <span className="text-2xl font-bold text-rose-700 block mt-1">
            {completedCount}
          </span>
          <span className="text-[10px] text-rose-600">Actual collections</span>
        </div>
      </div>

      {/* Main Tabbed Sheets Interface */}
      <div className="space-y-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl max-w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Donation Bookings ({bookings.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'registrations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Donor Registrations ({registrations.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activity Audit Log ({logs.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'bookings' && (
          <BookingsManagementView
            bookings={bookings}
            onUpdateBooking={onUpdateBooking}
            onRecordCompletedDonation={onRecordCompletedDonation}
            onOpenSheetsExport={() => setIsExportOpen(true)}
          />
        )}

        {activeTab === 'registrations' && (
          <RegistrationsSheetView
            registrations={registrations}
            onUpdateRegistration={onUpdateRegistration}
            onOpenSheetsExport={() => setIsExportOpen(true)}
          />
        )}

        {activeTab === 'audit' && <ActivityAuditLogView logs={logs} />}
      </div>

      {/* Modals */}
      <GoogleSheetsExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        registrations={registrations}
        bookings={bookings}
      />

      <CoordinatorConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSaveConfig={onSaveConfig}
        onResetDemoData={onResetDemoData}
      />
    </div>
  );
};
