// src/components/tests/TestDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "../../services/testService";

const TestDetail = () => {
  const { sinif, ders, konu } = useParams();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestDetail = async () => {
      try {
        const data = await testService.getTopicTest(sinif, ders, konu);
        setTestData(data);
      } catch (err) {
        setError("Test detayları yüklenirken hata oluştu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetail();
  }, [sinif, ders, konu]);

  const handleStartTest = async () => {
    // startTest metodunu kullanarak backend'e istekte bulunabilir,
    // gelen testId ile /tests/active/... rotasına yönlendirme yapabilirsiniz.
    const response = await testService.startTest(sinif, ders, konu);
    navigate(`/tests/active/${response.testId}`);
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  if (!testData) return <div>Test bilgisi bulunamadı.</div>;

  return (
    <div className="container mt-5">
      <h2>{konu} Testi Detayları</h2>
      <p>
        <strong>Süre:</strong> {testData.duration} dakika
      </p>
      <p>
        <strong>Soru Sayısı:</strong> {testData.questionCount}
      </p>
      <button className="btn btn-primary" onClick={handleStartTest}>
        Teste Başla
      </button>
    </div>
  );
};

export default TestDetail;
