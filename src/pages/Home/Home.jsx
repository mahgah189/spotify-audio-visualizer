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
      const expirationTime = Date.now() + (1000 * 60 * 59);
      const userRef = {
        token: urlAccessToken,
        uid: uid,
        expirationTime: expirationTime,
        loggedIn: true
      };
      sessionStorage.setItem("userRef", JSON.stringify(userRef));
      updateIsLoggedIn(true);
      window.history.replaceState({}, document.title, "/");
    } else if (sessionStorage.getItem("userRef")) {
      updateIsLoggedIn(true);
    } else if (!sessionStorage.getItem("userRef")) {
      updateIsLoggedIn(false);
    } 
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    updateIsLoggedIn(false);
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
      />
    </>
  )
};

export default Home;