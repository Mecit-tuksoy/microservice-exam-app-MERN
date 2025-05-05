// src/components/interactive/InteractiveContentsList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { interactiveService } from "../../services/interactiveService";
import { storageApi } from "../../services/api";

const InteractiveContentsList = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        const data = await interactiveService.getAllContents();
        setContents(data);
        setError(null);
      } catch (err) {
        console.error("Etkileşimli içerikler yüklenirken hata:", err);
        setError(
          "İçerikler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Etkileşimli Öğrenme İçerikleri</h1>
        <Link to="/" className="btn btn-outline-secondary">
          Ana Sayfaya Dön
        </Link>
      </div>

      {contents.length === 0 ? (
        <div className="alert alert-info" role="alert">
          Şu anda gösterilecek etkileşimli içerik bulunmamaktadır.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {contents.map((content) => (
            <div className="col" key={content.id}>
              <div className="card h-100">
                {content.previewImage && (
                  <div className="card-img-top bg-light d-flex justify-content-center align-items-center py-4">
                    <div
                      style={{
                        width: "100%",
                        height: "180px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#f8f9fa",
                        overflow: "hidden",
                      }}
                    >
                      {content.previewImageUrl ? (
                        <>
                          <img
                            src={`${storageApi.defaults.baseURL}${content.previewImageUrl}`}
                            alt={content.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              console.error(
                                `Görsel yüklenemedi: ${content.previewImageUrl}`
                              );
                              e.target.style.display = "none";
                              e.target.parentNode.innerHTML = `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center;">
                                <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 10px;"></i>
                                <p style="margin-bottom: 5px;">Görsel yüklenemedi</p>
                                <small style="word-break: break-all; padding: 0 5px;">${content.previewImageUrl}</small>
                              </div>`;
                            }}
                          />
                        </>
                      ) : (
                        <i
                          className="bi bi-braces-asterisk"
                          style={{ fontSize: "3rem", color: "#6c757d" }}
                        ></i>
                      )}
                    </div>
                  </div>
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">{content.title}</h5>
                    <span className="badge bg-primary">{content.category}</span>
                  </div>
                  <p className="card-text">{content.description}</p>

                  {content.tags && content.tags.length > 0 && (
                    <div className="mb-3">
                      {content.tags.map((tag, index) => (
                        <span key={index} className="badge bg-secondary me-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Seviye: {content.level}
                    </small>
                    {content.author && (
                      <small className="text-muted">
                        Yazar: {content.author}
                      </small>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <Link
                    to={`/interactive-contents/${content.id}`}
                    className="btn btn-primary w-100"
                  >
                    İçeriği Görüntüle
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

export default InteractiveContentsList;
