// src/components/TopicSelect.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "../../services/testService";

const TopicSelect = () => {
  const { sinif, ders } = useParams();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await testService.getTopics(sinif, ders);
        setTopics(data);
      } catch (err) {
        setError("Konular yüklenirken hata oluştu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [sinif, ders]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h2>
        {sinif} {ders} Dersi için Hangi Konu Testini Çözmek istersiniz?
      </h2>
      <ul className="list-group mt-3">
        {topics.map((topic, index) => (
          <li
            key={index}
            className="list-group-item list-group-item-action"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/tests/${sinif}/${ders}/${topic}`)}
          >
            {topic}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopicSelect;
