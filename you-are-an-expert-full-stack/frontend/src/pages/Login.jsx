import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthBackToLanding } from '../hooks/useAuthBackToLanding.js';
import { apiErrorMessage } from '../utils/apiError.js';

export default function Login() {
  useAuthBackToLanding();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(form, 'login');
      navigate('/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err, 'Login failed'));
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="landing-brand">TaskFlow</Link>
        <h1>Welcome back</h1>
        <p>Log in to your team workspace.</p>
        {error && <div className="error-box">{error}</div>}
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn primary" type="submit">Login</button>
        <span>New here? <Link to="/signup" replace>Create an account</Link></span>
      </form>
    </main>
  );
}
