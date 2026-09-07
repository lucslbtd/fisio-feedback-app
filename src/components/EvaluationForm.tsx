import React, { useState } from 'react';
import {
  Star,
  Send,
  CheckCircle2,
  HeartHandshake,
  Sparkles,
  Activity,
  Zap,
  Dumbbell,
  Cpu,
  Layers,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { EvaluationFormData, PreferenceOption } from '../types/evaluation';
import { saveEvaluationAsync } from '../services/storage';

interface EvaluationFormProps {
  onSuccessSubmit?: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ onSuccessSubmit }) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feltPain, setFeltPain] = useState<boolean | null>(null);
  const [painInterfered, setPainInterfered] = useState<boolean | null>(null);
  const [feltImprovement, setFeltImprovement] = useState<boolean | null>(null);
  const [usedTens, setUsedTens] = useState<boolean | null>(null);
  const [preference, setPreference] = useState<PreferenceOption | null>(null);
  const [preferenceReason, setPreferenceReason] = useState('');
  const [comment, setComment] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const RATING_LABELS: Record<number, string> = {
    1: 'Muito insatisfeito',
    2: 'Insatisfeito',
    3: 'Regular / Neutro',
    4: 'Satisfeito',
    5: 'Excelente atendimento!',
  };

  const handlePainSelect = (val: boolean) => {
    setFeltPain(val);
    if (!val) {
      setPainInterfered(null);
    }
  };

  const handlePreferenceSelect = (val: PreferenceOption) => {
    setPreference(val);
    if (val === 'ambos') {
      setPreferenceReason('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (rating === 0) {
      setErrorMsg('Por favor, selecione uma nota de 1 a 5 estrelas para o atendimento de hoje.');
      return;
    }

    if (feltPain === null) {
      setErrorMsg('Por favor, responda se você sentiu dor durante ou após o atendimento.');
      return;
    }

    if (feltPain === true && painInterfered === null) {
      setErrorMsg('Por favor, responda se a dor sentida atrapalhou a sua sessão.');
      return;
    }

    if (feltImprovement === null) {
      setErrorMsg('Por favor, responda se tem sentido melhoras com os tratamentos.');
      return;
    }

    if (usedTens === null) {
      setErrorMsg('Por favor, responda se você utilizou TENS (eletroterapia) hoje.');
      return;
    }

    if (preference === null) {
      setErrorMsg('Por favor, selecione sua preferência entre exercícios ou aparelhos.');
      return;
    }

    const payload: EvaluationFormData = {
      name,
      rating,
      feltPain,
      painInterfered: feltPain ? painInterfered : null,
      feltImprovement,
      usedTens,
      preference,
      preferenceReason: preference === 'exercicios' || preference === 'aparelhos' ? preferenceReason : '',
      comment,
    };

    await saveEvaluationAsync(payload);
    setIsSubmitted(true);

    if (onSuccessSubmit) {
      onSuccessSubmit();
    }
  };

  const handleResetForm = () => {
    setName('');
    setRating(0);
    setHoveredRating(0);
    setFeltPain(null);
    setPainInterfered(null);
    setFeltImprovement(null);
    setUsedTens(null);
    setPreference(null);
    setPreferenceReason('');
    setComment('');
    setIsSubmitted(false);
    setErrorMsg('');
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-xl border border-teal-100 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Muito Obrigado pelo seu Feedback!</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Sua avaliação foi registrada com sucesso no sistema piloto. Ela é fundamental para continuarmos aprimorando nosso atendimento fisioterapêutico.
        </p>
        <button
          onClick={handleResetForm}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Enviar Nova Avaliação</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-3 bg-teal-100 text-teal-700 rounded-xl">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Avaliação do Atendimento Fisioterapêutico</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sua opinião nos ajuda a evoluir. O preenchimento leva menos de 1 minuto.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-center gap-2">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Nome e Sobrenome (opcional) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Nome e Sobrenome <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Maria Silva (ou deixe em branco para enviar anônimo)"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-800 placeholder:text-slate-400 text-sm transition-all"
          />
        </div>

        {/* 2. Avaliações em 1 até 5 estrelas */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Avalie como foi o atendimento de hoje <span className="text-rose-500">*</span>
          </label>

          <div className="flex items-center gap-2 my-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const activeStar = hoveredRating ? star <= hoveredRating : star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 focus:outline-none transition-transform transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      activeStar
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-slate-300 fill-slate-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {(hoveredRating > 0 || rating > 0) && (
            <p className="text-xs font-semibold text-teal-700 mt-1">
              {RATING_LABELS[hoveredRating || rating]}
            </p>
          )}
        </div>

        {/* 3. Pergunta Sim/Não - Dor */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Você sentiu dor durante ou após a sessão de hoje? <span className="text-rose-500">*</span></span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePainSelect(true)}
                className={`py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center gap-2 transition-all ${
                  feltPain === true
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>Sim, senti dor</span>
              </button>
              <button
                type="button"
                onClick={() => handlePainSelect(false)}
                className={`py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center gap-2 transition-all ${
                  feltPain === false
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>Não senti dor</span>
              </button>
            </div>
          </div>

          {/* Pergunta Condicional: Se sentiu dor */}
          {feltPain === true && (
            <div className="mt-4 pt-4 border-t border-rose-200/60 bg-rose-50/50 p-4 rounded-xl animate-fade-in">
              <label className="block text-xs font-semibold text-rose-900 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Você sente que essa dor atrapalhou a sessão? <span className="text-rose-600">*</span></span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPainInterfered(true)}
                  className={`py-2.5 px-3 rounded-lg font-medium text-xs border transition-all ${
                    painInterfered === true
                      ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>Sim, atrapalhou</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPainInterfered(false)}
                  className={`py-2.5 px-3 rounded-lg font-medium text-xs border transition-all ${
                    painInterfered === false
                      ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>Não atrapalhou</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Pergunta Sim/Não - Melhoras */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Você sente melhoras com os tratamentos? <span className="text-rose-500">*</span></span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFeltImprovement(true)}
              className={`py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center gap-2 transition-all ${
                feltImprovement === true
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>Sim, sinto melhoras</span>
            </button>
            <button
              type="button"
              onClick={() => setFeltImprovement(false)}
              className={`py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center gap-2 transition-all ${
                feltImprovement === false
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>Ainda não percebi melhoras</span>
            </button>
          </div>
        </div>

        {/* 5. Pergunta Sim/Não - Utilizou TENS? */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-500" />
            <span>Utilizou TENS (eletroterapia) na sessão de hoje? <span className="text-rose-500">*</span></span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUsedTens(true)}
              className={`py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center gap-2 transition-all ${
                usedTens === true
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>Sim, utilizou</span>
            </button>
            <button
              type="button"
              onClick={() => setUsedTens(false)}
              className={`py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center gap-2 transition-all ${
                usedTens === false
                  ? 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/20'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>Não utilizou</span>
            </button>
          </div>
        </div>

        {/* 6. Pergunta - Preferência entre Exercícios e Aparelhos */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-purple-600" />
              <span>Você prefere exercícios ou aparelhos? <span className="text-rose-500">*</span></span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handlePreferenceSelect('exercicios')}
                className={`py-3 px-3 rounded-xl font-medium text-xs sm:text-sm border flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  preference === 'exercicios'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Dumbbell className="w-4 h-4 shrink-0" />
                <span>Exercícios</span>
              </button>

              <button
                type="button"
                onClick={() => handlePreferenceSelect('aparelhos')}
                className={`py-3 px-3 rounded-xl font-medium text-xs sm:text-sm border flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  preference === 'aparelhos'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Cpu className="w-4 h-4 shrink-0" />
                <span>Aparelhos</span>
              </button>

              <button
                type="button"
                onClick={() => handlePreferenceSelect('ambos')}
                className={`py-3 px-3 rounded-xl font-medium text-xs sm:text-sm border flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  preference === 'ambos'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Ambos</span>
              </button>
            </div>
          </div>

          {/* Caixa Condicional: Explicação do porquê para exercícios ou aparelhos */}
          {(preference === 'exercicios' || preference === 'aparelhos') && (
            <div className="mt-4 pt-4 border-t border-purple-200/60 bg-purple-50/40 p-4 rounded-xl animate-fade-in">
              <label className="block text-xs font-semibold text-purple-900 mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Por que você prefere {preference === 'exercicios' ? 'exercícios' : 'aparelhos'}?{' '}
                  <span className="text-slate-400 font-normal">(Opcional)</span>
                </span>
              </label>
              <input
                type="text"
                value={preferenceReason}
                onChange={(e) => setPreferenceReason(e.target.value)}
                placeholder={`Ex: Me sinto mais ativo / O aparelho relaxa mais os músculos...`}
                className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-800 text-xs bg-white"
              />
            </div>
          )}
        </div>

        {/* 7. Comentário Descritivo (opcional) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Faça algum comentário ou recomendação <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte-nos sobre como foi sua experiência, elogios ou sugestões..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-800 placeholder:text-slate-400 text-sm transition-all resize-none"
          />
        </div>

        {/* Botão de Enviar */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
        >
          <Send className="w-5 h-5" />
          <span>Enviar Avaliação</span>
        </button>
      </form>
    </div>
  );
};
