import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isTravelers = location.pathname === '/travelers';

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
