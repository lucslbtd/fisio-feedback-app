import React, { useState } from 'react';
import {
  Star,
  Users,
  TrendingUp,
  Activity,
  Zap,
  Dumbbell,
  Trash2,
  RotateCcw,
  Search,
  Download,
  Calendar,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Evaluation } from '../types/evaluation';
import { deleteEvaluationAsync, resetToMockDataAsync } from '../services/storage';

interface AdminDashboardProps {
  evaluations: Evaluation[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  evaluations,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [painFilter, setPainFilter] = useState<string>('all');
  const [improvementFilter, setImprovementFilter] = useState<string>('all');
  const [tensFilter, setTensFilter] = useState<string>('all');
  const [preferenceFilter, setPreferenceFilter] = useState<string>('all');
  
  // Novos filtros
  const [timeFilter, setTimeFilter] = useState<string>('all'); // manhã, tarde, noite
  const [clinicTypeFilter, setClinicTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [professionalFilter, setProfessionalFilter] = useState<string>('all');

  // Cálculos de métricas
  const totalCount = evaluations.length;

  // Profissionais únicos para o filtro
  const uniqueProfessionals = Array.from(
    new Set(evaluations.map(e => e.evaluatorName).filter(Boolean))
  ) as string[];
  const avgRating = totalCount > 0
    ? (evaluations.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1)
    : '0.0';

  const painCount = evaluations.filter((e) => e.feltPain).length;
  const noPainCount = totalCount - painCount;
  const painPercent = totalCount > 0 ? Math.round((painCount / totalCount) * 100) : 0;

  const painInterferedCount = evaluations.filter((e) => e.feltPain && e.painInterfered).length;

  const improvementCount = evaluations.filter((e) => e.feltImprovement).length;
  const noImprovementCount = totalCount - improvementCount;
  const improvementPercent = totalCount > 0 ? Math.round((improvementCount / totalCount) * 100) : 0;

  const tensCount = evaluations.filter((e) => e.usedTens).length;
  const tensPercent = totalCount > 0 ? Math.round((tensCount / totalCount) * 100) : 0;

  const prefExercicios = evaluations.filter((e) => e.preference === 'exercicios').length;
  const prefAparelhos = evaluations.filter((e) => e.preference === 'aparelhos').length;
  const prefAmbos = evaluations.filter((e) => e.preference === 'ambos').length;

  // Dados para Gráfico de Dor
  const painChartData = [
    { name: 'Não Sentiram Dor', value: noPainCount, color: '#10b981' },
    { name: 'Sentiram Dor', value: painCount, color: '#f43f5e' },
  ];

  // Dados para Gráfico de Melhora
  const improvementChartData = [
    { name: 'Sentem Melhora', value: improvementCount, color: '#0d9488' },
    { name: 'Sem Melhora Ainda', value: noImprovementCount, color: '#f59e0b' },
  ];

  // Dados para Gráfico de Preferência
  const preferenceChartData = [
    { name: 'Exercícios', value: prefExercicios, color: '#9333ea' },
    { name: 'Aparelhos', value: prefAparelhos, color: '#4f46e5' },
    { name: 'Ambos', value: prefAmbos, color: '#0d9488' },
  ];

  // Dados para Gráfico de Distribuição de Estrelas
  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    star: `${star} ★`,
    quantidade: evaluations.filter((e) => e.rating === star).length,
  }));

  // Filtragem do Histórico
  const filteredEvaluations = evaluations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.preferenceReason && item.preferenceReason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRating =
      ratingFilter === 'all' || item.rating === parseInt(ratingFilter, 10);

    const matchesPain =
      painFilter === 'all' ||
      (painFilter === 'yes' && item.feltPain) ||
      (painFilter === 'no' && !item.feltPain);

    const matchesImprovement =
      improvementFilter === 'all' ||
      (improvementFilter === 'yes' && item.feltImprovement) ||
      (improvementFilter === 'no' && !item.feltImprovement);

    const matchesTens =
      tensFilter === 'all' ||
      (tensFilter === 'yes' && item.usedTens) ||
      (tensFilter === 'no' && !item.usedTens);

    const matchesPreference =
      preferenceFilter === 'all' || item.preference === preferenceFilter;

    // Lógica de tempo (manhã: 06-12, tarde: 12-18, noite: 18-06)
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const hour = new Date(item.createdAt).getHours();
      if (timeFilter === 'manha') matchesTime = hour >= 6 && hour < 12;
      else if (timeFilter === 'tarde') matchesTime = hour >= 12 && hour < 18;
      else if (timeFilter === 'noite') matchesTime = hour >= 18 || hour < 6;
    }

    const matchesClinicType =
      clinicTypeFilter === 'all' || item.clinicType === clinicTypeFilter;

    const matchesLocation =
      locationFilter === 'all' || item.location === locationFilter;

    const matchesProfessional =
      professionalFilter === 'all' || item.evaluatorName === professionalFilter;

    return (
      matchesSearch &&
      matchesRating &&
      matchesPain &&
      matchesImprovement &&
      matchesTens &&
      matchesPreference &&
      matchesTime &&
      matchesClinicType &&
      matchesLocation &&
      matchesProfessional
    );
  });

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
      await deleteEvaluationAsync(id);
      onRefreshData();
    }
  };

  const handleResetData = async () => {
    if (confirm('Deseja restaurar os dados demonstrativos do piloto?')) {
      await resetToMockDataAsync();
      onRefreshData();
    }
  };

  const handleExportCSV = () => {
    if (evaluations.length === 0) return;

    const headers = [
      'ID',
      'Data/Hora',
      'Nome',
      'Nota',
      'Sentiu Dor',
      'Dor Atrapalhou Sessao',
      'Sente Melhora',
      'Utilizou TENS',
      'Preferencia',
      'Motivo Preferencia',
      'Comentario',
    ];

    const rows = evaluations.map((e) => [
      e.id,
      new Date(e.createdAt).toLocaleString('pt-BR'),
      `"${e.name.replace(/"/g, '""')}"`,
      e.rating,
      e.feltPain ? 'Sim' : 'Nao',
      e.feltPain ? (e.painInterfered ? 'Sim' : 'Nao') : 'N/A',
      e.feltImprovement ? 'Sim' : 'Nao',
      e.usedTens ? 'Sim' : 'Nao',
      e.preference,
      `"${(e.preferenceReason || '').replace(/"/g, '""')}"`,
      `"${e.comment.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `avaliacoes_fisioterapia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatPreferenceLabel = (pref: string) => {
    if (pref === 'exercicios') return 'Exercícios';
    if (pref === 'aparelhos') return 'Aparelhos';
    return 'Ambos';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel Geral de Avaliações</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Acompanhamento de satisfação, relatórios de dor, uso de TENS e preferência de métodos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleResetData}
            title="Restaurar dados piloto de teste"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar Piloto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card Média Geral */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Média Notas</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{avgRating}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(parseFloat(avgRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>

        {/* Card Total Avaliações */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pacientes</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">registrados</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card Melhoras */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taxa Melhora</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 mt-1">{improvementPercent}%</p>
            <p className="text-[11px] text-teal-700 mt-0.5 font-medium">{improvementCount} com evolução</p>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card Relatos de Dor */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentiram Dor</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">{painPercent}%</p>
            <p className="text-[11px] text-rose-700 mt-0.5 font-medium">
              {painInterferedCount > 0 ? `${painInterferedCount} relatam ter atrapalhado` : `${painCount} com dor`}
            </p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Card TENS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Usaram TENS</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 mt-1">{tensPercent}%</p>
            <p className="text-[11px] text-sky-700 mt-0.5 font-medium">{tensCount} sessões com TENS</p>
          </div>
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gráfico 1: Relatos de Dor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>Pacientes que Sentem Dor</span>
          </h2>
          <p className="text-[11px] text-slate-500 mb-2">Proporção na última sessão</p>
          <div className="h-52 w-full">
            {totalCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={painChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {painChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} paciente(s)`, 'Quantidade']} />
                  <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem dados</div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Melhoras com tratamento */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>Percepção de Melhora</span>
          </h2>
          <p className="text-[11px] text-slate-500 mb-2">Evolução no tratamento</p>
          <div className="h-52 w-full">
            {totalCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={improvementChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {improvementChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} paciente(s)`, 'Quantidade']} />
                  <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem dados</div>
            )}
          </div>
        </div>

        {/* Gráfico 3: Preferência Exercícios vs Aparelhos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-purple-600" />
            <span>Exercícios vs Aparelhos</span>
          </h2>
          <p className="text-[11px] text-slate-500 mb-2">Preferência declarada</p>
          <div className="h-52 w-full">
            {totalCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preferenceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {preferenceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} paciente(s)`, 'Preferência']} />
                  <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem dados</div>
            )}
          </div>
        </div>

        {/* Gráfico 4: Distribuição de Notas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Distribuição de Notas</span>
          </h2>
          <p className="text-[11px] text-slate-500 mb-2">Frequência de 1 a 5 estrelas</p>
          <div className="h-52 w-full">
            {totalCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution}>
                  <XAxis dataKey="star" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val: number) => [`${val} avaliação(ões)`, 'Total']} />
                  <Bar dataKey="quantidade" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem dados</div>
            )}
          </div>
        </div>
      </div>

      {/* Histórico de Avaliações */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Histórico Completo de Avaliações</h2>
            <p className="text-xs text-slate-500">Consulte o registro individual com filtros de busca</p>
          </div>

          {/* Barra de Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Campo Busca */}
            <div className="relative min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar paciente/comentário..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filtro Nota */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Todas as Notas</option>
              <option value="5">5 Estrelas ★★★★★</option>
              <option value="4">4 Estrelas ★★★★</option>
              <option value="3">3 Estrelas ★★★</option>
              <option value="2">2 Estrelas ★★</option>
              <option value="1">1 Estrela ★</option>
            </select>

            {/* Filtro Dor */}
            <select
              value={painFilter}
              onChange={(e) => setPainFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Dor: Todos</option>
              <option value="yes">Sentiu Dor (Sim)</option>
              <option value="no">Não Sentiu Dor (Não)</option>
            </select>

            {/* Filtro Melhora */}
            <select
              value={improvementFilter}
              onChange={(e) => setImprovementFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Melhora: Todos</option>
              <option value="yes">Com Melhora (Sim)</option>
              <option value="no">Sem Melhora (Não)</option>
            </select>

            {/* Filtro TENS */}
            <select
              value={tensFilter}
              onChange={(e) => setTensFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">TENS: Todos</option>
              <option value="yes">Usou TENS (Sim)</option>
              <option value="no">Não Usou (Não)</option>
            </select>

            {/* Filtro Preferência */}
            <select
              value={preferenceFilter}
              onChange={(e) => setPreferenceFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Preferência: Todas</option>
              <option value="exercicios">Exercícios</option>
              <option value="aparelhos">Aparelhos</option>
              <option value="ambos">Ambos</option>
            </select>

            {/* Filtro Horário */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Horário: Todos</option>
              <option value="manha">Manhã (06h - 12h)</option>
              <option value="tarde">Tarde (12h - 18h)</option>
              <option value="noite">Noite (18h - 06h)</option>
            </select>

            {/* Filtro Ambulatório */}
            <select
              value={clinicTypeFilter}
              onChange={(e) => setClinicTypeFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Ambulatório: Todos</option>
              <option value="esportivo">Esportivo</option>
              <option value="ambulatorio">Ambulatório</option>
            </select>

            {/* Filtro Sede */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Sede: Todas</option>
              <option value="boa_viagem">Boa Viagem</option>
              <option value="poco_da_panela">Poço da Panela</option>
            </select>

            {/* Filtro Profissional */}
            <select
              value={professionalFilter}
              onChange={(e) => setProfessionalFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Profissional: Todos</option>
              {uniqueProfessionals.map((prof, i) => (
                <option key={i} value={prof}>{prof}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela de Dados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Paciente</th>
                <th className="py-3.5 px-4">Nota</th>
                <th className="py-3.5 px-4">Sentiu Dor?</th>
                <th className="py-3.5 px-4">Melhoras?</th>
                <th className="py-3.5 px-4">Usou TENS?</th>
                <th className="py-3.5 px-4">Preferência & Motivo</th>
                <th className="py-3.5 px-4">Comentário</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvaluations.length > 0 ? (
                filteredEvaluations.map((item) => {
                  const formattedDate = new Date(item.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          {(item.evaluatorName || item.location || item.clinicType) && (
                            <span className="text-[10px] text-slate-400 font-normal mt-0.5 flex flex-col">
                              {item.evaluatorName && <span>Prof: {item.evaluatorName}</span>}
                              {(item.location || item.clinicType) && (
                                <span>
                                  {item.location === 'boa_viagem' ? 'Boa Viagem' : item.location === 'poco_da_panela' ? 'Poço da Panela' : ''}
                                  {item.location && item.clinicType ? ' • ' : ''}
                                  {item.clinicType === 'esportivo' ? 'Esportivo' : item.clinicType === 'ambulatorio' ? 'Ambulatório' : ''}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-800">{item.rating}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.feltPain ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 w-max">
                              Sim
                            </span>
                            {item.painInterfered !== undefined && item.painInterfered !== null && (
                              <span
                                className={`text-[10px] flex items-center gap-1 ${
                                  item.painInterfered ? 'text-rose-700 font-semibold' : 'text-slate-500'
                                }`}
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                {item.painInterfered ? 'Atrapalhou a sessão' : 'Não atrapalhou'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Não
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.feltImprovement ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            Sim
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Não
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.usedTens ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            Sim
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Não
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border w-max ${
                              item.preference === 'exercicios'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : item.preference === 'aparelhos'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-teal-50 text-teal-700 border-teal-200'
                            }`}
                          >
                            {formatPreferenceLabel(item.preference)}
                          </span>
                          {item.preferenceReason && (
                            <span className="text-[11px] text-slate-500 italic max-w-xs truncate flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-purple-400 shrink-0" />
                              <span className="truncate">{item.preferenceReason}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {item.comment ? (
                          <div className="flex items-center gap-1.5" title={item.comment}>
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{item.comment}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">Sem comentário</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Excluir avaliação"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    Nenhuma avaliação encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
