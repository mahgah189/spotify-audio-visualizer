import React from "react";
import "./LoginButton.css";
import { initiateLogin } from "/src/firebase.js";

function LoginButton() {
  return (
    <div className="login-button--container">
      <button className="login-button--btn" onClick={() => { initiateLogin() }}>
        Login
      </button>
    </div>
  )
};

export default LoginButton;