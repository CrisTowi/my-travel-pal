import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RegisterModal from '../../components/Auth/RegisterModal';
import styles from './Login.module.css';

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirect to dashboard after successful login
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>✈️</span>
              <span className={styles.logoText}>My Travel Pal</span>
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to continue planning your adventures</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.input}
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className={styles.switchAuth}>
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  className={styles.switchButton}
                  onClick={() => setIsRegisterOpen(true)}
                >
                  Create one here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => setIsRegisterOpen(false)}
      />
    </>
  );
};

export default Login;
