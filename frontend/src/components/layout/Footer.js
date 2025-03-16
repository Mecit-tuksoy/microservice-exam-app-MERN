// src/components/layout/Footer.js
import React, { useEffect, useState } from "react";
import analyticsService from "../../services/analyticsService";

const Footer = () => {
  const [visitorStats, setVisitorStats] = useState({ today: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Ziyaretçi sayısını artır
        await analyticsService.incrementVisitor();

        // İstatistikleri getir
        const stats = await analyticsService.getVisitorStats();
        setVisitorStats(stats);
        setLoading(false);
      } catch (err) {
        console.error("Ziyaretçi takibi hatası:", err);
        setError("İstatistikler yüklenemedi");
        setLoading(false);
      }
    };

    trackVisitor();
  }, []);

  return (
    <footer className="bg-light py-4 mt-auto">
      <div className="container text-center">
        <p className="mb-0">
          Mecit Hoca. Tüm Hakları Saklıdır. &copy; {new Date().getFullYear()}
        </p>

        {loading ? (
          <small className="text-muted">
            Ziyaretçi istatistikleri yükleniyor...
          </small>
        ) : error ? (
          <small className="text-danger">{error}</small>
        ) : (
          <small className="text-muted">
            Bugün: {visitorStats.today} ziyaretçi | Toplam: {visitorStats.total}{" "}
            ziyaretçi
          </small>
        )}
      </div>
    </footer>
  );
};

export default Footer;
