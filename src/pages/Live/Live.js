import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { produce } from 'immer';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import {
  BsBoxArrowInDownRight,
  BsBoxArrowInUpLeft,
  BsCameraVideoFill,
  BsCameraVideoOffFill,
  BsChatLeftDotsFill,
  BsPeopleFill,
} from 'react-icons/bs';
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { MdFirstPage, MdLastPage } from 'react-icons/md';
import { RiChatOffFill } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components/macro';
import { v4 as uuidv4 } from 'uuid';
import { LiveMainBtn, StartBtn } from '../../components/Buttons';
import EditContent from '../../components/EditContent';
import GroupTitle from '../../components/GroupTitle';
import SideMenu from '../../components/SideMenu';
import { AuthContext } from '../../context/authContext';
import Lecture from '../../pages/Process/Lecture';
import { db } from '../../utils/firebase';
import modal from '../../utils/modal';
import QA from './LiveQA';
import StickyNote from './LiveStickyNote';
import Vote from './LiveVote';

function reducer(processData, { type, payload = {} }) {
  const { processIndex, data, process } = payload;
  return produce(processData, (draft) => {
    switch (type) {
      case 'SET_DATA': {
        return process;
      }
      case 'DEL_CARD': {
        draft.splice(processIndex, 1);
        break;
      }
      case 'UPDATE_DATA': {
        draft[processIndex].data = data;
        break;
      }
      default:
        throw new Error(`Unknown action: ${type}`);
    }
  });
}

function Live() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [MessageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const [isLive, setIsLive] = useState(false);
  const [studyGroup, setStudyGroup] = useState([]);
  const [note, setNote] = useState('');
  const [currentCard, setCurrentCard] = useState(0);
  const [processData, dispatch] = useReducer(reducer, []);
  const [localStream, setLocalStream] = useState(null);
  const [peerConnections, setPeerConnections] = useState([]);
  const [videoState, setVideoState] = useState({
    isMuted: true,
    isVideoDisabled: true,
  });
  const [showSaveInfo, setShowSaveInfo] = useState(false);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const [showLocalVideo, setShowLocalVideo] = useState(true);
  const [showChatRoom, setShowChatRoom] = useState(true);
  const [viewersNum, setViewersNum] = useState(0);
  const [isDisabled, setIsDisabled] = useState(true);

  function toggleMute() {
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      return;
    }

    audioTracks[0].enabled = !audioTracks[0].enabled;
    setVideoState((prev) => ({
      ...prev,
      isMuted: !videoState.isMuted,
    }));
  }

  function toggleVideo() {
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      return;
    }

    videoTracks[0].enabled = !videoTracks[0].enabled;
    setVideoState((prev) => ({
      ...prev,
      isVideoDisabled: !videoState.isVideoDisabled,
    }));
  }

  async function openUserMedia() {
    const constraints = { video: true, audio: true };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setVideoState({
        isMuted: false,
        isVideoDisabled: false,
      });
    } catch (error) {
      console.error(error);
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

  async function createRoom() {
    const roomRef = doc(collection(db, 'rooms'), id);

    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    const peerConnection = new RTCPeerConnection(configuration);
    setPeerConnections((prevConnections) => [
      ...prevConnections,
      peerConnection,
    ]);

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

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
      viewers: arrayUnion({ uuid: userUUID, name: user.name }),
    });
    const enterMessages = [
      `${user.name} 剛剛進入直播間`,
      `${user.name} 剛剛著陸`,
      `野生的 ${user.name} 出現`,
      `${user.name} 仙女下凡`,
    ];
    const randomMessage =
      enterMessages[Math.floor(Math.random() * enterMessages.length)];
    await addDoc(collection(db, 'rooms', id, 'messages'), {
      message: randomMessage,
      timestamp: new Date(),
      sender: null,
      senderName: null,
      sanderImg: null,
    });
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.addEventListener('track', async (event) => {
      const [remoteStream] = event.streams;
      remoteVideoRef.current.srcObject = remoteStream;
      setTimeout(async () => {
        await deleteOfferAndAnswer();
      }, 500);
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

    const unsubscribe = onSnapshot(roomRef, async (doc) => {
      const data = doc.data();
      if (data) {
        const { viewers } = data;
        setViewersNum(viewers.length);
        if (
          user.email === studyGroup.createBy &&
          viewers &&
          viewers.length > peerConnections.length
        ) {
          createRoom();
        }
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerConnections, id]);

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
  }, [id]);

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
          modal.success('結束直播');
          navigate({ pathname: '/profile/finished' }, { replace: true });
          deleteDoc(doc(db, 'rooms', id));
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      const roomRef = doc(collection(db, 'rooms'), id);

      const unsubscribe = onSnapshot(roomRef, (roomSnapshot) => {
        if (roomSnapshot.exists()) {
          setIsDisabled(false);
        } else {
          setIsDisabled(true);
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = MessageInput.trim();

    if (trimmedMessage) {
      await addDoc(collection(db, 'rooms', id, 'messages'), {
        message: trimmedMessage,
        timestamp: new Date(),
        sender: user.email,
        senderName: user.name,
        sanderImg: user.userImg,
      });
      setMessageInput('');
    }
  };

  async function handleSaveNote() {
    try {
      const userRef = doc(db, 'users', user.email);
      const newGroupRef = doc(collection(userRef, 'userStudyGroups'), id);
      await setDoc(newGroupRef, {
        note: note,
      });
      setShowSaveInfo(true);
      setTimeout(() => {
        setShowSaveInfo(false);
      }, 1000);
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
    await setDoc(doc(db, 'rooms', id), { currentCard: 0, viewers: [] });
    modal.success('開始直播');
    const studyGroupRef = doc(db, 'rooms', id);
    const unsubscribe = onSnapshot(studyGroupRef, (snapshot) => {
      const studyGroupData = snapshot.data();
      if (studyGroupData && studyGroupData.currentCard !== undefined) {
        setCurrentCard(studyGroupData.currentCard);
      }
    });
    createRoom();
    return () => unsubscribe();
  }

  async function handleJoin() {
    modal.success('加入直播');
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

    if (peerConnections.length > 0) {
      peerConnections.forEach((pc) => pc.close());
      setPeerConnections([]);

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
        setLocalStream(null);
      }

      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        remoteVideoRef.current.srcObject = null;
      }

      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        localVideoRef.current.srcObject = null;
      }
    }
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

  const handleVideoToggle = () => {
    setShowLocalVideo(!showLocalVideo);
  };
  const handleChatRoom = () => {
    setShowChatRoom(!showChatRoom);
  };

  return (
    <SideMenu>
      <Container>
        <GroupTitle studyGroup={studyGroup} />
        <LiveContainer>
          <LiveScreen showChatRoom={showChatRoom}>
            <LiveInfo>
              <LiveIcon isLive={isLive}>Live</LiveIcon>
              <LiveNum>
                <BsPeopleFill />
                {viewersNum}人
              </LiveNum>
            </LiveInfo>
            <LiveInputs isLive={isLive}>
              <StartBtn
                isHost={studyGroup.createBy === user.email}
                onClick={openUserMedia}>
                開啟鏡頭
              </StartBtn>
              <StartBtn
                isHost={studyGroup.createBy === user.email}
                disabled={videoState.isMuted && videoState.isVideoDisabled}
                onClick={handleStart}>
                開始直播
              </StartBtn>
              <StartBtn
                isHost={studyGroup.createBy !== user.email}
                disabled={isDisabled}
                onClick={handleJoin}>
                加入直播
              </StartBtn>
            </LiveInputs>
            <Cards isLive={isLive}>
              {processData?.map((item, processIndex) => (
                <Card
                  activeCard={processIndex === currentCard}
                  key={processIndex}>
                  <Description>{item.description}</Description>
                  <CardContent>
                    {renderCardContent(item, processIndex)}
                  </CardContent>
                </Card>
              ))}
            </Cards>
            {processData && isLive && (
              <ProcessInputs>
                <HostInput isHost={studyGroup.createBy === user.email}>
                  <MediaButton
                    onClick={() => {
                      setCurrentCard((prev) => {
                        const newCard = prev > 0 ? prev - 1 : prev;
                        updateCurrentCardInFirebase(newCard);
                        return newCard;
                      });
                    }}>
                    <MdFirstPage />
                  </MediaButton>
                  <MediaButton
                    onClick={() => {
                      setCurrentCard((prev) => {
                        const newCard =
                          prev < processData.length - 1 ? prev + 1 : prev;
                        updateCurrentCardInFirebase(newCard);
                        return newCard;
                      });
                    }}>
                    <MdLastPage />
                  </MediaButton>
                  <MediaButton
                    isActive={videoState.isMuted}
                    activeColor="#e95f5c"
                    onClick={toggleMute}>
                    {videoState.isMuted ? (
                      <FaMicrophoneSlash />
                    ) : (
                      <FaMicrophone />
                    )}
                  </MediaButton>
                  <MediaButton
                    isActive={videoState.isVideoDisabled}
                    activeColor="#e95f5c"
                    onClick={toggleVideo}>
                    {videoState.isVideoDisabled ? (
                      <BsCameraVideoOffFill />
                    ) : (
                      <BsCameraVideoFill />
                    )}
                  </MediaButton>
                </HostInput>
                <MediaButton
                  isActive={!showLocalVideo}
                  activeColor="#e95f5c"
                  onClick={handleVideoToggle}>
                  {showLocalVideo ? (
                    <BsBoxArrowInDownRight />
                  ) : (
                    <BsBoxArrowInUpLeft />
                  )}
                </MediaButton>
                <MediaButton
                  isActive={!showChatRoom}
                  activeColor="#e95f5c"
                  onClick={handleChatRoom}>
                  {showChatRoom ? <BsChatLeftDotsFill /> : <RiChatOffFill />}
                </MediaButton>
                <Hangup
                  isHost={studyGroup.createBy === user.email}
                  onClick={handleStop}>
                  <FaPhoneSlash />
                </Hangup>
              </ProcessInputs>
            )}
            <Broadcast>
              <LocalVideo
                isHost={studyGroup.createBy === user.email}
                autoPlay
                ref={localVideoRef}
                muted
                show={showLocalVideo}
              />
              <RemoteVideo
                isHost={studyGroup.createBy === user.email}
                autoPlay
                ref={remoteVideoRef}
                show={showLocalVideo}
              />
            </Broadcast>
          </LiveScreen>
          <ChatRoom showChatRoom={showChatRoom}>
            <ChatTitle>聊天室</ChatTitle>
            <Message>
              {messages.map((message, index) => {
                if (message.sender === null) {
                  return (
                    <SystemMessage key={index}>{message.message}</SystemMessage>
                  );
                } else if (user.email === message.sender) {
                  return (
                    <UserMessage key={index}>{message.message}</UserMessage>
                  );
                } else {
                  return (
                    <GuestMessage key={index}>
                      <UserImg src={message.sanderImg} alt="userImg" />
                      <SenderMessage>
                        <SenderName>{message.senderName}</SenderName>
                        <p>{message.message}</p>
                      </SenderMessage>
                    </GuestMessage>
                  );
                }
              })}
              <div
                ref={(el) => {
                  messagesEndRef.current = el;
                }}
              />
            </Message>
            <ChatInput>
              <form onSubmit={sendMessage}>
                <input
                  value={MessageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
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
          <LiveMainBtn onClick={handleSaveNote}>儲存筆記</LiveMainBtn>
          <SaveInfo showSaveInfo={showSaveInfo}>已儲存筆記</SaveInfo>
        </Note>
      </Container>
    </SideMenu>
  );
}

const Container = styled.div`
  width: 100%;
`;

const SaveInfo = styled.div`
  opacity: ${({ showSaveInfo }) => (showSaveInfo ? 1 : 0)};
  font-size: 14px;
  color: #e95f5c;
  display: inline-block;
  margin-left: 10px;
`;
const HostInput = styled.div`
  display: ${({ isHost }) => (isHost ? 'flex' : 'none')};
  gap: 10px;
`;
const LocalVideo = styled.video`
  display: ${({ isHost }) => (isHost ? 'block' : 'none')};
  width: ${({ show }) => (show ? '200px' : '100px')};
  border-radius: 6px;
`;
const RemoteVideo = styled.video`
  display: ${({ isHost }) => (isHost ? 'none' : 'block')};
  width: ${({ show }) => (show ? '200px' : '100px')};
  border-radius: 6px;
`;

const LiveContainer = styled.div`
  display: flex;
  height: 500px;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px;
`;
const Broadcast = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
`;
const LiveInfo = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const LiveIcon = styled.div`
  background: #f0f0f0;
  background: ${({ isLive }) => (isLive ? '#DF524D' : '#f0f0f0')};
  color: ${({ isLive }) => (isLive ? '#fff' : '#5b5b5b')};
  border-radius: 25px;
  text-align: center;
  padding: 5px 20px;
`;
const LiveNum = styled.div`
  letter: 1.3px;
  svg {
    margin-right: 10px;
    color: #5b5b5b;
  }
`;
const LiveScreen = styled.div`
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 10px;
  position: relative;
  border-radius: 6px;
  background-color: #fff;
  width: ${({ showChatRoom }) => (showChatRoom ? '75%' : '100%')};
`;
const LiveInputs = styled.div`
  display: ${({ isLive }) => (isLive ? 'none' : 'flex')};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  gap: 10px;
`;

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
  height: 370px;
`;
const ProcessInputs = styled.div`
  margin-top: auto;
  align-items: center;
  gap: 8px;
  display: flex;
  justify-content: center;
  padding-right: 20px;
  z-index: 1;
  margin-right: 30px;

  svg {
    transform: scale(1.2);
    cursor: pointer;
    color: #5b5b5b;
  }
`;

const MediaButton = styled.button`
  padding: 10px;
  border-radius: 25px;
  background-color: ${({ isActive, activeColor }) =>
    isActive ? activeColor : '#f1f1f1'};
  border: none;
  cursor: pointer;
  outline: none;
  svg {
    color: ${({ isActive }) => (isActive ? '#fff' : '#5b5b5b')};
  }
  :hover {
    background-color: #e95f5c;
    svg {
      color: #fff;
      transition: 0s;
    }
  }
`;

const Hangup = styled(MediaButton)`
  display: ${({ isHost }) => (isHost ? 'block' : 'none')};
  background-color: #e95f5c;
  svg {
    color: #fff;
  }
`;

const SenderMessage = styled.div`
  background-color: #f1f1f1;
  padding: 5px 10px;
  border-radius: 6px;
`;
const ChatRoom = styled.div`
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  display: ${({ showChatRoom }) => (showChatRoom ? 'flex' : 'none')};
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  width: 230px;
`;
const SenderName = styled.div`
  color: #5b5b5b;
  font-size: 12px;
`;
const GuestMessage = styled.div`
  border-radius: 6px;
  align-items: center;
  align-self: flex-start;
  display: inline-flex;
`;
const UserImg = styled.img`
  width: 35px;
  height: 35px;
  display: inline-block;
  margin-right: 5px;
  border-radius: 50%;
  align-self: flex-start;
  object-fit: cover;
`;
const UserMessage = styled(GuestMessage)`
  padding: 5px 10px;
  background-color: #f1f1f1;
  align-self: flex-end;
`;
const SystemMessage = styled.div`
  text-align: center;
  color: #df524d;
`;
const Message = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 2;
  height: 500px;
  overflow: auto;
  padding: 10px;
  gap: 10px;
  font-size: 14px;
`;
const ChatInput = styled.div`
  margin-top: auto;
  background-color: #f1f1f1;
  margin: 10px;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  form {
    display: flex;
    align-items: center;
  }
  input {
    margin: 5px 10px;
  }
  button {
    cursor: pointer;
  }
`;
const ChatTitle = styled.div`
  margin: 5px;
  padding: 8px 8px;
  background-color: #f1f1f1;
  border-radius: 25px;
  text-align: center;
  letter-spacing: 1.2;
`;
const Note = styled.div`
  height: 350px;
  background-color: #fff;
`;
export default Live;
