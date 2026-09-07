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

export function App() {
  const [activeTab, setActiveTab] = useState<'patient' | 'admin'>('patient');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    // Escuta autenticação do usuário — authLoading fica true até o primeiro callback
    const unsubscribeAuth = subscribeAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      // Se acabou de logar, vai direto pro painel
      if (user) setActiveTab('admin');
    });

    // Escuta avaliações em tempo real
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Barra de Navegação */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Conteúdo Principal */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'patient' && <EvaluationForm />}

        {activeTab === 'admin' && (
          <>
            {authLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
              </div>
            ) : !currentUser ? (
              <AuthModal onSuccessAuth={() => {/* subscribeAuth já redireciona */}} />
            ) : (
              <AdminDashboard
                evaluations={evaluations}
                onRefreshData={() => {}}
              />
            )}
          </>
        )}
      </main>

      {/* Rodapé Informativo */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} FisioFeedback — Sistema de Avaliação de Fisioterapia</p>
          <div className="flex items-center gap-3">
            {isFirebaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                🔥 Firebase Auth & Firestore Ativos
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
