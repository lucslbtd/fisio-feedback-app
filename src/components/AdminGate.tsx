import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminGateProps {
  onAuthenticate: () => void;
}

export const AdminGate: React.FC<AdminGateProps> = ({ onAuthenticate }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.trim().toUpperCase() === 'TESTE') {
      onAuthenticate();
    } else {
      setError('Código de autorização inválido! Dica: use o código TESTE');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-lg border border-slate-200 text-center">
      <div className="w-14 h-14 bg-slate-900 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
        <Lock className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-1">Área Administrativa</h2>
      <p className="text-xs text-slate-500 mb-6">
        Acesso restrito para administradores e fisioterapeutas responsáveis.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 text-left">
            Código de Autorização
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Digite o código (ex: TESTE)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none text-slate-900 text-sm tracking-wider font-mono uppercase"
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <span>Acessar Painel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
        Código de teste configurado: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono font-bold">TESTE</code>
      </div>
    </div>
  );
};
