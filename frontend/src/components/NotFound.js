import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container text-center py-5">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Sayfa Bulunamadı</h2>
      <p className="lead mb-4">
        Aradığınız sayfa bulunamadı veya taşınmış olabilir.
      </p>
      <Link to="/" className="btn btn-primary">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFound;
