import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import SideMenu from '../../components/SideMenu';
import { useEffect, useState, useRef, useReducer } from 'react';
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
  deleteDoc,
} from 'firebase/firestore';
import EditContent from '../../components/EditContent';
import Lecture from '../../pages/Process/Lecture';
import StickyNote from './LiveStickyNote';
import Vote from './LiveVote';
import QA from './LiveQA';

function reducer(processData, { type, payload = {} }) {
  const { processIndex, data, process } = payload;
  switch (type) {
    case 'SET_DATA': {
      return process;
    }
    case 'DEL_CARD': {
      const updatedCard = [...processData];
      updatedCard.splice(processIndex, 1);
      return updatedCard;
    }
    case 'UPDATE_DATA': {
      const updatedCard = processData.map((card, index) => {
        if (index === processIndex) {
          return { ...card, data };
        }
        return card;
      });
      return updatedCard;
    }
    default:
      throw new Error(`Unknown action: ${type}`);
  }
}

function Live() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [studyGroup, setStudyGroup] = useState([]);
  const [note, setNote] = useState('');
  const [currentCard, setCurrentCard] = useState(0);
  // const [editable, setEditable] = useState(0);
  const [processData, dispatch] = useReducer(reducer, []);

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
    dispatch({ type: 'SET_DATA', payload: { process: studyGroup.process } });
  }, [studyGroup]);

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

  // useEffect(() => {
  //   let interval = null;
  //   if (isActive) {
  //     interval = setInterval(() => {
  //       setSeconds((seconds) => seconds + 1);
  //     }, 1000);
  //   } else if (!isActive && seconds !== 0) {
  //     clearInterval(interval);
  //   }
  //   return () => clearInterval(interval);
  // }, [isActive, seconds]);

  const sendMessage = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'rooms', id, 'messages'), {
      message: input,
      timestamp: new Date(),
    });
    setInput('');
  };

  async function handleStart() {
    setIsActive(true);
    await setDoc(doc(db, 'rooms', id), { currentCard: 0 });
    alert('開始直播');
    const studyGroupRef = doc(db, 'rooms', id);
    const unsubscribe = onSnapshot(studyGroupRef, (snapshot) => {
      const studyGroupData = snapshot.data();
      console.log(studyGroupData);
      setCurrentCard(studyGroupData.currentCard);
    });
    return () => unsubscribe();
  }

  function handleStop() {
    setIsActive(false);
    setSeconds(0);
    handleChangeState();
    navigate({ pathname: '/profile/finished' }, { replace: true });
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
    updateDoc(doc(db, 'studyGroups', id), { status: 'finished' });
    deleteDoc(doc(db, 'rooms', id))
      .then(() => {
        console.log('Document successfully updated!');
        alert('結束直播');
      })
      .catch((error) => {
        console.error('Error updating document: ', error);
      });
  }
  const onContentChange = (newContent) => {
    console.log(newContent);
    setNote(newContent);
  };

  async function handleSaveNote() {
    try {
      const userRef = doc(db, 'users', 'yumy19990628@gmail.com');
      const newGroupRef = doc(collection(userRef, 'userStudyGroups'), id);
      await setDoc(newGroupRef, {
        note: note,
      });

      console.log(`儲存 ${id} 筆記`);
    } catch (error) {
      console.error('Error: ', error);
    }
  }
  const renderCardContent = (item, processIndex) => {
    switch (item.type) {
      case 'lecture':
        return (
          <Lecture
            item={item}
            processIndex={processIndex}
            dispatch={dispatch}
          />
        );
      case 'stickyNote':
        return (
          <StickyNote
            item={item}
            processIndex={processIndex}
            dispatch={dispatch}
          />
        );
      case 'QA':
        return (
          <QA item={item} processIndex={processIndex} dispatch={dispatch} />
        );
      case 'vote':
        return (
          <Vote item={item} processIndex={processIndex} dispatch={dispatch} />
        );
      default:
        return (
          <Lecture
            item={item}
            processIndex={processIndex}
            dispatch={dispatch}
          />
        );
    }
  };

  const updateCurrentCardInFirebase = async (newCard) => {
    try {
      const studyGroupRef = doc(db, 'rooms', id);
      await setDoc(studyGroupRef, { currentCard: newCard });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <Container>
        <SideMenu isOpen={true} />
        <Content isOpen={true}>
          <Menu>
            <div>
              <div>書名：{studyGroup.name}</div>
              <div>章節：{studyGroup.chapter}</div>
              {/* <span>{formatTime(seconds)}</span> */}
            </div>
            <input
              type="button"
              id="startButton"
              value="Hangup"
              onClick={handleStop}
            />
          </Menu>
          <LiveContainer>
            <LiveScreen>
              <LiveInputs isActive={isActive}>
                <input
                  type="button"
                  id="startButton"
                  value="Start"
                  onClick={handleStart}
                />
                <input type="button" id="startButton" value="Join" />
              </LiveInputs>
              <Cards isActive={isActive}>
                {!processData ? (
                  <></>
                ) : (
                  processData.map((item, processIndex) => (
                    <Card
                      active={processIndex === currentCard}
                      key={processIndex}>
                      <Description>{item.description}</Description>
                      <CardContent>
                        {renderCardContent(item, processIndex)}
                      </CardContent>
                    </Card>
                  ))
                )}
              </Cards>
              <ProcessInputs>
                <ProcessInput
                  type="button"
                  value="前"
                  onClick={() =>
                    setCurrentCard((prev) => {
                      const newCard = prev > 0 ? prev - 1 : prev;
                      updateCurrentCardInFirebase(newCard);
                      return newCard;
                    })
                  }
                />
                <ProcessInput
                  type="button"
                  value="後"
                  onClick={() => {
                    setCurrentCard((prev) => {
                      const newCard =
                        prev < studyGroup.process.length - 1 ? prev + 1 : prev;
                      updateCurrentCardInFirebase(newCard);
                      return newCard;
                    });
                  }}
                />
              </ProcessInputs>
            </LiveScreen>
            <ChatRoom>
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
          </LiveContainer>
        </Content>
      </Container>
    </>
  );
}
const LiveContainer = styled.div`
  border: 1px solid black;
  display: flex;
  width: 100%;
  height: 500px;
  ${'' /* overflow-x: auto; */}
`;
const Menu = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
//---直播---//
const LiveScreen = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 75%;
  padding: 10px;
`;
const LiveInputs = styled.div`
  display: ${({ isActive }) => (isActive ? 'none' : 'flex')};
  height: 25px;
  justify-content: center;
`;
//---卡片--//
const Cards = styled.div`
  display: ${({ isActive }) => (isActive ? 'block' : 'none')};
  height: 100%;
`;
const Card = styled.div`
  display: ${({ active }) => (active ? 'block' : 'none')};
`;
const Description = styled.div`
  font-size: 20px;
  font-weight: 600;
`;
const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;
const ProcessInputs = styled.div`
  display: flex;
  border: 1px solid black;
  justify-content: space-between;
  margin-top: auto;
`;
const ProcessInput = styled.input``;
//---聊天室---//
const ChatRoom = styled.div`
  border: 1px solid black;
  width: 25%;
`;
const Guest = styled.div``;
const User = styled.div`
  align-self: flex-end;
`;
const Message = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 2;
  height: 400px;
  overflow: auto;
`;
const ChatInput = styled.div`
  margin-top: auto;
`;
//---筆記---//
const Note = styled.div`
  height: 255px;
  ${'' /* border: 1px solid black; */}
  ${'' /* width: 100%; */}
`;
//---全局---//
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;
const Content = styled.div`
  flex: 1;
  transition: all 0.3s ease;
  padding: 20px;
  width: ${({ isOpen }) => (isOpen ? 'calc(100% - 200px)' : '100%')};
`;
export default Live;
