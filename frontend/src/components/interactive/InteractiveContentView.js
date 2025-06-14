// src/components/interactive/InteractiveContentView.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { interactiveService } from "../../services/interactiveService";
import { storageApi } from "../../services/api";

const InteractiveContentView = () => {
  const { contentId } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContentInfo = async () => {
      try {
        setLoading(true);
        const contentData = await interactiveService.getContentById(contentId);

        if (!contentData) {
          setError("İçerik bulunamadı.");
          return;
        }

        setContent(contentData);
        setError(null);
      } catch (err) {
        console.error("İçerik bilgileri yüklenirken hata:", err);
        setError("İçerik bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchContentInfo();
  }, [contentId]);

  if (loading)
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/interactive-contents" className="btn btn-primary mt-3">
          İçerik Listesine Dön
        </Link>
      </div>
    );

  // content.contentUrl: "/api/storage/interactive-contents/:id"
  // Prefix with storageApi.baseURL (e.g. "http://localhost:3003") to form full URL
  const iframeSrc = content.contentUrl;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>{content.title}</h1>
          {content.category && (
            <span className="badge bg-primary me-2">{content.category}</span>
          )}
          {content.level && (
            <span className="badge bg-info">{content.level}</span>
          )}
        </div>
        <Link to="/interactive-contents" className="btn btn-outline-secondary">
          İçerik Listesine Dön
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <p className="card-text">{content.description}</p>
          {content.tags && (
            <div className="mb-3">
              {content.tags.map((tag, idx) => (
                <span key={idx} className="badge bg-secondary me-1">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="d-flex justify-content-between">
            {content.author && (
              <small className="text-muted">Yazar: {content.author}</small>
            )}
            {content.dateAdded && (
              <small className="text-muted">
                Eklenme Tarihi: {content.dateAdded}
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Etkileşimli İçerik</h5>
        </div>
        <div className="card-body p-0">
          <iframe
            src={iframeSrc}
            title={content.title}
            className="w-100"
            style={{ minHeight: "700px", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default InteractiveContentView;
