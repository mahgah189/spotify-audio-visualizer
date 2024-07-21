import React from "react";
import "./LogoutButton.css";

function LogoutButton({ handleLogout }) {
  return (
    <div className="logout-btn--container">
      <button className="logout-btn--btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
};

export default LogoutButton;