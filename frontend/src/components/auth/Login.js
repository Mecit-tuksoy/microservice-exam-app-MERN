import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const initialValues = {
    username: '',
    password: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Kullanıcı adı gerekli'),
    password: Yup.string().required('Şifre gerekli'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // console.log('Login form gönderiliyor:', values);
      await login(values);
      navigate('/');
    } catch (err) {
      console.error('Login hatası:', err);
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center">Giriş Yap</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">Kullanıcı Adı</label>
                      <Field type="text" name="username" className="form-control" />
                      <ErrorMessage name="username" component="div" className="text-danger" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Şifre</label>
                      <Field type="password" name="password" className="form-control" />
                      <ErrorMessage name="password" component="div" className="text-danger" />
                    </div>
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
              <div className="text-center mt-3">
                <p>
                  Hesabın yok mu? <a href="/register">Kayıt Ol</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;