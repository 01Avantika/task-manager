import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useAuthBackToLanding() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.history.state?.idx === 0) {
      window.history.replaceState(window.history.state, '', '/');
      navigate(location.pathname, { replace: false });
    }
  }, [location.pathname, navigate]);
}
