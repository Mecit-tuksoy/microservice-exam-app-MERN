// src/components/tests/TestDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';

const TestDetail = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        // Storage'dan test detaylarını alıyoruz, testi başlatmıyoruz
        const data = await testService.getSubjectTest(subject);
        setTest({
          subject: data.subject,
          duration: data.duration,
          questionCount: data.questionCount,
          questions: data.questions
        });
      } catch (err) {
        setError('Test detayları yüklenirken bir hata oluştu');
        console.error('Test detay yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [subject]);

  const handleStartTest = async () => {
    try {
      // Testi burada başlatıyoruz
      const response = await testService.startTest(subject);
      navigate(`/tests/active/${response.testId}`);
    } catch (err) {
      setError('Test başlatılırken bir hata oluştu');
      console.error('Test başlatma hatası:', err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5" role="alert">
        {error}
      </div>
    );
  }

  if (!test) {
    return (
      <div className="alert alert-warning mt-5" role="alert">
        Test bulunamadı.
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header">
          <h2>{test.subject} Testi</h2>
        </div>
        <div className="card-body">
          <h5 className="card-title">Test Detayları</h5>
          <p className="card-text">{test.subject} konusuna ait bir test.</p>
          
          <ul className="list-group list-group-flush mb-4">
            <li className="list-group-item">
              <strong>Toplam Soru:</strong> {test.questionCount}
            </li>
            <li className="list-group-item">
              <strong>Süre:</strong> {test.duration} dakika
            </li>
          </ul>
          
          <div className="alert alert-info">
            <strong>Not:</strong> Teste başladıktan sonra {test.duration} dakikalık süre işlemeye başlayacak. Hazır olduğunuzda "Teste Başla" butonuna tıklayın.
          </div>
          
          <button 
            className="btn btn-primary btn-lg w-100" 
            onClick={handleStartTest}
          >
            Teste Başla
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;