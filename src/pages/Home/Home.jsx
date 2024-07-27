import React from "react";
import "./Home.css";
import WebPlayback from "/src/components/player/WebPlayback/WebPlayback";
import LoginButton from "/src/components/oauth/LoginButton/LoginButton";
import LogoutButton from "/src/components/oauth/LogoutButton/LogoutButton";

function Home() {
  const [isLoggedIn, updateIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const url = window.location;
    const urlParams = new URLSearchParams(url.search.slice(1));

    if (urlParams.has("access_token")) {
      const urlAccessToken = urlParams.get("access_token");
      const uid = urlParams.get("uid");
      completeLogin(urlAccessToken, uid);
    } 
    // else if (localStorage.getItem("userRef")) {
    //   updateIsLoggedIn(true);
    // } else if (!localStorage.getItem("userRef")) {
    //   updateIsLoggedIn(false);
    // } 
  }, []);

  const completeLogin = (token, uid) => {
    const expirationTime = Date.now() + (1000 * 60 * 59);
    const userRef = {
      token: token,
      uid: uid,
      expirationTime: expirationTime,
      loggedIn: true
    };
    localStorage.setItem("userRef", JSON.stringify(userRef));
    updateIsLoggedIn(true);
    window.history.replaceState({}, document.title, "/");
  };

  const handleLogout = () => {
    localStorage.clear();
    updateIsLoggedIn(false);
  };

  const updateLoginState = (bool) => {
    updateIsLoggedIn(bool);
  };

  return (
    <>
      {isLoggedIn ?
        <LogoutButton 
          handleLogout={handleLogout}
        /> :
        <LoginButton />
      }
      <WebPlayback 
        isLoggedIn={isLoggedIn}
        updateLoginState={updateLoginState}
      />
    </>
  )
};

export default Home;