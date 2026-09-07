import React, { useState } from 'react';
import {
  UserPlus,
  LogIn,
  KeyRound,
  Mail,
  Lock,
  User,
  Clock,
  Building2,
  Stethoscope,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { SignUpData, LocationOption, ClinicTypeOption } from '../types/user';
import { signUpUser, loginUser, sendResetPasswordEmailAsync } from '../services/authService';

interface AuthModalProps {
  onSuccessAuth: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccessAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');

  // Campos Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Campos Cadastro
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [location, setLocation] = useState<LocationOption>('boa_viagem');
  const [workStartTime, setWorkStartTime] = useState('08:00');
  const [workEndTime, setWorkEndTime] = useState('17:00');
  const [clinicType, setClinicType] = useState<ClinicTypeOption>('esportivo');

  // Campos Reset
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await loginUser(loginEmail, loginPassword);
      onSuccessAuth();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar login';
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
        setErrorMsg('Email ou senha incorretos.');
      } else if (message.includes('auth/user-not-found')) {
        setErrorMsg('Usuário não encontrado.');
      } else {
        setErrorMsg(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: SignUpData = {
        fullName,
        email: signupEmail,
        password: signupPassword,
        location,
        workStartTime,
        workEndTime,
        clinicType,
      };

      await signUpUser(payload);
      onSuccessAuth();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      if (message.includes('auth/email-already-in-use')) {
        setErrorMsg('Este email já está cadastrado.');
      } else {
        setErrorMsg(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await sendResetPasswordEmailAsync(resetEmail);
      setResetSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar email';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
      {/* Abas Superiores */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-teal-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Conta</span>
          </button>
        </div>

        {mode !== 'reset' && (
          <button
            type="button"
            onClick={() => {
              setMode('reset');
              setErrorMsg('');
              setResetSuccess(false);
            }}
            className="text-[11px] font-medium text-teal-600 hover:underline"
          >
            Esqueci a senha
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Formulário 1: LOGIN */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Acesso ao Painel ADM</h2>
            <p className="text-xs text-slate-500">Entre com suas credenciais de profissional</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Profissional</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seu.email@fisioterapia.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-800 outline-none text-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-800 outline-none text-slate-800 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {isLoading ? <span>Entrando...</span> : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Formulário 2: CRIAR CONTA (CADASTRO) */}
      {mode === 'signup' && (
        <form onSubmit={handleSignUpSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Cadastro de Fisioterapeuta</h2>
            <p className="text-xs text-slate-500">Crie sua conta para gerenciar atendimentos e métricas</p>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Dra. Ana Paula Silva"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha (Mínimo 6 caracteres)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Sede */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Sede de Atendimento</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as LocationOption)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 text-sm"
            >
              <option value="boa_viagem">Boa Viagem</option>
              <option value="poco_da_panela">Poço da Panela</option>
            </select>
          </div>

          {/* Horário de Atendimento (Inicial e Final) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Horário Inicial</span>
              </label>
              <input
                type="time"
                required
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Horário Final</span>
              </label>
              <input
                type="time"
                required
                value={workEndTime}
                onChange={(e) => setWorkEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Tipo Ambulatório */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Tipo de Ambulatório</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setClinicType('esportivo')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  clinicType === 'esportivo'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>Esportivo</span>
              </button>

              <button
                type="button"
                onClick={() => setClinicType('ambulatorio')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  clinicType === 'ambulatorio'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>Ambulatório</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm mt-4"
          >
            {isLoading ? <span>Cadastrando...</span> : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Criar Minha Conta</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Formulário 3: ESQUECI MINHA SENHA */}
      {mode === 'reset' && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Redefinir Senha</h2>
            <p className="text-xs text-slate-500">
              Digite seu email cadastrado para receber um link de redefinição
            </p>
          </div>

          {resetSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p>Email de redefinição enviado com sucesso para <strong className="font-bold">{resetEmail}</strong>!</p>
              <p className="text-[11px] text-slate-500">Verifique sua caixa de entrada ou de spam.</p>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="inline-block mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
              >
                Voltar para o Login
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Registrado</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isLoading ? <span>Enviando...</span> : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Enviar Link de Redefinição</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-2 block"
              >
                Voltar para o Login
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
};
