import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { testService } from "../../services/testService";
import { resultService } from "../../services/resultService";
import { useAuth } from "../../context/AuthContext";

const TestSelector = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Seçilen değerler
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Sınıfları yükle
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

  // Son çözülen testleri ve sonuçları yükle
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setResultsLoading(true);

      Promise.all([
        testService.getRecentTests(currentUser.id),
        resultService.getUserResults(),
      ])
        .then(([recentData, resultsData]) => {
          setRecentTests(recentData);

          // Son 3 test sonucunu al (eğer varsa)
          setRecentResults(
            Array.isArray(resultsData) ? resultsData.slice(0, 3) : []
          );
        })
        .catch((error) => {
          console.error("Veriler yüklenirken hata:", error);
          console.error("Hata detayı:", error.message);
          // Hata durumunda boş diziler ayarla
          setRecentTests([]);
          setRecentResults([]);
        })
        .finally(() => setResultsLoading(false));
    }
  }, [isAuthenticated, currentUser]);

  // Sınıf seçildiğinde dersleri yükle
  useEffect(() => {
    if (!selectedClass) {
      setCourses([]);
      return;
    }

    const fetchCourses = async () => {
      try {
        const data = await testService.getCourses(selectedClass);
        setCourses(data);
        setSelectedCourse("");
        setTopics([]);
        setSelectedTopic("");
      } catch (err) {
        setError("Dersler yüklenirken hata oluştu");
        console.error(err);
      }
    };

    fetchCourses();
  }, [selectedClass]);

  // Ders seçildiğinde konuları yükle
  useEffect(() => {
    if (!selectedClass || !selectedCourse) {
      setTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const data = await testService.getTopics(selectedClass, selectedCourse);
        setTopics(data);
        setSelectedTopic("");
      } catch (err) {
        setError("Konular yüklenirken hata oluştu");
        console.error(err);
      }
    };

    fetchTopics();
  }, [selectedClass, selectedCourse]);

  // Teste başla
  const handleStartTest = async () => {
    if (!selectedClass || !selectedCourse || !selectedTopic) return;

    try {
      // Önce test detaylarını gösterme seçeneği
      navigate(`/tests/${selectedClass}/${selectedCourse}/${selectedTopic}`);

      // Veya direkt teste başlama seçeneği:
      // const response = await testService.startTest(selectedClass, selectedCourse, selectedTopic);
      // navigate(`/tests/active/${response.testId}`);
    } catch (err) {
      setError("Test başlatılırken hata oluştu");
      console.error(err);
    }
  };

  // Tarih formatını düzenleme fonksiyonu
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("tr-TR", options);
  };

  // Varolan bir testi tekrar başlat
  const handleRestartTest = async (test) => {
    try {
      const response = await testService.startTest(
        test.sinif,
        test.ders,
        test.konu
      );
      navigate(`/tests/active/${response.testId}`);
    } catch (err) {
      console.error("Test başlatılırken hata:", err);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h2>Test Seçimi</h2>

      <div className="row g-3 mt-3">
        {/* Sınıf Seçimi */}
        <div className="col-md-4">
          <div className="form-floating">
            <select
              className="form-select"
              id="classSelect"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Seçiniz</option>
              {classes.map((cls, index) => (
                <option key={index} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <label htmlFor="classSelect">Sınıf Seviyesi</label>
          </div>
        </div>

        {/* Ders Seçimi */}
        <div className="col-md-4">
          <div className="form-floating">
            <select
              className="form-select"
              id="courseSelect"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">Seçiniz</option>
              {courses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <label htmlFor="courseSelect">Ders</label>
          </div>
        </div>

        {/* Konu Seçimi */}
        <div className="col-md-4">
          <div className="form-floating">
            <select
              className="form-select"
              id="topicSelect"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="">Seçiniz</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            <label htmlFor="topicSelect">Konu</label>
          </div>
        </div>
      </div>

      <div className="d-grid gap-2 col-6 mx-auto mt-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleStartTest}
          disabled={!selectedTopic}
        >
          Teste Başla
        </button>
      </div>

      {/* Son Çözülen Testler Bölümü - Home.js'den alındı */}
      {isAuthenticated && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Son Çözülen Testler</h2>
            <Link to="/results" className="btn btn-outline-primary btn-sm">
              Tüm Sonuçları Görüntüle
            </Link>
          </div>

          {resultsLoading ? (
            <div className="d-flex justify-content-center mt-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div className="row mt-3">
              {Array.isArray(recentResults) && recentResults.length > 0 ? (
                recentResults.map((result, index) => (
                  <div className="col-md-4" key={index}>
                    <div className="card mb-4 h-100 border-left border-3 border-primary">
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start">
                          <h5 className="card-title">{result.subject}</h5>
                          <span
                            className={`badge ${
                              result.netScore >= 10 ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {result.netScore.toFixed(2)} Net
                          </span>
                        </div>

                        <div className="mt-2">
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Doğru:</small>
                            <span className="text-success">
                              {result.correctAnswers}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Yanlış:</small>
                            <span className="text-danger">
                              {result.wrongAnswers}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Boş:</small>
                            <span className="text-secondary">
                              {result.emptyAnswers}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Toplam:</small>
                            <span>{result.totalQuestions}</span>
                          </div>
                        </div>

                        {result.rank && (
                          <div className="mt-2 d-flex justify-content-between">
                            <small className="text-muted">Sıralama:</small>
                            <span className="badge bg-info">
                              {result.rank} / {result.totalParticipants}
                            </span>
                          </div>
                        )}

                        <small className="text-muted mt-2">
                          {formatDate(result.date)}
                        </small>

                        <div className="mt-auto pt-3 d-flex justify-content-between">
                          <Link
                            to={`/results/${result._id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Detayları Gör
                          </Link>

                          {recentTests.find(
                            (test) =>
                              test.konu === result.subject ||
                              test.ders === result.subject
                          ) && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                handleRestartTest(
                                  recentTests.find(
                                    (test) =>
                                      test.konu === result.subject ||
                                      test.ders === result.subject
                                  )
                                )
                              }
                            >
                              Tekrar Çöz
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info d-flex align-items-center justify-content-between">
                    <span>
                      Henüz test çözülmemiş veya sonuçlar yüklenemedi.
                    </span>
                    <Link to="/classes" className="btn btn-primary btn-sm ms-3">
                      Tüm testleri görüntüle
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestSelector;
