// src/components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container mt-5 text-center">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Sayfa Bulunamadı</h2>
      <p className="lead">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link to="/" className="btn btn-primary mt-3">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFound;