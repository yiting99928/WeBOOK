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
  setDoc,
  deleteDoc,
  arrayUnion,
  deleteField,
} from 'firebase/firestore';
import EditContent from '../../components/EditContent';
import Lecture from '../../pages/Process/Lecture';
import StickyNote from './LiveStickyNote';
import Vote from './LiveVote';
import QA from './LiveQA';
// import Broadcast from './Broadcast';
import { v4 as uuidv4 } from 'uuid';

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
  // const [seconds, setSeconds] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [studyGroup, setStudyGroup] = useState([]);
  const [note, setNote] = useState('');
  const [currentCard, setCurrentCard] = useState(0);
  const [processData, dispatch] = useReducer(reducer, []);
  const [localStream, setLocalStream] = useState(null);
  const [peerConnections, setPeerConnections] = useState([]);
  const [videoState, setVideoState] = useState({
    isMuted: false,
    isVideoDisabled: false,
  });

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  //--------------------//
  //-----直播區開始-----//
  //--------------------//
  function toggleMute() {
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      return;
    }

    audioTracks[0].enabled = !audioTracks[0].enabled;
    setVideoState(!videoState.isMuted);
  }

  function toggleVideo() {
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      return;
    }

    videoTracks[0].enabled = !videoTracks[0].enabled;
    setVideoState(!videoState.isVideoDisabled);
  }

  async function openUserMedia() {
    const constraints = { video: true, audio: true };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log('stream Error.', error);
    }
  }

  async function createMutedAudioAndEmptyVideoStream() {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const dst = oscillator.connect(audioContext.createMediaStreamDestination());
    oscillator.start();

    const stream = new MediaStream();
    stream.addTrack(dst.stream.getAudioTracks()[0]);

    const videoTrack = (
      await navigator.mediaDevices.getUserMedia({ video: true })
    ).getVideoTracks()[0];
    videoTrack.stop();
    stream.addTrack(videoTrack);

    return stream;
  }

  async function createRoom(userUUID) {
    const roomRef = doc(collection(db, 'rooms'), id);

    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    const peerConnection = new RTCPeerConnection(configuration);
    setPeerConnections((prevConnections) => [
      ...prevConnections,
      peerConnection,
    ]);

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        console.log(track);
        peerConnection.addTrack(track, localStream);
      });
    }

    onSnapshot(doc(db, 'rooms', id), async (doc) => {
      const { offer } = doc.data();
      if (!peerConnection.currentRemoteDescription && offer) {
        const remoteDesc = new RTCSessionDescription(offer);
        await peerConnection.setRemoteDescription(remoteDesc);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await updateDoc(roomRef, {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        });
      }
    });
    peerConnection.addEventListener('icecandidate', (event) => {
      console.log(event);
      if (event.candidate) {
        const json = event.candidate.toJSON();
        addDoc(collection(db, 'rooms', id, 'host'), json);
      }
    });

    onSnapshot(collection(db, 'rooms', id, 'guest'), async (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });
  }

  async function joinRoom() {
    const roomRef = doc(db, 'rooms', id);
    const userUUID = uuidv4();
    await updateDoc(roomRef, {
      viewers: arrayUnion(userUUID),
    });

    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.addEventListener('track', async (event) => {
      console.log('Join remoteStream', event);
      const [remoteStream] = event.streams;
      remoteVideoRef.current.srcObject = remoteStream;
      //開始播放刪除 offer & answer
      setTimeout(async () => {
        await deleteOfferAndAnswer();
      }, 2000);
    });

    const mutedAudioAndEmptyVideoStream =
      await createMutedAudioAndEmptyVideoStream();
    setLocalStream(mutedAudioAndEmptyVideoStream);

    mutedAudioAndEmptyVideoStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, mutedAudioAndEmptyVideoStream);
    });

    onSnapshot(roomRef, async (doc) => {
      const { answer } = doc.data();
      if (answer) {
        const remoteDesc = new RTCSessionDescription(answer);
        await peerConnection.setRemoteDescription(remoteDesc);
      }
    });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await updateDoc(roomRef, {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    });
    peerConnection.addEventListener('icecandidate', (event) => {
      console.log('icecandidate', event);
      if (event.candidate) {
        const json = event.candidate.toJSON();
        addDoc(collection(db, 'rooms', id, 'guest'), json);
      }
    });

    onSnapshot(collection(db, 'rooms', id, 'host'), async (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });
  }

  async function deleteOfferAndAnswer() {
    const roomRef = doc(db, 'rooms', id);
    await updateDoc(roomRef, {
      offer: deleteField(),
      answer: deleteField(),
    });
  }

  useEffect(() => {
    const roomRef = doc(db, 'rooms', id);

    const unsubscribe = onSnapshot(roomRef, (doc) => {
      const data = doc.data();
      if (data) {
        const { viewers } = data;
        if (viewers && viewers.length > peerConnections.length) {
          const newUserUUID = viewers[viewers.length - 1];
          createRoom(newUserUUID);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [peerConnections]);

  //--------------------//
  //-----直播區結束-----//
  //--------------------//

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
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
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
          deleteDoc(doc(db, 'rooms', id));
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [id, navigate]);

  const sendMessage = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'rooms', id, 'messages'), {
      message: input,
      timestamp: new Date(),
      sender: user.email,
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
    createRoom();
    return () => unsubscribe();
  }

  async function handleJoin() {
    alert('加入直播');
    const studyGroupRef = doc(db, 'rooms', id);
    const unsubscribe = onSnapshot(studyGroupRef, (snapshot) => {
      if (
        snapshot.exists() &&
        snapshot.data() &&
        'currentCard' in snapshot.data()
      ) {
        const studyGroupData = snapshot.data();
        setIsLive(true);
        setCurrentCard(studyGroupData.currentCard);
      }
    });
    joinRoom();
    return () => unsubscribe();
  }

  function handleStop() {
    setIsLive(false);
    handleChangeState();
  }

  function handleChangeState() {
    updateDoc(doc(db, 'studyGroups', id), { status: 'finished' });
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
          <div>
            <div>
              <input type="button" value="open media" onClick={openUserMedia} />
              <input type="button" value="靜音" onClick={toggleMute} />
              <input type="button" value="關閉視訊" onClick={toggleVideo} />
            </div>
            <Screen>
              <div>
                <h4>Local</h4>
                <Video
                  autoPlay
                  playsInline
                  controls
                  ref={localVideoRef}
                  muted
                />
              </div>
              <div>
                <h4>Remote</h4>
                <Video autoPlay playsInline controls ref={remoteVideoRef} />
              </div>
            </Screen>
          </div>
          <Menu>
            <div>
              <div>書名：{studyGroup.name}</div>
              <div>章節：{studyGroup.chapter}</div>
              <div>章節：{studyGroup.host}</div>
            </div>
            <HangupInput
              type="button"
              id="startButton"
              value="Hangup"
              onClick={handleStop}
              isHost={studyGroup.createBy === user.email}
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
              {!processData ? (
                <></>
              ) : (
                <ProcessInputs isHost={studyGroup.createBy === user.email}>
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
                          prev < processData.length - 1 ? prev + 1 : prev;
                        updateCurrentCardInFirebase(newCard);
                        return newCard;
                      });
                    }}
                  />
                </ProcessInputs>
              )}
            </LiveScreen>
            <ChatRoom>
              <Message>
                {messages.map((message, index) =>
                  user.email === message.sender ? (
                    <UserMessage key={index}>{message.message}</UserMessage>
                  ) : (
                    <GuestMessage key={index}>
                      <span>{user.name}：</span>
                      {message.message}
                    </GuestMessage>
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
const Video = styled.video`
  width: 250px;
`;
const Screen = styled.div`
  display: flex;
  gap: 2px;
`;
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
const HangupInput = styled.input`
  display: ${({ isHost }) => (isHost ? 'block' : 'none')};
  height: 25px;
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
const GuestMessage = styled.div``;
const UserMessage = styled.div`
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
