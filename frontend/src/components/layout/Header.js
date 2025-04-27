// src/components/layout/Header.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { testService } from "../../services/testService";
import "./Header.css"; // CSS dosyasını import edelim

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await testService.getClasses();
        setClasses(data);
      } catch (err) {
        console.error("Sınıflar yüklenirken hata oluştu:", err);
      }
    };

    if (currentUser) {
      fetchClasses();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowClassDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleClassSelect = (cls) => {
    navigate(`/classes/${cls}/dersler`);
    setShowClassDropdown(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary custom-navbar shadow">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-book-open me-2"></i>
          Test Uygulaması
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {currentUser && (
              <>
                <li className="nav-item dropdown" ref={dropdownRef}>
                  <div
                    className={`nav-link custom-nav-link ${showClassDropdown ? 'active' : ''}`}
                    onMouseEnter={() => setShowClassDropdown(true)}
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                  >
                    <i className="fas fa-chalkboard me-1"></i>
                    <span>Sınıflar</span>
                    <i className={`fas fa-chevron-${showClassDropdown ? 'up' : 'down'} ms-1 small`}></i>
                  </div>
                  {showClassDropdown && (
                    <div className="custom-dropdown-menu shadow">
                      {classes.length > 0 ? (
                        classes.map((cls, index) => (
                          <button
                            key={index}
                            className="dropdown-item custom-dropdown-item"
                            onClick={() => handleClassSelect(cls)}
                          >
                            <i className="fas fa-graduation-cap me-2"></i>
                            {cls}
                          </button>
                        ))
                      ) : (
                        <div className="dropdown-item">
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Yükleniyor...
                        </div>
                      )}
                    </div>
                  )}
                </li>
                <li className="nav-item">
                  <Link className="nav-link custom-nav-link" to="/results">
                    <i className="fas fa-chart-bar me-1"></i>
                    <span>Sonuçlarım</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {currentUser ? (
              <>
                <li className="nav-item">
                  <span className="nav-link custom-nav-link">
                    <i className="fas fa-user-circle me-1"></i>
                    Merhaba, {currentUser.username}
                  </span>
                </li>
                <li className="nav-item ms-2">
                  <button
                    className="btn btn-light btn-sm rounded-pill custom-logout-btn"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-1"></i>
                    <span>Çıkış</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link custom-nav-link" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Giriş
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link custom-nav-link" to="/register">
                    <i className="fas fa-user-plus me-1"></i>
                    Kayıt Ol
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
