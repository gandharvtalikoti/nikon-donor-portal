import React, { useState } from 'react';
import { CoordinationConfig } from '../../types';
import { Settings, X, Plus, Trash2, RotateCcw, Save } from 'lucide-react';

interface CoordinatorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CoordinationConfig;
  onSaveConfig: (updated: CoordinationConfig) => void;
  onResetDemoData: () => void;
}

export const CoordinatorConfigModal: React.FC<CoordinatorConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDemoData,
}) => {
  const [formData, setFormData] = useState<CoordinationConfig>({ ...config });
  const [newSlot, setNewSlot] = useState('');

  if (!isOpen) return null;

  const handleAddSlot = () => {
    if (!newSlot.trim()) return;
    if (!formData.timeSlots.includes(newSlot.trim())) {
      setFormData({
        ...formData,
        timeSlots: [...formData.timeSlots, newSlot.trim()],
      });
    }
    setNewSlot('');
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter((s) => s !== slotToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Coordinator & Rule Settings</h3>
              <p className="text-xs text-slate-500">
                Configure preliminary thresholds, interval parameters, and appointment slots.
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Patient and Hospital Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Name:</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coordinator Helpline:</label>
              <input
                type="text"
                value={formData.coordinatorContact}
                onChange={(e) => setFormData({ ...formData, coordinatorContact: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hospital Blood Centre:</label>
            <input
              type="text"
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
            />
          </div>

          {/* Configurable Thresholds */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Preliminary Interval & Weight Rules
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Preliminary Weight Threshold (kg):
                </label>
                <input
                  type="number"
                  min={45}
                  max={80}
                  value={formData.preliminaryWeightThresholdKg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preliminaryWeightThresholdKg: parseInt(e.target.value, 10) || 60,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white font-bold"
                />
                <span className="text-[10px] text-slate-400">Default: 60 kg</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Whole Blood Gap (Days):
                </label>
                <input
                  type="number"
                  min={30}
                  max={120}
                  value={formData.wholeBloodIntervalDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wholeBloodIntervalDays: parseInt(e.target.value, 10) || 90,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white font-bold"
                />
                <span className="text-[10px] text-slate-400">90 days (3 months)</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SDP Interval (Days):
                </label>
                <input
                  type="number"
                  min={7}
                  max={30}
                  value={formData.sdpIntervalDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sdpIntervalDays: parseInt(e.target.value, 10) || 10,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white font-bold"
                />
                <span className="text-[10px] text-slate-400">10 days gap</span>
              </div>
            </div>
          </div>

          {/* Configurable Predefined Time Slots */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Predefined Appointment Time Slots
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.timeSlots.map((slot) => (
                <span
                  key={slot}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold"
                >
                  <span>{slot}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                placeholder="e.g. 5:00 PM – 6:00 PM"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slot</span>
              </button>
            </div>
          </div>

          {/* Reset data */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all demo registrations and bookings to realistic sample records?')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="text-slate-500 hover:text-rose-600 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Records</span>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
