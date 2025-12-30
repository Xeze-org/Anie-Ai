// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAkW7HRa9LX5azHj1iQ3hjSa4YuxniHiFI",
    authDomain: "astralelite.firebaseapp.com",
    projectId: "astralelite",
    storageBucket: "astralelite.firebasestorage.app",
    messagingSenderId: "271230242037",
    appId: "1:271230242037:web:8581b886d7ca983a5b89bc",
    measurementId: "G-PLKE5P2QFF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
