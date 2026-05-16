import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthBackToLanding } from '../hooks/useAuthBackToLanding.js';
import { apiErrorMessage } from '../utils/apiError.js';

export default function Signup() {
  useAuthBackToLanding();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(form, 'signup');
      navigate('/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err, 'Signup failed'));
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="landing-brand">TaskFlow</Link>
        <h1>Create workspace access</h1>
        <p>Choose the role that matches how you will use the workspace.</p>
        {error && <div className="error-box">{error}</div>}
        <label>Username<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="member">Member</option><option value="admin">Admin</option></select></label>
        <button className="btn primary" type="submit">Get Started</button>
        <span>Already have an account? <Link to="/login" replace>Login</Link></span>
      </form>
    </main>
  );
}
