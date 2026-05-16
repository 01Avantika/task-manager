import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '', password: '' });
  const updateMe = useMutation({
    mutationFn: (payload) => api.put('/api/users/me', payload),
    onSuccess: ({ data }) => {
      setUser(data);
      setForm((value) => ({ ...value, password: '' }));
    },
  });
  const { data: members = [], refetch } = useQuery({
    queryKey: ['users'],
    enabled: user?.role === 'admin',
    queryFn: async () => (await api.get('/api/users')).data,
  });
  const changeRole = useMutation({
    mutationFn: ({ id, role }) => api.put(`/api/users/${id}/role`, { role }),
    onSuccess: () => refetch(),
  });

  const submit = (event) => {
    event.preventDefault();
    updateMe.mutate(Object.fromEntries(Object.entries(form).filter(([, value]) => value)));
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile, avatar initials, and workspace access.</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <div className="profile-preview">
            <span className="avatar large">{form.username.slice(0, 2).toUpperCase()}</span>
            <div><h2>Profile</h2><p>Your avatar is generated from your username initials.</p></div>
          </div>
          <form className="stack-form" onSubmit={submit}>
            <label>Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>New password<input type="password" placeholder="Leave blank to keep current password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            <button className="btn primary" type="submit">Save Changes</button>
          </form>
        </section>
        {user?.role === 'admin' && (
          <section className="panel">
            <div className="section-head"><h2>Manage users</h2></div>
            <div className="member-list">
              {members.map((member) => (
                <div className="member-row" key={member.id}>
                  <span className="avatar">{member.username.slice(0, 2).toUpperCase()}</span>
                  <div><strong>{member.username}</strong><span>{member.email}</span></div>
                  <select value={member.role} onChange={(e) => changeRole.mutate({ id: member.id, role: e.target.value })}>
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
