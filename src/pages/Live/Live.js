import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import SideMenu from '../../components/SideMenu';
import { useEffect, useState, useRef, useReducer, useContext } from 'react';
import { db } from '../../utils/firebase';
import { AuthContext } from '../../context/authContext';
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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [seconds, setSeconds] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [studyGroup, setStudyGroup] = useState([]);
  const [note, setNote] = useState('');
  const [currentCard, setCurrentCard] = useState(0);
  const [processData, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'studyGroups', id),
      (snapshot) => {
        const studyGroupData = snapshot.data();
        setStudyGroup(studyGroupData);
        dispatch({
          type: 'SET_DATA',
          payload: { process: studyGroupData.process },
        });
      },
      (error) => {
        console.error(error);
      }
    );

    return () => {
      unsubscribe();
    };
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
    const unsubscribe = onSnapshot(
      doc(db, 'studyGroups', id),
      (docSnapshot) => {
        if (docSnapshot.exists() && docSnapshot.data().status === 'finished') {
          alert('結束直播');
          navigate({ pathname: '/profile/finished' }, { replace: true });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [id, navigate]);

  // useEffect(() => {
  //   let interval = null;
  //   if (isLive) {
  //     interval = setInterval(() => {
  //       setSeconds((seconds) => seconds + 1);
  //     }, 1000);
  //   } else if (!isLive && seconds !== 0) {
  //     clearInterval(interval);
  //   }
  //   return () => clearInterval(interval);
  // }, [isLive, seconds]);
  // function formatTime(totalSeconds) {
  //   const hours = Math.floor(totalSeconds / 3600);
  //   const minutes = Math.floor((totalSeconds % 3600) / 60);
  //   const seconds = Math.floor(totalSeconds % 60);

  //   const formattedHours = hours.toString().padStart(2, '0');
  //   const formattedMinutes = minutes.toString().padStart(2, '0');
  //   const formattedSeconds = seconds.toString().padStart(2, '0');

  //   return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  // }
  const sendMessage = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'rooms', id, 'messages'), {
      message: input,
      timestamp: new Date(),
    });
    setInput('');
  };
  async function handleSaveNote() {
    try {
      const userRef = doc(db, 'users', user.email);
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
            id={id}
          />
        );
      case 'QA':
        return (
          <QA item={item} processIndex={processIndex} dispatch={dispatch} />
        );
      case 'vote':
        return (
          <Vote
            item={item}
            processIndex={processIndex}
            dispatch={dispatch}
            id={id}
          />
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
  async function handleStart() {
    setIsLive(true);
    await setDoc(doc(db, 'rooms', id), { currentCard: 0 });
    alert('開始直播');
    const studyGroupRef = doc(db, 'rooms', id);
    const unsubscribe = onSnapshot(studyGroupRef, (snapshot) => {
      const studyGroupData = snapshot.data();
      if (studyGroupData && studyGroupData.currentCard !== undefined) {
        console.log(studyGroupData.currentCard);
        setCurrentCard(studyGroupData.currentCard);
      }
    });
    return () => unsubscribe();
  }

  async function handleJoin() {
    alert('加入直播');
    const studyGroupRef = doc(db, 'rooms', id);
    const unsubscribe = onSnapshot(studyGroupRef, (snapshot) => {
      const studyGroupData = snapshot.data();
      setIsLive(true);
      setCurrentCard(studyGroupData.currentCard);
    });
    return () => unsubscribe();
  }
  function handleStop() {
    setIsLive(false);
    handleChangeState();
  }
  function handleChangeState() {
    updateDoc(doc(db, 'studyGroups', id), { status: 'finished' });
    deleteDoc(doc(db, 'rooms', id));
  }
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
              <LiveInputs isLive={isLive}>
                <StartInput
                  isHost={studyGroup.createBy === user.email}
                  type="button"
                  value="Start"
                  onClick={handleStart}
                />
                <JoinInput
                  isHost={studyGroup.createBy === user.email}
                  type="button"
                  value="Join"
                  onClick={handleJoin}
                />
              </LiveInputs>
              <Cards isLive={isLive}>
                {!processData ? (
                  <></>
                ) : (
                  processData.map((item, processIndex) => (
                    <Card
                      activeCard={processIndex === currentCard} // 卡片index & 目前 currentCard 相同則 block
                      key={processIndex}>
                      <Description>{item.description}</Description>
                      <CardContent>
                        {renderCardContent(item, processIndex)}
                      </CardContent>
                    </Card>
                  ))
                )}
              </Cards>
              <ProcessInputs isHost={studyGroup.createBy === user.email}>
                <ProcessInput
                  type="button"
                  value="前"
                  onClick={() =>
                    setCurrentCard((prev) => {
                      console.log('前');
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
                      console.log('後');
                      const newCard =
                        prev < processData.length - 1 ? prev + 1 : prev;
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
                  user.email ===  studyGroup.createBy? (
                    <User key={index}>{message.message}</User>
                  ) : (
                    <Guest key={index}>
                      <span>Guest{user.name}：</span>
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
          <Note>
            <EditContent onChange={setNote} value={note} />
            <input type="button" value="儲存筆記" onClick={handleSaveNote} />
          </Note>
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
  display: ${({ isLive }) => (isLive ? 'none' : 'flex')};
  height: 25px;
  justify-content: center;
`;
const StartInput = styled.input`
  display: ${({ isHost }) => (isHost ? 'block' : 'none')};
`;
const JoinInput = styled.input`
  display: ${({ isHost }) => (isHost ? 'none' : 'block')};
`;
//---卡片--//
const Cards = styled.div`
  display: ${({ isLive }) => (isLive ? 'block' : 'none')};
  height: 100%;
`;
const Card = styled.div`
  display: ${({ activeCard }) => (activeCard ? 'block' : 'none')};
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
  display: ${({ isHost }) => (isHost ? 'flex' : 'none')};
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
  height: 500px;
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
