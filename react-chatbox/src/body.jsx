import { useState } from 'react';

const BACKEND_URL = 'https://ashura-chatbox-backend.onrender.com';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        document.cookie = `username=${encodeURIComponent(username)}; path=/; max-age=86400; SameSite=None; Secure`;
        window.location.href = 'chat.html'; // or navigate with React Router
      } else {
        alert('Invalid credentials');
      }
    } catch {
      alert('Login failed. Please check your connection.');
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    alert('Contact the admin for password recovery.');
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    const phone = '2347081472383';
    const message = 'Hello Ashura, I want to Create an Account';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    let countdown = 3;
    const alertCountdown = () => {
      alert(`Redirecting to WhatsApp in ${countdown} second${countdown !== 1 ? 's' : ''}...`);
      countdown--;
      if (countdown >= 0) {
        setTimeout(alertCountdown, 1000);
      } else {
        window.location.href = url;
      }
    };
    alertCountdown();
  };

  return (
    <div className="container">
      <div className="logo"><i className="fa-solid fa-user"></i></div>
      <div className="title">Welcome Back</div>
      <div className="field">
        <input
          type="text"
          id="username"
          required
          placeholder=" "
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label>Username</label>
        <i className="fa-solid fa-user icon"></i>
      </div>
      <div className="field">
        <input
          type="password"
          id="password"
          required
          placeholder=" "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label>Password</label>
        <i className="fa-solid fa-lock icon"></i>
      </div>
      <div className="options">
        <label><input type="checkbox" /> Remember me</label>
        <a href="#" onClick={handleForgot}>Forgot?</a>
      </div>
      <button className="btn" onClick={handleLogin}>Login</button>
      <div className="footer">
        Don't have an account?
        <a href="#" onClick={handleCreateAccount}>Create account</a>
      </div>
    </div>
  );
}