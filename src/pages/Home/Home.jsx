import React from "react";
import "./Home.css";
import LoginButton from "/src/components/oauth/LoginButton/LoginButton";
import LogoutButton from "/src/components/oauth/LogoutButton/LogoutButton";

function Home() {
  const [isLoggedIn, updateIsLoggedIn] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState("");

  React.useEffect(() => {
    const url = window.location;
    const urlParams = new URLSearchParams(url.search.slice(1));

    if (urlParams.has("access_token")) {
      const urlAccessToken = urlParams.get("access_token");
      completeLogin(urlAccessToken);
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

  const completeLogin = (token) => {
    localStorage.setItem("loggedIn", true);
    setAccessToken(prevToken => token);
    updateIsLoggedIn(true);
    window.history.replaceState({}, document.title, "/");
  };

  const handleLogout = () => {
    localStorage.clear();
    setAccessToken(prevToken => "");
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
    </>
  )
};

export default Home;