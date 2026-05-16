import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    return () => document.body.classList.remove('nav-open');
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <header className="mobile-topbar">
        <button className="mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
          <span />
          <span />
          <span />
        </button>
        <div>
          <strong>TaskFlow</strong>
          <span>Team workspace</span>
        </div>
      </header>
      <button
        className={`mobile-overlay ${menuOpen ? 'show' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-label="Close navigation"
        type="button"
      />
      <Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} />
      <main className="app-main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
