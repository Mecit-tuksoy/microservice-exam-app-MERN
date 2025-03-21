// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mt-5">
      <div className="jumbotron">
        <h1 className="display-4">Online Test Platformuna Hoş Geldiniz!</h1>
        <p className="lead">
          Bu platform, çeşitli konularda kendinizi test etmenize ve bilgilerinizi değerlendirmenize olanak tanır.
        </p>
        <hr className="my-4" />
        <p>
          Farklı zorluk seviyelerinde ve çeşitli konularda testler çözerek bilgilerinizi ölçebilirsiniz. Detaylı sonuç analizleri ile hangi konularda daha fazla çalışmanız gerektiğini görebilirsiniz.
        </p>
        {isAuthenticated() ? (
          <Link to="/tests" className="btn btn-primary btn-lg">
            Testleri Görüntüle
          </Link>
        ) : (
          <div className="d-flex gap-3">
            <Link to="/login" className="btn btn-primary btn-lg">
              Giriş Yap
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg">
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>

      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Çeşitli Konular</h5>
              <p className="card-text">
                Farklı konularda hazırlanmış testlerle bilgi seviyenizi ölçün.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Anında Sonuçlar</h5>
              <p className="card-text">
                Testi tamamladıktan hemen sonra detaylı sonuç analizi alın.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">İlerleme Takibi</h5>
              <p className="card-text">
                Zaman içindeki performansınızı görün ve gelişiminizi takip edin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;