// src/components/ClassSelect.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { testService } from "../../services/testService";

const ClassSelect = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await testService.getClasses();
        setClasses(data);
      } catch (err) {
        setError("Sınıflar yüklenirken hata oluştu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h2>Hangi Sınıf Seviyesinde Test Çözmek İstersiniz?</h2>
      <ul className="list-group mt-3">
        {classes.map((cls, index) => (
          <li
            key={index}
            className="list-group-item list-group-item-action"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/classes/${cls}/dersler`)}
          >
            {cls}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassSelect;
