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
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

function Live() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [studyGroup, setStudyGroup] = useState([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    async function initData() {
      try {
        const studyGroupRef = doc(db, 'studyGroups', id);
        const studyGroupSnapshot = await getDoc(studyGroupRef);
        const studyGroupData = studyGroupSnapshot.data();
        setStudyGroup(studyGroupData);
      } catch (error) {
        console.error(error);
      }
    }
    initData();
  }, []);

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

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const sendMessage = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'rooms', id, 'messages'), {
      message: input,
      timestamp: new Date(),
    });
    setInput('');
  };

  function handleStart() {
    setIsActive(true);
    alert('開始直播');
  }

  function handleStop() {
    setIsActive(false);
    setSeconds(0);
    handleChangeState();
  }
  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  function handleChangeState() {
    const groupRef = doc(db, 'studyGroups', id);
    updateDoc(groupRef, { status: 'finished' })
      .then(() => {
        console.log('Document successfully updated!');
        alert('結束直播');
      })
      .catch((error) => {
        console.error('Error updating document: ', error);
      });
  }

  function handleNoteChange(e) {
    const html = e.target.innerHTML;
    setNote(html);
  }

  async function handleSaveNote() {
    try {
      const userRef = doc(db, 'users', 'yumy19990628@gmail.com');
      const newGroupRef = doc(collection(userRef, 'UserStudyGroups'), id);
      await setDoc(newGroupRef, {
        note: note,
      });

      console.log(`儲存 ${id} 筆記`);
    } catch (error) {
      console.error('Error: ', error);
    }
  }

  return (
    <>
      <Container>
        <SideMenu isOpen={true} />

        <Content isOpen={true}>
          <Input>
            <input
              type="button"
              id="startButton"
              value="Start"
              onClick={handleStart}
            />
            <input type="button" id="startButton" value="Call" />
            <input
              type="button"
              id="startButton"
              value="Hangup"
              onClick={handleStop}
            />
            <span>{formatTime(seconds)}</span>
          </Input>
          <LiveScreen>直播的畫面</LiveScreen>
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
                }}
              />
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
          <Note
            dangerouslySetInnerHTML={{ __html: studyGroup.note }}
            contentEditable
            onInput={handleNoteChange}
          />
          <input
            type="button"
            id="startButton"
            value="儲存筆記"
            onClick={handleSaveNote}
          />
        </Content>
      </Container>
    </>
  );
}
const Input = styled.div`
  width: 100%;
`;
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
