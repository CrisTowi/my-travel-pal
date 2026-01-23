import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isHome = location.pathname === '/';
  const isTravelers = location.pathname === '/travelers';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>✈️</span>
            <span className={styles.logoText}>My Travel Pal</span>
          </Link>
          <nav className={styles.nav}>
            <Link
              to="/"
              className={`${styles.navLink} ${isHome ? styles.active : ''}`}
            >
              My Travels
            </Link>
            <Link
              to="/travelers"
              className={`${styles.navLink} ${isTravelers ? styles.active : ''}`}
            >
              Travelers
            </Link>
            <div className={styles.userSection}>
              <span className={styles.userName}>{user?.name || user?.email}</span>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>© 2026 My Travel Pal - Plan Your Perfect Journey</p>
      </footer>
    </div>
  );
};

export default Layout;
