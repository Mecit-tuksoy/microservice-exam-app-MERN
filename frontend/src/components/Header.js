// src/components/Header.js
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header">
      <h1>Mecit Hoca ile Online Test</h1>
      <div className="header-right">
        {currentUser && <span>Hoş geldin, {currentUser.username}</span>}
        {currentUser && (
          <>
            <button onClick={logout}>Çıkış Yap</button>
            <button onClick={() => navigate("/history")}>Çözülen Testler</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
