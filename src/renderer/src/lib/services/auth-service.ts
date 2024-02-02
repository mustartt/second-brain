import {initializeApp} from "firebase/app";
import {getAuth, signOut, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA4jO0dckZV9Q8wNsP6p6F6_nLJOov-3O4",
    authDomain: "speedy-atom-413006.firebaseapp.com",
    projectId: "speedy-atom-413006",
    storageBucket: "speedy-atom-413006.appspot.com",
    messagingSenderId: "664044881400",
    appId: "1:664044881400:web:a03d66cc7af41f7f35020d",
    measurementId: "G-F7ERQHTJLB"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

export function logout() {
    return signOut(firebaseAuth);
}

export const googleAuthProvider = new GoogleAuthProvider();

