import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { resultService } from "../../services/resultService";

const TestResult = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await resultService.getResultById(resultId);
        setResult(data);
      } catch (err) {
        setError("Sonuç yüklenirken bir hata oluştu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="alert alert-danger mt-5" role="alert">
        {error}
      </div>
    );
  if (!result)
    return (
      <div className="alert alert-warning mt-5" role="alert">
        Sonuç bulunamadı.
      </div>
    );

  const mapToLetter = (num) => {
    if (num === null || num === undefined || num === "") return "-";
    const letters = ["A", "B", "C", "D"];
    return letters[parseInt(num) - 1] || num;
  };

  const answers = [];
  if (result.userAnswers && result.correctAnswerMap) {
    const sortedQuestionIds = Object.keys(result.userAnswers).sort((a, b) => {
      const numA = parseInt(a.replace("q", ""));
      const numB = parseInt(b.replace("q", ""));
      return numA - numB;
    });
    sortedQuestionIds.forEach((questionId, index) => {
      const userAnswerNum = result.userAnswers[questionId];
      const correctAnswerNum = result.correctAnswerMap[questionId];
      const userAnswerLetter = mapToLetter(userAnswerNum);
      const correctAnswerLetter = mapToLetter(correctAnswerNum);
      const isCorrect = userAnswerNum === correctAnswerNum;
      answers.push({
        questionNumber: index + 1,
        userAnswer: userAnswerLetter,
        correctAnswer: correctAnswerLetter,
        isCorrect,
      });
    });
  }

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Test Sonucu - {result.subject}</h2>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Net Puanınız</h5>
                  <h2 className="display-4">{result.netScore.toFixed(2)}</h2>
                  <p className="card-text text-muted">
                    Toplam Soru: {result.totalQuestions}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Doğru Cevaplar</h5>
                  <h2 className="display-4">{result.correctAnswers}</h2>
                  <p className="card-text text-muted">
                    Yanlış: {result.wrongAnswers}, Boş: {result.emptyAnswers}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Sıralamanız</h5>
                  <h2 className="display-4">{result.rank || "N/A"}</h2>
                  <p className="card-text text-muted">
                    Toplam Katılımcı: {result.totalParticipants || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="accordion" id="answersAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  Tüm Cevaplar
                </button>
              </h2>
              <div
                id="collapseOne"
                className="accordion-collapse collapse show"
                aria-labelledby="headingOne"
                data-bs-parent="#answersAccordion"
              >
                <div className="accordion-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Soru Numarası</th>
                          <th>Sizin Cevabınız</th>
                          <th>Doğru Cevap</th>
                          <th>Sonuç</th>
                        </tr>
                      </thead>
                      <tbody>
                        {answers.map((answer, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{answer.questionNumber}</td>
                            <td>{answer.userAnswer}</td>
                            <td>{answer.correctAnswer}</td>
                            <td>
                              {answer.isCorrect ? (
                                <span className="badge bg-success">Doğru</span>
                              ) : (
                                <span className="badge bg-danger">Yanlış</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 d-flex justify-content-between">
            <Link to="/tests" className="btn btn-primary">
              Tüm Testlere Dön
            </Link>
            <Link to="/results" className="btn btn-outline-primary">
              Tüm Sonuçlarım
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResult;
