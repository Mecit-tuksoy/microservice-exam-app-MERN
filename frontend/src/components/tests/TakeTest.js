import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "../../services/testService";

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);

  const isSubmitting = useRef(false);

  // Test submission handler
  const handleSubmitTest = useCallback(async () => {
    // Ref kullanarak çoklu gönderimi engelle
    if (isSubmitting.current) return;

    try {
      isSubmitting.current = true;
      setLoading(true);
      const result = await testService.submitTest(testId, answers);
      navigate(`/results/${result.resultId}`);
    } catch (err) {
      setError("Test gönderilirken bir hata oluştu");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
      // Gönderimi tamamladıktan sonra ref'i sıfırla
      isSubmitting.current = false;
    }
  }, [testId, answers, navigate]);

  // Fetch active test data
  useEffect(() => {
    const fetchActiveTest = async () => {
      try {
        const response = await testService.getActiveTest(testId);
        console.log("Fetched test data:", response);
        setActiveTest(response.activeTest);
        setQuestions(response.questions || []);

        // Persist answers from server if available
        setAnswers(response.answers || {});

        setTimeLeft(response.activeTest.remainingTime || 0);
      } catch (err) {
        setError("Test yüklenirken bir hata oluştu");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveTest();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, handleSubmitTest]);

  // Handle answer selection
  const handleAnswerChange = async (questionId, value) => {
    if (!questionId || typeof questionId !== "string") {
      console.error("Invalid questionId:", questionId);
      setError("Geçersiz soru kimliği, cevap kaydedilemedi.");
      return;
    }

    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    try {
      await testService.saveAnswer(testId, questionId, value);
    } catch (err) {
      console.error("Cevap kaydedilemedi:", err.response?.data || err);
      setError("Cevap sunucuya kaydedilemedi, lütfen tekrar deneyin.");
    }
  };

  // Clear answer
  const handleClearAnswer = async (questionId) => {
    if (!questionId || typeof questionId !== "string") {
      console.error("Invalid questionId for clear:", questionId);
      return;
    }

    setAnswers((prev) => ({ ...prev, [questionId]: null }));
    try {
      await testService.saveAnswer(testId, questionId, null);
    } catch (err) {
      console.error("Cevap temizlenemedi:", err.response?.data || err);
      setError("Cevap temizlenemedi, lütfen tekrar deneyin.");
    }
  };

  // Navigation between questions
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmitTest();
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (seconds === null || seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Get image URL from service
  const getImageUrl = (imageUrl) => {
    return testService.getImageUrlPath(imageUrl);
  };

  // Render logic
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

  if (!activeTest || questions.length === 0) {
    return (
      <div className="alert alert-warning mt-5" role="alert">
        Test bulunamadı veya süresi doldu.
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="alert alert-warning mt-5" role="alert">
        Test süresi dolmuş. Lütfen testi bitirin.
        <button onClick={handleSubmitTest} className="btn btn-primary mt-3">
          Testi Bitir
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion || !currentQuestion.questionId) {
    return <div>Soru yüklenemedi.</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h3>{activeTest.testTitle}</h3>
            <div className="badge bg-primary fs-5">
              Süre: {formatTime(timeLeft)}
            </div>
          </div>
          <div className="progress mt-2">
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
              aria-valuenow={currentQuestionIndex + 1}
              aria-valuemin="0"
              aria-valuemax={questions.length}
            >
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Soru {currentQuestionIndex + 1}</h5>
        </div>
        <div className="card-body">
          {currentQuestion.imageUrl && (
            <div className="text-center mb-4">
              <img
                src={getImageUrl(currentQuestion.imageUrl)}
                alt={`Soru ${currentQuestionIndex + 1}`}
                className="img-fluid"
                style={{ maxHeight: "300px" }}
                onError={(e) => {
                  console.error(
                    "Görsel yüklenemedi:",
                    currentQuestion.imageUrl
                  );
                  e.target.src = "/default-image.jpg";
                }}
              />
            </div>
          )}
          <p className="card-text">{currentQuestion.text}</p>

          {/* Şıklar - Ortalanmış Hali */}
          <div className="mt-4 text-center">
            <div className="d-flex justify-content-center mb-3">
              <div className="d-flex gap-4">
                {["1", "2", "3", "4"].map((option, index) => (
                  <div
                    key={index}
                    className="text-center"
                    style={{ margin: "0 15px" }}
                  >
                    <div
                      className={`rounded-circle d-flex justify-content-center align-items-center border ${
                        answers[currentQuestion.questionId] === option
                          ? "bg-primary text-white"
                          : ""
                      }`}
                      style={{
                        width: "50px",
                        height: "50px",
                        cursor: "pointer",
                        margin: "0 auto",
                      }}
                      onClick={() =>
                        handleAnswerChange(currentQuestion.questionId, option)
                      }
                    >
                      <span className="fw-bold">
                        {["A", "B", "C", "D"][index]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn btn-outline-danger mt-3"
              onClick={() => handleClearAnswer(currentQuestion.questionId)}
            >
              Temizle
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <button
          className="btn btn-secondary"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Önceki Soru
        </button>
        <button className="btn btn-primary" onClick={handleNextQuestion}>
          {currentQuestionIndex < questions.length - 1
            ? "Sonraki Soru"
            : "Testi Bitir"}
        </button>
      </div>

      <div className="mt-4">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`btn ${
                index === currentQuestionIndex
                  ? "btn-primary"
                  : answers[questions[index].questionId]
                  ? "btn-success"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
