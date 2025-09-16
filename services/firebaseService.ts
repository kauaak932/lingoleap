import { db, firebase } from '../firebase/config';
import { UserProfile, DifficultyLevel, VocabularyWord, PracticeSession } from '../types';

const usersCollection = db.collection('users');
const wordsCollection = db.collection('vocabulary');
const historyCollection = db.collection('history');

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const doc = await usersCollection.doc(userId).get();
  if (doc.exists) {
    return { id: doc.id, ...doc.data() } as UserProfile;
  }
  return null;
};

export const createUserProfile = async (user: firebase.User): Promise<UserProfile> => {
  const newUserProfile: Omit<UserProfile, 'id' | 'createdAt'> = {
    email: user.email!,
    learningGoal: 'Get fluent in English for my career.',
    difficultyLevel: DifficultyLevel.BEGINNER,
    currentStreak: 0,
    lastPracticeDate: new Date(0).toISOString(),
    dailyStreakAwarded: false,
    dailySpeakingSeconds: 0,
    dailyVocabLearned: 0,
    dailySessionsCompleted: 0,
    wordsLearned: 0,
    practiceSessionsCompleted: 0,
    milestoneAchieved: 0,
    lastDailyChallengeDate: new Date(0).toISOString(),
  };
  const profileWithTimestamp = {
      ...newUserProfile,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  }
  await usersCollection.doc(user.uid).set(profileWithTimestamp);
  return { id: user.uid, ...profileWithTimestamp } as UserProfile;
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  return usersCollection.doc(userId).update(data);
};

export const getSavedWords = async (userId: string): Promise<VocabularyWord[]> => {
    const snapshot = await wordsCollection.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VocabularyWord));
};

export const saveWord = async (userId: string, wordData: Omit<VocabularyWord, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const docRef = await wordsCollection.add({
        ...wordData,
        userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
}

export const deleteWord = async (wordId: string): Promise<void> => {
    return wordsCollection.doc(wordId).delete();
}

export const savePracticeSession = async (sessionData: Omit<PracticeSession, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await historyCollection.add({
        ...sessionData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
}

export const getPracticeHistory = async (userId: string): Promise<PracticeSession[]> => {
    const snapshot = await historyCollection.where('userId', '==', userId).orderBy('createdAt', 'desc').limit(50).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticeSession));
}