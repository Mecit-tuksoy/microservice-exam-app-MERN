import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { testService } from "../../services/testService";

const TestSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Arama yapma
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.length >= 3) {
        setIsLoading(true);
        testService
          .searchTests(searchTerm)
          .then((results) => {
            setSearchResults(results);
            setShowResults(true);
          })
          .catch((err) => console.error("Arama sırasında hata:", err))
          .finally(() => setIsLoading(false));
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Sonuçlar dışındaki bir yere tıklandığında sonuçları gizle
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTestSelect = async (test) => {
    setShowResults(false);
    setSearchTerm("");
    navigate(`/tests/${test.sinif}/${test.ders}/${test.konu}`);
  };

  return (
    <div className="position-relative" ref={searchRef}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Sınıf, ders veya konu ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 3 && setShowResults(true)}
        />
        <button className="btn btn-primary" type="button">
          <i className="bi bi-search"></i>
        </button>
      </div>

      {showResults && (
        <div className="position-absolute top-100 start-0 end-0 mt-1 shadow-lg bg-white rounded z-index-1000">
          {isLoading ? (
            <div className="p-3 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : (
            <>
              {searchResults.length > 0 ? (
                <ul className="list-group">
                  {searchResults.map((test, index) => (
                    <li
                      key={index}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleTestSelect(test)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>
                            {test.sinif} - {test.ders}
                          </strong>
                          <div>{test.konu}</div>
                        </div>
                        <span className="badge bg-primary rounded-pill">
                          {test.questionCount} soru
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-center">
                  {searchTerm.length >= 3
                    ? "Sonuç bulunamadı"
                    : "En az 3 karakter girin"}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TestSearch;
