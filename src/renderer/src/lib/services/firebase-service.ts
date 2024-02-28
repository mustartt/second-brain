import {initializeApp} from "firebase/app";
import {
    getAuth,
    signOut,
    GoogleAuthProvider,
    connectAuthEmulator,
    getIdToken,
} from "firebase/auth";
import {getFirestore, connectFirestoreEmulator} from "firebase/firestore";
import {getStorage, connectStorageEmulator} from "firebase/storage";
import {getFunctions, connectFunctionsEmulator} from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyA4jO0dckZV9Q8wNsP6p6F6_nLJOov-3O4",
    authDomain: "speedy-atom-413006.firebaseapp.com",
    projectId: "speedy-atom-413006",
    storageBucket: "speedy-atom-413006.appspot.com",
    messagingSenderId: "664044881400",
    appId: "1:664044881400:web:a03d66cc7af41f7f35020d",
    measurementId: "G-F7ERQHTJLB",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const storageUpload = getStorage(firebaseApp, "gs://speedy-atom-413006-upload");

export const functions = getFunctions(firebaseApp);

export function logout() {
    return signOut(firebaseAuth);
}

export async function getAuthToken() {
    if (!firebaseAuth.currentUser) {
        throw Error("getAuthToken: current user does not exists");
    }
    return await getIdToken(firebaseAuth.currentUser);
}

export const googleAuthProvider = new GoogleAuthProvider();

connectAuthEmulator(firebaseAuth, "http://127.0.0.1:9099");
connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
connectStorageEmulator(storage, "127.0.0.1", 9199);
connectStorageEmulator(storageUpload, "127.0.0.1", 9199);
connectFunctionsEmulator(functions, "127.0.0.1", 5001);
