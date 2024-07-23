import React from "react";
import "./Home.css";
import { callRefreshToken } from "/src/functions/oauth.js";
import WebPlayback from "/src/components/player/WebPlayback/WebPlayback";
import LoginButton from "/src/components/oauth/LoginButton/LoginButton";
import LogoutButton from "/src/components/oauth/LogoutButton/LogoutButton";
import ExpireToken from "/src/components/oauth/ExpireToken/ExpireToken";

function Home() {
  const [isLoggedIn, updateIsLoggedIn] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState({
    token: undefined,
    uid: undefined
  });
  const [tokenExpired, setTokenExpired] = React.useState(undefined);

  React.useEffect(() => {
    const url = window.location;
    const urlParams = new URLSearchParams(url.search.slice(1));

    if (urlParams.has("access_token")) {
      const urlAccessToken = urlParams.get("access_token");
      const uid = urlParams.get("uid");
      completeLogin(urlAccessToken, uid);
    } else if (localStorage.getItem("loggedIn")) {
      updateIsLoggedIn(true);
    } else if (!localStorage.getItem("loggedIn")) {
      updateIsLoggedIn(false);
    } 
  }, []);

  React.useEffect(() => {
    if (!tokenExpired) {
      setTimeout(setTokenExpired(true), 1000 * 60 * 59);
    }
  }, [accessToken]);

  // React.useEffect(() => {
  //   console.log(accessToken)
  // }, [accessToken]);

  const completeLogin = (token, uid) => {
    localStorage.setItem("loggedIn", true);
    updateTokenExpiredStateToFalse;
    updateTokenState(token, uid);
    updateIsLoggedIn(true);
    window.history.replaceState({}, document.title, "/");
  };

  const handleLogout = () => {
    localStorage.clear();
    setAccessToken(prevToken => "");
    updateIsLoggedIn(false);
  };

  const updateTokenState = (token, uid) => {
    setAccessToken(prevToken => {
      return {
        token: token,
        uid: uid,
      };
    });
  }

  const updateTokenExpiredStateToFalse = () => {
    setTokenExpired(false);
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
        accessToken={accessToken}
        updateTokenState={updateTokenState}
        tokenExpired={tokenExpired}
        updateTokenExpiredStateToFalse={updateTokenExpiredStateToFalse}
        isLoggedIn={isLoggedIn}
      />
    </>
  )
};

export default Home;