import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EvaluationForm } from './components/EvaluationForm';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Evaluation } from './types/evaluation';
import { UserProfile } from './types/user';
import { subscribeEvaluations } from './services/storage';
import { subscribeAuth, logoutUserAsync } from './services/authService';
import { isFirebaseConfigured } from './services/firebase';
import { isWithinWorkingHours } from './utils/timeCheck';

export function App() {
  const [activeTab, setActiveTab] = useState<'patient' | 'admin'>('patient');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const canAccessPatientTab = currentUser ? isWithinWorkingHours(currentUser.workStartTime, currentUser.workEndTime) : false;

  useEffect(() => {
    if (currentUser && !canAccessPatientTab && activeTab === 'patient') {
      setActiveTab('admin');
    }
  }, [currentUser, canAccessPatientTab, activeTab]);

  useEffect(() => {
    const unsubscribeAuth = subscribeAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    const unsubscribeEvaluations = subscribeEvaluations((data) => {
      setEvaluations(data);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeEvaluations();
    };
  }, []);

  const handleLogout = async () => {
    await logoutUserAsync();
    setCurrentUser(null);
    setActiveTab('patient');
  };

  // ─── Carregando sessão ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
          <p className="text-sm text-slate-500 font-medium">Verificando sessão…</p>
        </div>
      </div>
    );
  }

  // ─── Portão de login — ninguém acessa sem estar autenticado ──────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
            <div>
              <span className="text-xl font-bold text-black tracking-tight">
                FisioFeedback
              </span>
              <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider block w-max mt-0.5">
                Sistema de Avaliação
              </span>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Bem-vindo(a)!</h1>
              <p className="text-slate-500 mt-1 text-sm">
                Faça login para acessar o sistema de avaliações.
              </p>
            </div>
            <AuthModal onSuccessAuth={() => {}} />
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FisioFeedback — Sistema de Avaliação de Fisioterapia
        </footer>
      </div>
    );
  }

  // ─── App principal (usuário autenticado) ──────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onLogout={handleLogout}
        canAccessPatientTab={canAccessPatientTab}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'patient' && <EvaluationForm />}
        {activeTab === 'admin' && (
          <AdminDashboard
            evaluations={evaluations}
            onRefreshData={() => {}}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} FisioFeedback — Sistema de Avaliação de Fisioterapia</p>
          <div className="flex items-center gap-3">
            {isFirebaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                🔥 Firebase Auth &amp; Firestore Ativos
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[11px]">
                ⚡ Modo LocalStorage
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
