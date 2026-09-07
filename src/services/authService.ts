import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { SignUpData, UserProfile } from '../types/user';

const LOCAL_USER_KEY = 'fisio_current_user_profile';

export const signUpUser = async (data: SignUpData): Promise<UserProfile> => {
  const profileData: Omit<UserProfile, 'uid'> = {
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    location: data.location,
    workStartTime: data.workStartTime,
    workEndTime: data.workEndTime,
    clinicType: data.clinicType,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && auth && db) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email.trim(),
      data.password
    );

    const uid = userCredential.user.uid;

    await updateProfile(userCredential.user, {
      displayName: data.fullName.trim(),
    });

    const fullProfile: UserProfile = { uid, ...profileData };
    await setDoc(doc(db, 'users', uid), fullProfile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fullProfile));
    return fullProfile;
  }

  // Modo de teste LocalStorage
  const localProfile: UserProfile = {
    uid: `local-user-${Date.now()}`,
    ...profileData,
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localProfile));
  return localProfile;
};

export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  if (isFirebaseConfigured && auth && db) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const uid = userCredential.user.uid;
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile;
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      return profile;
    }

    // Perfil fallback se não existir documento no Firestore ainda
    const fallbackProfile: UserProfile = {
      uid,
      fullName: userCredential.user.displayName || 'Profissional',
      email: userCredential.user.email || email,
      location: 'boa_viagem',
      workStartTime: '08:00',
      workEndTime: '18:00',
      clinicType: 'esportivo',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackProfile));
    return fallbackProfile;
  }

  // Fallback LocalStorage
  const saved = localStorage.getItem(LOCAL_USER_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  throw new Error('Chaves do Firebase não configuradas. Registre uma conta no modo local.');
};

export const sendResetPasswordEmailAsync = async (email: string): Promise<void> => {
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email.trim());
  } else {
    // Simulação em modo local
    console.log(`[Simulação] Email de redefinição enviado para: ${email}`);
  }
};

export const logoutUserAsync = async (): Promise<void> => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  localStorage.removeItem(LOCAL_USER_KEY);
};

export const getCurrentUserProfile = (): UserProfile | null => {
  const saved = localStorage.getItem(LOCAL_USER_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const subscribeAuth = (callback: (user: UserProfile | null) => void) => {
  if (isFirebaseConfigured && auth && db) {
    const firestoreDb = db;
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(firestoreDb, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
            callback(profile);
            return;
          }
        } catch (e) {
          console.error('Erro ao buscar perfil do usuário:', e);
        }
        callback(getCurrentUserProfile());
      } else {
        localStorage.removeItem(LOCAL_USER_KEY);
        callback(null);
      }
    });
  } else {
    callback(getCurrentUserProfile());
    return () => {};
  }
};
