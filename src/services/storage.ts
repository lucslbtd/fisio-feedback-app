import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Evaluation, EvaluationFormData } from '../types/evaluation';
import { getCurrentUserProfile } from './authService';

const LOCAL_STORAGE_KEY = 'fisio_evaluations_pilot_v3';

const MOCK_INITIAL_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-1',
    name: 'Maria Aparecida Silva',
    rating: 5,
    feltPain: false,
    painInterfered: null,
    feltImprovement: true,
    usedTens: true,
    preference: 'ambos',
    preferenceReason: '',
    comment: 'Atendimento excelente! A fisioterapeuta usou TENS no ombro e fez exercícios de fortalecimento.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'eval-2',
    name: 'João Pedro Santos',
    rating: 4,
    feltPain: true,
    painInterfered: false,
    feltImprovement: true,
    usedTens: true,
    preference: 'exercicios',
    preferenceReason: 'Sinto que o alongamento manual fortalece mais a musculatura.',
    comment: 'Senti um pouco de dor nos alongamentos, mas prefiro os exercícios manuais ao TENS.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'eval-3',
    name: 'Anônimo',
    rating: 5,
    feltPain: false,
    painInterfered: null,
    feltImprovement: true,
    usedTens: false,
    preference: 'exercicios',
    preferenceReason: 'Gosto de me movimentar ativamente.',
    comment: 'Ótima infraestrutura e profissionais capacitados.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'eval-4',
    name: 'Carlos Eduardo Lima',
    rating: 3,
    feltPain: true,
    painInterfered: true,
    feltImprovement: false,
    usedTens: true,
    preference: 'aparelhos',
    preferenceReason: 'O calor e a eletroterapia relaxam melhor os pontos de tensão.',
    comment: 'Sessão um pouco dolorosa hoje. A dor me impediu de concluir algumas séries.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

// Fallback LocalStorage
export const getLocalEvaluations = (): Evaluation[] => {
  try {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!rawData) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_INITIAL_EVALUATIONS));
      return MOCK_INITIAL_EVALUATIONS;
    }
    return JSON.parse(rawData);
  } catch {
    return MOCK_INITIAL_EVALUATIONS;
  }
};

// Firestore ou LocalStorage Async
export const subscribeEvaluations = (callback: (evaluations: Evaluation[]) => void) => {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'evaluations'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Evaluation[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Evaluation, 'id'>),
        }));
        callback(list);
      },
      (error) => {
        console.error('Erro na sincronização Firestore:', error);
        callback(getLocalEvaluations());
      }
    );
  } else {
    callback(getLocalEvaluations());
    return () => {};
  }
};

export const saveEvaluationAsync = async (data: EvaluationFormData): Promise<Evaluation> => {
  const currentUser = getCurrentUserProfile();
  
  const payload: Omit<Evaluation, 'id'> = {
    name: data.name.trim() || 'Anônimo',
    rating: data.rating,
    feltPain: data.feltPain,
    painInterfered: data.feltPain ? data.painInterfered : null,
    feltImprovement: data.feltImprovement,
    usedTens: data.usedTens,
    preference: data.preference,
    preferenceReason:
      data.preference === 'exercicios' || data.preference === 'aparelhos'
        ? (data.preferenceReason || '').trim()
        : '',
    comment: data.comment.trim(),
    createdAt: new Date().toISOString(),
    evaluatorId: currentUser?.uid,
    evaluatorName: currentUser?.fullName,
    location: currentUser?.location,
    clinicType: currentUser?.clinicType,
  };

  // Salva no LocalStorage por garantia
  const localList = getLocalEvaluations();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'evaluations'), payload);
      const saved = { id: docRef.id, ...payload };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([saved, ...localList]));
      return saved;
    } catch (error) {
      console.error('Erro ao salvar no Firestore, salvando localmente:', error);
    }
  }

  const localSaved: Evaluation = {
    id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    ...payload,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([localSaved, ...localList]));
  return localSaved;
};

export const deleteEvaluationAsync = async (id: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'evaluations', id));
    } catch (error) {
      console.error('Erro ao deletar do Firestore:', error);
    }
  }

  const localList = getLocalEvaluations();
  const updated = localList.filter((item) => item.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
};

export const resetToMockDataAsync = async (): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      for (const item of MOCK_INITIAL_EVALUATIONS) {
        const { id, ...data } = item;
        await addDoc(collection(db, 'evaluations'), data);
      }
    } catch (error) {
      console.error('Erro ao resetar dados no Firestore:', error);
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_INITIAL_EVALUATIONS));
};
