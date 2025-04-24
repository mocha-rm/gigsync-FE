import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';

const ChatRoom = () => {
  const { receiverId } = useParams();
  const location = useLocation();
  const nickName = location.state?.nickName ?? '상대방';
  const { token } = useAuth();
  const socketRef = useRef(null);

  const [myId, setMyId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  // 내 ID 조회
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMyId(data.id);
        } else {
          console.error('내 정보 조회 실패');
        }
      } catch (err) {
        console.error('에러 발생:', err);
      }
    };

    if (token) {
      fetchMyInfo();
    }
  }, [token]);

  // WebSocket 연결
  useEffect(() => {
    if (!token || !receiverId) return;

    const socket = new WebSocket(
      `ws://localhost:8080/ws/chat?token=${token}&receiverId=${receiverId}`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket 연결 성공');
    };

    socket.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      setMessages((prev) => [...prev, messageData]);
    };

    socket.onerror = (err) => {
      console.error('❌ WebSocket 오류:', err);
    };

    socket.onclose = () => {
      console.log('❎ WebSocket 연결 종료');
    };

    return () => socket.close();
  }, [token, receiverId]);

  const sendMessage = () => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN &&
      text.trim() !== '' &&
      myId
    ) {
      socketRef.current.send(text);
      setMessages((prev) => [
        ...prev,
        {
          senderId: myId,
          senderNickName: '나',
          content: text,
        },
      ]);
      setText('');
    }
  };

  return (
    <div>
      <h2>💬 {nickName}님과의 채팅</h2>
      <div
        style={{
          border: '1px solid #ccc',
          height: 300,
          overflowY: 'scroll',
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((msg, index) => {
          const isMine = msg.senderId === myId;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: isMine ? 'flex-end' : 'flex-start',
                marginBottom: 10,
              }}
            >
              {!isMine && (
                <div style={{ marginRight: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                    {msg.senderNickName}
                  </div>
                </div>
              )}
              <div
                style={{
                  backgroundColor: isMine ? '#fffacf' : '#eee',
                  color: '#000',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  maxWidth: '60%',
                  wordBreak: 'break-word',
                }}
              >
                {isMine ? '나: ' : `${nickName}: `}{msg.content}
              </div>
            </div>
          );
        })}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="메시지를 입력하세요"
        style={{ width: '80%', marginRight: 10 }}
      />
      <button onClick={sendMessage}>전송</button>
    </div>
  );
};

export default ChatRoom;
