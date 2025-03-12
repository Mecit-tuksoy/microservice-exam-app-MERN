import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { resultService } from "../../services/resultService";

const ResultsList = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await resultService.getUserResults();
        setResults(data);
      } catch (err) {
        setError("Sonuçlar yüklenirken bir hata oluştu");
        console.error("Sonuç yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
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

  if (!results.length) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info" role="alert">
          Henüz hiç test sonucunuz bulunmuyor. <Link to="/tests">Buradan</Link>{" "}
          bir test çözmeye başlayabilirsiniz.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Test Sonuçlarım</h2>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Test Konusu</th>
              <th>Net</th>
              <th>Doğru / Toplam</th>
              <th>Sıralama</th>
              <th>Tarih</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result._id}>
                <td>{result.subject}</td>
                <td>
                  <span
                    className={`badge ${
                      result.netScore >= 10 ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {result.netScore.toFixed(2)}
                  </span>
                </td>
                <td>
                  {result.correctAnswers} / {result.totalQuestions}
                </td>
                <td>
                  {result.rank
                    ? `${result.rank} / ${result.totalParticipants}`
                    : "Hesaplanmadı"}
                </td>
                <td>{new Date(result.date).toLocaleDateString("tr-TR")}</td>
                <td>
                  <Link
                    to={`/results/${result._id}`}
                    className="btn btn-sm btn-primary"
                  >
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsList;
