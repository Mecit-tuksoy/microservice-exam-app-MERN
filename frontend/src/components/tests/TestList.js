// src/components/tests/TestList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../../services/testService';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const data = await testService.getAllTests();
        const processedData = data.map((test, index) => ({
          ...test,
          _id: test._id || test.id || test.subject || `test-${index}`
        }));
        setTests(processedData);
      } catch (err) {
        setError('Testler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

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

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Mevcut Testler</h2>
      {tests.length === 0 ? (
        <div className="alert alert-info">Henüz hiç test bulunmuyor.</div>
      ) : (
        <div className="row">
          {tests.map((test) => (
            <div key={test._id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{test.title || test.subject}</h5>
                  <p className="card-text">{test.description || 'Bu test için açıklama bulunmuyor.'}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      Soru Sayısı: {test.questionCount || '?'} | Süre: {test.duration || '?'} dakika
                    </small>
                  </p>
                </div>
                <div className="card-footer">
                  <Link to={`/tests/${test.subject}`} className="btn btn-primary w-100">
                    Testi Görüntüle
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestList;