import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    nickName: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        navigate('/login');
      } else {
        const error = await response.text();
        alert('회원가입 실패: ' + error);
      }
    } catch (err) {
      alert('에러 발생: ' + err.message);
    }
  };

  return (
    <div>
      <h2>🔐 회원가입</h2>
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
      <input
        type="text"
        name="nickName"
        placeholder="닉네임"
        value={form.nickName}
        onChange={handleChange}
      />
      <br />
      <button onClick={handleSignup}>회원가입</button>
    </div>
  );
};

export default Signup;
