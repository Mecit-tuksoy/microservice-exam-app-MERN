import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage = () => {
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3004/api/tests/available", {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
            "user-id": JSON.parse(localStorage.getItem("user")).id,
            "username": JSON.parse(localStorage.getItem("user")).username
          }
        });
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="home-container">
      <Header />
      <h2>Mevcut Testler</h2>
      <div className="subjects-list">
        {subjects.map((subject) => (
          <div key={subject.subject} className="subject-card">
            <h3>{subject.subject}</h3>
            <p>Süre: {subject.duration} dk</p>
            {subject.active && subject.remainingTime !== null && (
              <p>Kalan Süre: {subject.remainingTime} sn</p>
            )}
            <button onClick={() => navigate(`/test/${subject.subject}`)}>
              Testi Başlat
            </button>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
