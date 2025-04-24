// Home.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  return (
    <div>
      <h1>🎵 GigSync Chat</h1>
      {token ? (
        <>
          <button onClick={logout}>로그아웃</button>
          <button onClick={() => navigate('/users')}>유저 목록 보기</button>
        </>
      ) : (
        <>
          <button onClick={() => navigate('/signup')}>회원가입</button>
          <button onClick={() => navigate('/login')}>로그인</button>
        </>
      )}
    </div>
  );
};

export default Home;
