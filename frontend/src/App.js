// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import Layout from "./components/layout/Layout";

import Home from "./components/Home";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import TestList from "./components/tests/TestList";
import TestDetail from "./components/tests/TestDetail";
import TakeTest from "./components/tests/TakeTest";
import TestResult from "./components/results/TestResult";
import ResultsList from "./components/results/ResultsList";
import NotFound from "./components/NotFound";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/tests"
              element={
                <ProtectedRoute>
                  <TestList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tests/:subject" // Test bilgilendirme ekranı
              element={
                <ProtectedRoute>
                  <TestDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tests/active/:testId" // Test çözme ekranı
              element={
                <ProtectedRoute>
                  <TakeTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <ResultsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:resultId"
              element={
                <ProtectedRoute>
                  <TestResult />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
