import React, { useState, useEffect } from "react";

const Footer = () => {
  const [visitorData, setVisitorData] = useState({ today: 0, total: 0 });

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/analytics/visitors");
        const data = await response.json();
        setVisitorData(data);
      } catch (error) {
        console.error("Visitor data alınamadı:", error);
      }
    };
    fetchVisitors();
  }, []);

  return (
    <footer className="footer">
      <p>Bugünkü Ziyaretçi: {visitorData.today} | Toplam Ziyaretçi: {visitorData.total}</p>
    </footer>
  );
};

export default Footer;
