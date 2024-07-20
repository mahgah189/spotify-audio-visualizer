import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import 'firebase/auth';

const app = initializeApp({
  projectId: "spotify-audio-visualizer",
  apiKey: `${import.meta.env.API_KEY_FIREBASE}`,
  authDomain: "spotify-audio-visualizer.firebaseapp.com"
});
const functions = getFunctions(app);
const login = httpsCallable(functions, "login");

const initiateLogin = () => {
  window.location.href = "https://login-hgv7fgobsq-uc.a.run.app";
};

const initiateCallback = () => {
  window.location.href = "https://callback-hgv7fgobsq-uc.a.run.app";
};

const handleSignIn = () => {
  const token = localStorage.getItem("firebaseToken");
  firebase.auth().signInWithCustomToken(token)
  .then((userCredential) => {
    console.log('User signed in:', userCredential.user);
  })
  .catch((error) => {
    console.error('Error signing in with custom token:', error);
  });
};

const handleLogout = () => {
  signOut(auth);
};

export { initiateLogin, initiateCallback, handleSignIn, handleLogout };