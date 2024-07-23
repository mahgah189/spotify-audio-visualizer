import { initializeApp } from 'firebase/app';

const app = initializeApp({
  projectId: "spotify-audio-visualizer",
  apiKey: `${import.meta.env.API_KEY_FIREBASE}`,
  authDomain: "spotify-audio-visualizer.firebaseapp.com"
});

const initiateLogin = () => {
  window.location.href = "https://login-hgv7fgobsq-uc.a.run.app";
};

const callRefreshToken = async (uid) => {
  const response = await fetch("https://refreshtoken-hgv7fgobsq-uc.a.run.app", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ uid: uid })
  });

  const data = await response.json();
  return data;
};

export { initiateLogin, callRefreshToken };