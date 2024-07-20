import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { handleSignIn } from "/src/firebase.js";
import Home from "/src/pages/Home/Home";
import Callback from "/src/pages/Callback/Callback";

function App() {

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("access_token")) {
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");
      const firebaseToken = urlParams.get("firebase_token");

      localStorage.setItem("spotifyAccessToken", accessToken);
      localStorage.setItem("spotifyRefreshToken", refreshToken);
      localStorage.setItem("firebaseToken", firebaseToken);

      handleSignIn();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
