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
  const [isMouseInDropdown, setIsMouseInDropdown] = useState(false);

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

  // Mouse tıklaması ile dropdown'ın dışına tıklandığında kapanması için
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

  // Mouse hareketi takibi için
  useEffect(() => {
    if (!isMouseInDropdown) {
      const timer = setTimeout(() => {
        if (!isMouseInDropdown) {
          setShowClassDropdown(false);
        }
      }, 300); // Biraz gecikme ile kapatma işlemi

      return () => clearTimeout(timer);
    }
  }, [isMouseInDropdown]);

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
        <Link
          className="btn btn-light btn-sm rounded-pill custom-logout-btn"
          to="/"
        >
          <i className="fas fa-book-open me-1"></i>
          <span>Test Uygulaması</span>
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
          {/* Sol taraftaki menü öğeleri */}
          <ul className="navbar-nav">
            {currentUser && (
              <>
                <li
                  className="nav-item dropdown"
                  ref={dropdownRef}
                  onMouseEnter={() => {
                    setIsMouseInDropdown(true);
                    setShowClassDropdown(true);
                  }}
                  onMouseLeave={() => {
                    setIsMouseInDropdown(false);
                  }}
                >
                  <div
                    className="btn btn-light btn-sm rounded-pill custom-logout-btn dropdown-toggle"
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                  >
                    <i className="fas fa-chalkboard me-1"></i>
                    <span>Sınıflar</span>
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
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Yükleniyor...
                        </div>
                      )}
                    </div>
                  )}
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-light btn-sm rounded-pill custom-logout-btn"
                    to="/results"
                  >
                    <i className="fas fa-chart-bar me-1"></i>
                    <span>Sonuçlarım</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-light btn-sm rounded-pill custom-logout-btn"
                    to="/interactive-contents"
                  >
                    <i className="fas fa-brain me-1"></i>
                    <span>Etkileşimli Öğrenme Ortamı</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Sağ taraftaki menü öğeleri */}
          <ul className="navbar-nav ms-auto">
            {currentUser ? (
              <>
                <li className="nav-item">
                  <span className="btn btn-light btn-sm rounded-pill custom-logout-btn">
                    <i className="fas fa-user-circle me-1"></i>
                    <span>Merhaba, {currentUser.username}</span>
                  </span>
                </li>
                <li className="nav-item">
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
                  <Link
                    className="btn btn-light btn-sm rounded-pill custom-logout-btn"
                    to="/login"
                  >
                    <i className="fas fa-sign-in-alt me-1"></i>
                    <span>Giriş</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-light btn-sm rounded-pill custom-logout-btn"
                    to="/register"
                  >
                    <i className="fas fa-user-plus me-1"></i>
                    <span>Kayıt Ol</span>
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
