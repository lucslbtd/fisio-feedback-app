export type PreferenceOption = 'exercicios' | 'aparelhos' | 'ambos';

export interface Evaluation {
  id: string;
  name: string; // Opcional, se vazio fica "Anônimo"
  rating: number; // 1 a 5 estrelas
  feltPain: boolean; // sentiu dor? (true: sim, false: não)
  painInterfered?: boolean | null; // condicional: se sentiu dor, atrapalhou a sessão?
  feltImprovement: boolean; // sente melhoras nos tratamentos? (true: sim, false: não)
  usedTens: boolean; // utilizou TENS? (true: sim, false: não)
  preference: PreferenceOption; // prefere exercícios, aparelhos ou ambos
  preferenceReason?: string; // condicional: motivo da preferência por exercícios ou aparelhos
  comment: string; // Opcional
  createdAt: string; // ISO string de data
  evaluatorId?: string; // ID do profissional logado
  evaluatorName?: string; // Nome do profissional
  location?: 'boa_viagem' | 'poco_da_panela'; // Sede
  clinicType?: 'esportivo' | 'ambulatorio'; // Tipo de ambulatório
}

export type EvaluationFormData = Omit<Evaluation, 'id' | 'createdAt' | 'evaluatorId' | 'evaluatorName' | 'location' | 'clinicType'>;
