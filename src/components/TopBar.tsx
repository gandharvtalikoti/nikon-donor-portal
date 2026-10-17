import React from 'react';
import { Heart, Lock, ShieldCheck, UserCheck } from 'lucide-react';

interface TopBarProps {
  currentView: 'donor' | 'coordinator';
  onNavigate: (view: 'donor' | 'coordinator') => void;
  isCoordinatorAuthenticated: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  isCoordinatorAuthenticated,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single element, no trailing pills) */}
        <button
          type="button"
          onClick={() => onNavigate('donor')}
          className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-rose-700 transition-colors">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Nikon Donor Portal
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('donor')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'donor' ? 'text-rose-700 font-bold' : ''
            }`}
          >
            Donor Registration
          </button>
          <a
            href="#screening-guidelines"
            onClick={(e) => {
              if (currentView !== 'donor') {
                e.preventDefault();
                onNavigate('donor');
              }
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Eligibility & Intervals
          </a>
          <a
            href="#faq"
            onClick={(e) => {
              if (currentView !== 'donor') {
                e.preventDefault();
                onNavigate('donor');
              }
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Platelet (SDP) Guide
          </a>
        </nav>

        {/* Zone 3: 1 Primary contextual action */}
        <div className="flex items-center gap-2 shrink-0">
          {currentView === 'donor' ? (
            <button
              type="button"
              onClick={() => onNavigate('coordinator')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>{isCoordinatorAuthenticated ? 'Coordinator Portal' : 'Coordinator Login'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('donor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-xs shadow-rose-600/20"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Back to Donor Form</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
