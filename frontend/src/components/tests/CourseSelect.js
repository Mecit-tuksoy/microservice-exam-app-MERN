// src/components/CourseSelect.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "../../services/testService";

const CourseSelect = () => {
  const { sinif } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await testService.getCourses(sinif);
        setCourses(data);
      } catch (err) {
        setError("Dersler yüklenirken hata oluştu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [sinif]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h2>{sinif} için Hangi Dersten Test Çözmek İstersiniz?</h2>
      <ul className="list-group mt-3">
        {courses.map((course, index) => (
          <li
            key={index}
            className="list-group-item list-group-item-action"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/classes/${sinif}/dersler/${course}/konular`)
            }
          >
            {course}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseSelect;
