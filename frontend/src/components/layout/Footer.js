// src/components/layout/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light py-4 mt-auto">
      <div className="container text-center">
        <p className="mb-0">Test Uygulaması &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;