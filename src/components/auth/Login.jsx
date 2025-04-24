// Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const { accessToken } = await response.json();
        login(accessToken); // 토큰 저장
        alert('로그인 성공!');
        navigate('/');
      } else {
        const error = await response.text();
        alert('로그인 실패: ' + error);
      }
    } catch (err) {
      alert('에러 발생: ' + err.message);
    }
  };

  return (
    <div>
      <h2>🔓 로그인</h2>
      <input
        type="email"
        name="email"
        placeholder="이메일"
        value={form.email}
        onChange={handleChange}
      />
      <br />
      <input
        type="password"
        name="password"
        placeholder="비밀번호"
        value={form.password}
        onChange={handleChange}
      />
      <br />
      <button onClick={handleLogin}>로그인</button>
    </div>
  );
};

export default Login;
