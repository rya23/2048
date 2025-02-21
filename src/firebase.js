import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyB3txKr4eA8Zr8sB4BUCH2L9M7VCKCCUW0',
    authDomain: 'gyroscope-3473f.firebaseapp.com',
    projectId: 'gyroscope-3473f',
    storageBucket: 'gyroscope-3473f.firebasestorage.app',
    messagingSenderId: '379315740663',
    appId: '1:379315740663:web:696aa064557f1b5f7718f2',
    measurementId: 'G-0733SH1VH6',
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Error signing in with Google: ', error);
    }
};

export const signOutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error signing out: ', error);
    }
};

export const saveScore = async (score, userId, userName) => {
    try {
        await addDoc(collection(db, 'leaderboard'), {
            score,
            userId,
            userName,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Error saving score: ', error);
    }
};

export const getTopScores = async () => {
    try {
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting top scores: ', error);
        return [];
    }
};

export { auth, db };
