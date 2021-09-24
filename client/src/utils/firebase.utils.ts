import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import { firebaseConfig } from '../firebaseConfig';

export const appsAmount = firebase.apps.length;

if (!firebase.apps.length) {
    console.info('Initializing firebase');
    firebase.initializeApp(firebaseConfig);
    firebase
        .firestore()
        .enablePersistence()
        .catch(err => {
            console.error('Error enabling persistence', err.code, err);
        });
}

export const firestore = firebase.firestore();
export const database = firebase.database();
export const auth = firebase.auth();

export const TIMESTAMP = firebase.database.ServerValue.TIMESTAMP;
