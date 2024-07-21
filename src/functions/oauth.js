import { initializeApp } from 'firebase/app';
import 'firebase/auth';

const app = initializeApp({
  projectId: "spotify-audio-visualizer",
  apiKey: `${import.meta.env.API_KEY_FIREBASE}`,
  authDomain: "spotify-audio-visualizer.firebaseapp.com"
});

const initiateLogin = () => {
  window.location.href = "https://login-hgv7fgobsq-uc.a.run.app";
};

const handleLogout = (stateCB) => {
  localStorage.clear();
  stateCB(prevToken => "");
}

export { initiateLogin, handleLogout };