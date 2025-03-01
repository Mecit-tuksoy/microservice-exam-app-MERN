import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const ResultsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <div>Sonuçlar yükleniyor...</div>;

  const convertToLetter = (num) => {
    const options = ["A", "B", "C", "D"];
    return options[num - 1] || "-"; // Geçersiz bir değer varsa "-" göster
  };

  return (
    <div className="results-container">
      <Header />
      <h2>Test Sonuçları</h2>
      <p>Konu: {state.subject}</p>
      <p>Toplam Soru: {state.totalQuestions}</p>
      <p>Doğru: {state.correctCount}</p>
      <p>Yanlış: {state.wrongCount}</p>
      <p>Boş: {state.emptyCount}</p>
      <p>Net: {state.netScore}</p>

      <h3>Cevaplar</h3>
      <table className="results-table">
        <thead>
          <tr>
            <th>Soru No</th>
            <th>Kullanıcının Cevabı</th>
            <th>Doğru Cevap</th>
          </tr>
        </thead>
        <tbody>
          {state.details.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td> {/* Soru numarasını düzeltiyoruz */}
              <td style={{ 
                backgroundColor: item.status === "correct" ? "lightgreen" : 
                                item.status === "wrong" ? "salmon" : "lightgray"
              }}>
                {item.userAnswer ? convertToLetter(parseInt(item.userAnswer)) : "Boş"}
              </td>
              <td>{convertToLetter(parseInt(item.correctAnswer))}</td>
            </tr>
          ))}
        </tbody>  
      </table>

      <button onClick={() => navigate("/")}>Ana Sayfaya Dön</button>
    </div>
  );
};

export default ResultsPage;
