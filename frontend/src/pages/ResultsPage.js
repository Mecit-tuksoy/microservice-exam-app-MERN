import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const ResultsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <div>Sonuçlar yükleniyor...</div>;

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
      {state.rank && (
        <p>
          Sıralamanız: {state.rank} / {state.totalParticipants}
        </p>
      )}
      <button onClick={() => navigate("/")}>Ana Sayfaya Dön</button>
    </div>
  );
};

export default ResultsPage;
