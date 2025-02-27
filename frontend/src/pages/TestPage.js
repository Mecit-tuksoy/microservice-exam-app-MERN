import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const TestPage = () => {
  const { subject } = useParams();
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Testi başlat veya devam ettir
  useEffect(() => {
    const startTest = async () => {
      try {
        const response = await fetch(`http://localhost:3004/api/tests/start/${subject}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
            "user-id": user.id,
            "username": user.username
          }
        });
        const data = await response.json();
        setTestData(data);
        setAnswers(data.answers || {});
        setRemainingTime(data.remainingTime);
      } catch (error) {
        console.error("Test başlatılamadı:", error);
      }
    };
    startTest();
  }, [subject, token, user.id, user.username]);

  // Geri sayım (saniye cinsinden)
  useEffect(() => {
    if (!remainingTime) return;
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          completeTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);

  const handleAnswerChange = async (questionId, value) => {
    // value: "1", "2", "3", "4" veya boş string için boş bırakma
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    try {
      await fetch(`http://localhost:3004/api/tests/answer/${testData.testId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
          "user-id": user.id,
          "username": user.username
        },
        body: JSON.stringify({ questionId, answer: value })
      });
    } catch (error) {
      console.error("Cevap kaydedilemedi:", error);
    }
  };

  const completeTest = async () => {
    try {
      const response = await fetch(`http://localhost:3004/api/tests/complete/${testData.testId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
          "user-id": user.id,
          "username": user.username
        }
      });
      const result = await response.json();
      navigate(`/results/${testData.testId}`, { state: result });
    } catch (error) {
      console.error("Test tamamlanamadı:", error);
    }
  };

  if (!testData) return <div>Test yükleniyor...</div>;

  return (
    <div className="test-container">
      <Header />
      <h2>{testData.subject} Testi</h2>
      <p>Kalan Süre: {remainingTime} sn</p>
      <div className="questions-list">
        {testData.questions.map((q) => (
          <div key={q.questionId} className="question-card">
            <img
              src={`http://localhost:3003${q.imageUrl}`}
              alt={q.questionId}
              className="question-image"
            />
            <div className="options">
              {['1','2','3','4'].map((option, index) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={q.questionId}
                    value={option}
                    checked={answers[q.questionId] === option}
                    onChange={() => handleAnswerChange(q.questionId, option)}
                  />
                  {['A', 'B', 'C', 'D'][index]}
                </label>
              ))}
              <button onClick={() => handleAnswerChange(q.questionId, "")}>
                Temizle
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={completeTest} className="complete-btn">
        Testi Bitir
      </button>
    </div>
  );
};

export default TestPage;
