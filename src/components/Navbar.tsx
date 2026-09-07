import React from 'react';
import {
  Stethoscope,
  ClipboardList,
  LogOut,
  UserCheck,
  Building2,
  Clock,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types/user';

interface NavbarProps {
  activeTab: 'patient' | 'admin';
  setActiveTab: (tab: 'patient' | 'admin') => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  canAccessPatientTab?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  canAccessPatientTab = true,
}) => {
  const formatLocation = (loc: string) => {
    return loc === 'boa_viagem' ? 'Boa Viagem' : 'Poço da Panela';
  };

  const formatClinic = (clinic: string) => {
    return clinic === 'esportivo' ? 'Esportivo' : 'Ambulatório';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Marca */}
          <div
            className={`flex items-center space-x-3 ${canAccessPatientTab ? 'cursor-pointer' : ''}`}
            onClick={() => canAccessPatientTab && setActiveTab('patient')}
          >
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-md shadow-teal-600/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                Fisio<span className="text-teal-600">Feedback</span>
              </span>
              <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider block w-max">
                {currentUser ? formatLocation(currentUser.location) : 'Piloto'}
              </span>
            </div>
          </div>

          {/* User Profile Badge (se logado) */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700">
              <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 leading-none">{currentUser.fullName}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-0.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {formatLocation(currentUser.location)} ({formatClinic(currentUser.clinicType)})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {currentUser.workStartTime} - {currentUser.workEndTime}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nav Tabs */}
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => canAccessPatientTab && setActiveTab('patient')}
              disabled={!canAccessPatientTab}
              title={!canAccessPatientTab ? "Fora do horário de atendimento" : ""}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'patient'
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm border border-teal-200'
                  : !canAccessPatientTab
                  ? 'text-slate-400 bg-slate-50 cursor-not-allowed border border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {canAccessPatientTab ? (
                <ClipboardList className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
              <span>Avaliações</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Painel ADM</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              onClick={onLogout}
              title="Sair da conta"
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg font-medium transition-colors border border-rose-200 ml-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
