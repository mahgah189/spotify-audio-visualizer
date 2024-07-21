import React from "react";
import "./Home.css";
import { callRefreshToken } from "/src/functions/oauth.js";
import LoginButton from "/src/components/oauth/LoginButton/LoginButton";
import LogoutButton from "/src/components/oauth/LogoutButton/LogoutButton";
import ExpireToken from "/src/components/oauth/ExpireToken/ExpireToken";

function Home() {
  const [isLoggedIn, updateIsLoggedIn] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState("");
  const [tokenExpired, setTokenExpired] = React.useState(false);

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
    if (!localStorage.getItem("loggedIn")) {
      updateIsLoggedIn(false);
    }
  }, [isLoggedIn]);

  React.useEffect(() => {
    const uid = localStorage.getItem("uid");
    callRefreshToken(uid);
  }, [tokenExpired]);

  const completeLogin = (token, uid) => {
    localStorage.setItem("loggedIn", true);
    localStorage.setItem("uid", uid);
    setAccessToken(prevToken => token);
    updateIsLoggedIn(true);
    window.history.replaceState({}, document.title, "/");
  };

  const handleLogout = () => {
    localStorage.clear();
    setAccessToken(prevToken => "");
    updateIsLoggedIn(false);
  };

  const getToken = () => {
    setTokenExpired(!tokenExpired);
  };
  
  return (
    <>
      {isLoggedIn ?
        <LogoutButton 
          handleLogout={handleLogout}
        /> :
        <LoginButton />
      }
      <ExpireToken 
        getToken={getToken}
      />
    </>
  )
};

export default Home;