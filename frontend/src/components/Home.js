import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { testService } from "../services/testService";
import { resultService } from "../services/resultService";

const Home = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [recentTests, setRecentTests] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [recommendedTests, setRecommendedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated() && currentUser) {
      setLoading(true);

      Promise.all([
        testService.getRecentTests(currentUser.id),
        testService.getRecommendedTests(currentUser.id),
        resultService.getUserResults(),
      ])
        .then(async ([recentData, recommendedData, resultsData]) => {
          setRecentTests(recentData);

          // Her önerilen test için detaylı bilgiyi alma
          const detailedRecommendedTests = await Promise.all(
            recommendedData.map(async (test) => {
              try {
                const testDetail = await testService.getTopicTest(
                  test.sinif,
                  test.ders,
                  test.konu
                );
                return { ...test, ...testDetail };
              } catch (err) {
                console.error(`${test.konu} testi için detay alınamadı:`, err);
                return test; // Hata durumunda orijinal veriyi kullan
              }
            })
          );

          setRecommendedTests(detailedRecommendedTests);

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
          setRecommendedTests([]);
          setRecentResults([]);
        })
        .finally(() => setLoading(false));
    } else {
      console.log("Kullanıcı kimliği doğrulanmadı veya kullanıcı bilgisi yok", {
        isAuthenticated: isAuthenticated
          ? isAuthenticated()
          : "fonksiyon bulunamadı",
        userExists: !!currentUser,
      });
    }
  }, [isAuthenticated, currentUser]);

  const handleStartTest = async (test) => {
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

  return (
    <div className="container mt-5">
      <div className="jumbotron">
        <h1 className="display-4">Online Test Platformuna Hoş Geldiniz!</h1>
        <p className="lead">
          Bu platform, çeşitli konularda kendinizi test etmenize ve
          bilgilerinizi değerlendirmenize olanak tanır.
        </p>
        <hr className="my-4" />
        <p>
          Farklı zorluk seviyelerinde ve çeşitli konularda testler çözerek
          bilgilerinizi ölçebilirsiniz. Detaylı sonuç analizleri ile hangi
          konularda daha fazla çalışmanız gerektiğini görebilirsiniz.
        </p>
        {isAuthenticated() ? (
          <div className="d-flex gap-3">
            <Link to="/test-selector" className="btn btn-primary btn-lg">
              Hızlı Test Seçimi
            </Link>
          </div>
        ) : (
          <div className="d-flex gap-3">
            <Link to="/login" className="btn btn-primary btn-lg">
              Giriş Yap
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg">
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>

      {/* Son Çözülen Testler Bölümü - Geliştirilmiş */}
      {isAuthenticated() && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Son Çözülen Testler</h2>
            <Link to="/results" className="btn btn-outline-primary btn-sm">
              Tüm Sonuçları Görüntüle
            </Link>
          </div>

          {loading ? (
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
                                handleStartTest(
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

      {/* Önerilen Testler Bölümü - Yeniden Tasarlanmış */}
      {isAuthenticated() && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Önerilen Testler</h2>
            <Link to="/classes" className="btn btn-outline-primary btn-sm">
              Tüm Testleri Görüntüle
            </Link>
          </div>
          {loading ? (
            <div className="d-flex justify-content-center mt-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div className="row mt-3">
              {recommendedTests.length > 0 ? (
                recommendedTests.map((test, index) => (
                  <div className="col-md-4" key={index}>
                    <div className="card mb-4 h-100 border-left border-3 border-success">
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start">
                          <h5 className="card-title">
                            {test.sinif} - {test.ders}
                          </h5>
                          <span className="badge bg-info">
                            {test.difficulty || "Normal"}
                          </span>
                        </div>

                        <h6 className="card-subtitle mb-3 text-muted">
                          {test.konu}
                        </h6>

                        <div className="mt-2">
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Süre:</small>
                            <span>{test.duration || "30"} dakika</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Soru Sayısı:</small>
                            <span>{test.questionCount || "20"}</span>
                          </div>
                        </div>

                        {test.lastAttempt && (
                          <small className="text-muted mt-3">
                            Son Çözülme: {formatDate(test.lastAttempt)}
                          </small>
                        )}

                        <div className="mt-auto pt-3 d-flex justify-content-between">
                          <Link
                            to={`/tests/${test.sinif}/${test.ders}/${test.konu}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Detayları Gör
                          </Link>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStartTest(test)}
                          >
                            Teste Başla
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info d-flex align-items-center justify-content-between">
                    <span>Şu anda önerilebilecek test bulunamadı.</span>
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

      {/* Özellikler Bölümü */}
      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Çeşitli Konular</h5>
              <p className="card-text">
                Farklı konularda hazırlanmış testlerle bilgi seviyenizi ölçün.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Anında Sonuçlar</h5>
              <p className="card-text">
                Testi tamamladıktan hemen sonra detaylı sonuç analizi alın.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">İlerleme Takibi</h5>
              <p className="card-text">
                Zaman içindeki performansınızı görün ve gelişiminizi takip edin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
