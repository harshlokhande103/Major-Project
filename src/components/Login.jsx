import React, { useState } from 'react';

const Login = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data.message || 'Login failed');
          return;
        }
        alert('Login successful');
        if (typeof onLogin === 'function') onLogin(data);
        else onClose?.();
      } catch (err) {
        alert('Network error');
      }
    })();
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>
        <button type="submit" className="cta-primary" style={{ width: '100%' }}>Sign In</button>
        <button type="button" className="badge" onClick={onClose} style={{ width: '100%', textAlign: 'center' }}>Back</button>
      </form>
    </div>
  );
};

export default Login;


