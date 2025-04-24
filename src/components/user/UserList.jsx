// UserList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const UserList = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          alert('유저 목록 조회 실패');
        }
      } catch (err) {
        alert('에러 발생: ' + err.message);
      }
    };

    fetchUsers();
  }, [token]);

  const startChat = (receiverId, nickName) => {
    navigate(`/chat/${receiverId}`, { state: { nickName } });
  };

  return (
    <div>
      <h2>👥 유저 목록</h2>
      {users.length === 0 ? (
        <p>유저가 없습니다.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id} style={{ marginBottom: 10 }}>
              {user.nickName}
              <button
                onClick={() => startChat(user.id, user.nickName)}
                style={{ marginLeft: 10 }}
              >
                채팅하기
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
