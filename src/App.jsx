import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { handleSignIn } from "/src/firebase.js";
import Home from "/src/pages/Home/Home";
import Callback from "/src/pages/Callback/Callback";

function App() {

  const [accessToken, setAccessToken] = React.useState("");

  React.useEffect(() => {
    const url = window.location;
    const history = window.history;
    const urlParams = new URLSearchParams(url.search.slice(1));
    if (urlParams.has("access_token")) {
      const urlAccessToken = urlParams.get("access_token");
      const storeToken = token => {
        setAccessToken(previousToken => token);
        history.replaceState({}, document.title, "/");
      };
      storeToken(urlAccessToken);
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
