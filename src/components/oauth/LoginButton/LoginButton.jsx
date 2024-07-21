import React from "react";
import "./LoginButton.css";
import { initiateLogin } from "/src/functions/oauth.js";

function LoginButton() {
  return (
    <div className="login-btn--container">
      <button className="login-btn--btn" onClick={() => { initiateLogin() }}>
        Login
      </button>
    </div>
  )
};

export default LoginButton;