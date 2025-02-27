import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header">
      <h1>Microservis Test Uygulaması</h1>
      <div className="header-right">
        <span>Hoş geldin, {user.username}</span>
        <button onClick={() => navigate("/history")}>Çözülen Testler</button>
        <button onClick={logout}>Çıkış Yap</button>
      </div>
    </header>
  );
};

export default Header;
