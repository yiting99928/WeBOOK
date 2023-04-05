import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { useEffect, useState, useRef } from 'react';
import { db } from '../../utils/firebase';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';

function Live() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const chatRoomRef = collection(db, 'rooms', id, 'messages');
    const q = query(chatRoomRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'rooms', id, 'messages'), {
      message: input,
      timestamp: new Date(),
    });
    setInput('');
  };

  return (
    <>
      <Container>
        <SideMenu isOpen={true} />

        <Content isOpen={true}>
          <LiveScreen>
            直播的畫面
            <div>
              <p>local</p>
              <audio controls autoPlay muted />
              <p>remote</p>
              <audio controls autoPlay muted />
              <div>
                <button id="startButton">Start</button>
                <button id="callButton">Call</button>
                <button id="hangupButton">Hangup</button>
              </div>
            </div>
          </LiveScreen>
          <ChatRoom>
            聊天室
            <Message>
              {messages.map((message, index) =>
                message.sender === 'user' ? (
                  <User key={index}>{message.message}</User>
                ) : (
                  <Guest key={index}>
                    <span>Guest{message.sender}：</span>
                    {message.message}
                  </Guest>
                )
              )}
              <div
                ref={(el) => {
                  messagesEndRef.current = el;
                }}/>
            </Message>
            <ChatInput>
              <form onSubmit={sendMessage}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <input type="submit" value="送出" />
              </form>
            </ChatInput>
          </ChatRoom>
          <Note>小筆記</Note>
        </Content>
      </Container>
    </>
  );
}
const Guest = styled.div``;
const User = styled.div`
  align-self: flex-end;
`;
const Message = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 2;
  height: 100%;
  overflow: auto;
`;
const ChatInput = styled.div`
  margin-top: auto;
`;
const LiveScreen = styled.div`
  height: 350px;
  border: 1px solid black;
  width: 70%;
`;

const ChatRoom = styled.div`
  height: 350px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  width: 30%;
`;

const Note = styled.div`
  height: 300px;
  border: 1px solid black;
  width: 100%;
`;
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  transition: all 0.3s ease;
  padding: 20px;
  width: ${(props) => (props.isOpen ? 'calc(100% - 200px)' : '100%')};
`;
export default Live;
