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
import { IoIosArrowForward } from 'react-icons/io';
import { AiFillSound, AiTwotoneVideoCamera } from 'react-icons/ai';
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
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        <GroupTitle>
          <GroupBook>{studyGroup.name}</GroupBook>
          作者：{studyGroup.author}
          <br />
          導讀章節:{studyGroup.chapter}
          <br />
          舉辦時間:{studyGroup.hold}
          <br />
          導讀人：{studyGroup.host}
        </GroupTitle>
        <LiveContainer>
          <LiveScreen>
            <LiveIcon isLive={isLive}>Live</LiveIcon>
            <LiveInputs isLive={isLive}>
              <StartInput
                isHost={studyGroup.createBy === user.email}
                type="button"
                value="開啟鏡頭"
                onClick={openUserMedia}
              />
              <StartInput
                isHost={studyGroup.createBy === user.email}
                type="button"
                value="開始直播"
                onClick={handleStart}
              />
              <JoinInput
                isHost={studyGroup.createBy === user.email}
                type="button"
                value="加入直播"
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
            {!processData || !isLive ? (
              <></>
            ) : (
              <ProcessInputs isHost={studyGroup.createBy === user.email}>
                <ProcessInput
                  type="button"
                  value="前一頁"
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
                  value="前一頁"
                  onClick={() => {
                    setCurrentCard((prev) => {
                      const newCard =
                        prev < processData.length - 1 ? prev + 1 : prev;
                      updateCurrentCardInFirebase(newCard);
                      return newCard;
                    });
                  }}
                />
                <MediaProcessInput>
                  <MediaIcon>
                    <AiFillSound onClick={toggleMute} />
                  </MediaIcon>
                  <MediaIcon>
                    <AiTwotoneVideoCamera onClick={toggleVideo} />
                  </MediaIcon>
                  <HangupInput
                    type="button"
                    id="startButton"
                    value="結束"
                    onClick={handleStop}
                    isHost={studyGroup.createBy === user.email}
                  />
                </MediaProcessInput>
              </ProcessInputs>
            )}
            <Broadcast>
              <LocalVideo
                isHost={studyGroup.createBy === user.email}
                autoPlay
                playsInline
                controls
                ref={localVideoRef}
                muted
              />
              <RemoteVideo
                isHost={studyGroup.createBy === user.email}
                autoPlay
                playsInline
                controls
                ref={remoteVideoRef}
              />
            </Broadcast>
          </LiveScreen>
          <ChatRoom>
            <ChatTitle>聊天室</ChatTitle>
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
                <button type="submit">
                  <IoIosArrowForward />
                </button>
              </form>
            </ChatInput>
          </ChatRoom>
        </LiveContainer>
        <Note>
          <EditContent onChange={setNote} value={note} />
          <Button onClick={handleSaveNote}>儲存講稿</Button>
        </Note>
      </Content>
    </Container>
  );
}

const GroupButton = styled.input`
  background-color: #ececec;
  border-radius: 5px;
  width: 86px;
  height: 32px;
`;
const LocalVideo = styled.video`
  display: ${({ isHost }) => (isHost ? 'block' : 'none')};
  width: 200px;
  border-radius: 6px;
`;
const RemoteVideo = styled.video`
  display: ${({ isHost }) => (isHost ? 'none' : 'block')};
  width: 200px;
  border-radius: 6px;
`;

const LiveContainer = styled.div`
  display: flex;
  width: 100%;
  height: 500px;
  justify-content: space-between;
  gap: 5px;
  margin-bottom: 20px;
`;
const Broadcast = styled.div`
  position: absolute;
  right: 10;
  bottom: 10;
`;
//---直播---//
const LiveIcon = styled.div`
  background: #f0f0f0;
  background: ${({ isLive }) => (isLive ? '#DF524D' : '#f0f0f0')};
  color: ${({ isLive }) => (isLive ? '#fff' : '#5b5b5b')};
  border-radius: 25px;
  text-align: center;
  padding: 5px 20px;
  position: absolute;
  top: 10;
  right: 10;
`;
const LiveScreen = styled.div`
  display: flex;
  flex-direction: column;
  width: 75%;
  padding: 10px;
  position: relative;
  border-radius: 6px;
  border: 1px solid #5b5b5b;
`;
const LiveInputs = styled.div`
  display: ${({ isLive }) => (isLive ? 'none' : 'flex')};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  gap: 10px;
`;
const StartInput = styled.input`
  display: ${({ isHost }) => (isHost ? 'block' : 'none')};
  background-color: #ffac4c;
  color: #fff;
  padding: 8px 15px;
  margin-top: 10px;
  border-radius: 6px;
`;
const JoinInput = styled.input`
  display: ${({ isHost }) => (isHost ? 'none' : 'block')};
  background-color: #ffac4c;
  color: #fff;
  padding: 8px 15px;
  margin-top: 10px;
  border-radius: 6px;
`;
const HangupInput = styled(GroupButton)`
  display: ${({ isHost }) => (isHost ? 'block' : 'none')};
`;
//---卡片--//
const Cards = styled.div`
  display: ${({ isLive }) => (isLive ? 'block' : 'none')};
  height: 100%;
  padding: 20px;
  line-height: 1.5;
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
  ${'' /* overflow: scroll; */}
`;
const ProcessInputs = styled.div`
  display: ${({ isHost }) => (isHost ? 'flex' : 'none')};
  margin-top: auto;
  max-width: 550px;
  align-items: center;
  gap: 10px;
  svg {
    transform: scale(1.5);
    cursor: pointer;
    color: #5b5b5b;
  }
`;
const MediaIcon = styled.div`
  background-color: #ececec;
`;
const ProcessInput = styled(GroupButton)``;
const MediaProcessInput = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  position: absolute;
  right: 220px;
`;

//---聊天室---//
const ChatRoom = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #5b5b5b;
`;
const GuestMessage = styled.div`
  border-radius: 6px;
  background-color: #f1f1f1;
  padding: 0 10px;
`;
const UserMessage = styled(GuestMessage)`
  align-self: flex-end;
`;
const Message = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 2;
  height: 500px;
  overflow: auto;
  padding: 10px;
  gap: 15px;
`;
const ChatInput = styled.div`
  margin-top: auto;
  background-color: #f1f1f1;
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 5px;
  margin: 10px;
`;
const ChatTitle = styled.div`
  border-bottom: 1px solid #5b5b5b;
  padding: 8px 8px;
  background-color: #f1f1f1;
`;
//---筆記---//
const Note = styled.div`
  height: 400px;
`;
const Button = styled.button`
  background-color: #ffac4c;
  color: #fff;
  padding: 8px 15px;
  margin-top: 10px;
  border-radius: 6px;
`;
//---全局---//
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;
const GroupTitle = styled.div`
  display: flex;
  align-items: flex-start;
  color: #5b5b5b;
  gap: 20px;
  margin-bottom: 40px;
  line-height: 1.2;
  justify-content: space-between;
`;
const GroupBook = styled.h2`
  font-weight: 600;
  font-size: 40px;
`;
const Content = styled.div`
  transition: all 0.3s ease;
  width: 1000px;
  margin: 0 auto;
  margin-bottom: 160px;
  margin-top: 80px;
  display: flex;
  flex-direction: column;
`;
export default Live;
