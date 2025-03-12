import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');

  const initialValues = {
    username: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Kullanıcı adı gerekli'),
    password: Yup.string()
      .min(6, 'Şifre en az 6 karakter olmalıdır')
      .required('Şifre gerekli'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
      .required('Şifre onayı gerekli'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // console.log('Form gönderiliyor:', values);
      const { confirmPassword, ...userData } = values;
      const result = await register(userData);
      // console.log('Kayıt başarılı:', result);
      navigate('/login');
    } catch (err) {
      // console.error('Kayıt hatası:', err);
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu');
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
              <h3 className="text-center">Kayıt Ol</h3>
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
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Şifre Onayı</label>
                      <Field type="password" name="confirmPassword" className="form-control" />
                      <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                    </div>
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
              <div className="text-center mt-3">
                <p>
                  Zaten hesabın var mı? <a href="/login">Giriş Yap</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;