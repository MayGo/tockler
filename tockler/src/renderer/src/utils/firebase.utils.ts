import firebase from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import { enableIndexedDbPersistence, getFirestore, Timestamp } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

console.info('Initializing firebase');
export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const firestore = getFirestore();

enableIndexedDbPersistence(firestore).catch((err) => {
    console.error('Error enabling persistence', err.code, err);
});

export const database = getDatabase();
export const auth = getAuth();

export const TIMESTAMP = Timestamp;
