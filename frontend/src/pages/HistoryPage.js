import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:3004/api/tests/history", {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
            "user-id": user.id,
            "username": user.username
          }
        });
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Test geçmişi alınamadı:", error);
      }
    };
    fetchHistory();
  }, [token, user.id, user.username]);

  return (
    <div className="history-container">
      <Header />
      <h2>Çözülen Testler</h2>
      {history.length === 0 ? (
        <p>Henüz test çözülmemiş.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Konu</th>
              <th>Tarih</th>
              <th>Toplam Soru</th>
              <th>Doğru</th>
              <th>Yanlış</th>
              <th>Net</th>
              <th>Sıralama</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr
                key={item._id}
                onClick={() => navigate(`/results/${item.testId}`)}
                style={{ cursor: 'pointer' }}
              >
                <td>{item.subject}</td>
                <td>{new Date(item.date).toLocaleString()}</td>
                <td>{item.totalQuestions}</td>
                <td>{item.correctAnswers}</td>
                <td>{item.wrongAnswers}</td>
                <td>{item.netScore}</td>
                <td>{item.ranking} / {item.totalParticipants}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoryPage;
