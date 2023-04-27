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
import { v4 as uuidv4 } from 'uuid';
import { IoIosArrowForward } from 'react-icons/io';
import {
  BsChatDotsFill,
  BsCameraVideoFill,
  BsCameraVideoOffFill,
} from 'react-icons/bs';
import { MdFirstPage, MdLastPage, MdFitScreen } from 'react-icons/md';
import { FaPhoneSlash, FaMicrophoneSlash, FaMicrophone } from 'react-icons/fa';

import moment from 'moment';

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
    isMuted: true,
    isVideoDisabled: true,
  });
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const [showLocalVideo, setShowLocalVideo] = useState(true);
  const [showChatRoom, setShowChatRoom] = useState(true);

  //--------------------//
  //-----直播區開始-----//
  //--------------------//
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

    // if (localStream) {
    localStream.getTracks().forEach((track) => {
      console.log(track);
      peerConnection.addTrack(track, localStream);
    });
    // }

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
  }, [peerConnections, id]);

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

  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (id) {
      const roomRef = doc(collection(db, 'rooms'), id);

      const unsubscribe = onSnapshot(roomRef, (roomSnapshot) => {
        if (roomSnapshot.exists()) {
          console.log('Room exists!');
          setIsDisabled(false);
        } else {
          console.log('Room does not exist!');
          setIsDisabled(true);
        }
      });

      // Clean up the listener when the component is unmounted
      return () => {
        unsubscribe();
      };
    }
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'rooms', id, 'messages'), {
      message: input,
      timestamp: new Date(),
      sender: user.email,
      senderName: user.name,
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

  const handleVideoToggle = () => {
    setShowLocalVideo(!showLocalVideo);
  };
  const handleChatRoom = () => {
    setShowChatRoom(!showChatRoom);
  };
  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        <GroupTitle>
          <GroupBook>
            {studyGroup.groupName}
            <br />
            <p>{studyGroup.name}</p>
          </GroupBook>
          作者：{studyGroup.author}
          <br />
          導讀章節:{studyGroup.chapter}
          <br />
          舉辦時間:
          {studyGroup && studyGroup.startTime ? (
            moment
              .unix(studyGroup.startTime.seconds)
              .format('YYYY-MM-DD hh:mm A')
          ) : (
            <div>loading</div>
          )}
          <br />
          導讀人：{studyGroup.host}
        </GroupTitle>
        <LiveContainer>
          <LiveScreen showChatRoom={showChatRoom}>
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
                disabled={videoState.isMuted && videoState.isVideoDisabled}
                onClick={handleStart}
              />
              <JoinInput
                isHost={studyGroup.createBy === user.email}
                type="button"
                value="加入直播"
                disabled={isDisabled}
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
              <ProcessInputs>
                <HostInput isHost={studyGroup.createBy === user.email}>
                  <MediaIcon>
                    <MdFirstPage
                      onClick={() =>
                        setCurrentCard((prev) => {
                          const newCard = prev > 0 ? prev - 1 : prev;
                          updateCurrentCardInFirebase(newCard);
                          return newCard;
                        })
                      }
                    />
                  </MediaIcon>
                  <MediaIcon>
                    <MdLastPage
                      onClick={() => {
                        setCurrentCard((prev) => {
                          const newCard =
                            prev < processData.length - 1 ? prev + 1 : prev;
                          updateCurrentCardInFirebase(newCard);
                          return newCard;
                        });
                      }}
                    />
                  </MediaIcon>
                  <MutedIcon isMuted={videoState.isMuted}>
                    {videoState.isMuted ? (
                      <FaMicrophoneSlash onClick={toggleMute} />
                    ) : (
                      <FaMicrophone onClick={toggleMute} />
                    )}
                  </MutedIcon>
                  <VideoDisabled isVideoDisabled={videoState.isVideoDisabled}>
                    {videoState.isVideoDisabled ? (
                      <BsCameraVideoOffFill onClick={toggleVideo} />
                    ) : (
                      <BsCameraVideoFill onClick={toggleVideo} />
                    )}
                  </VideoDisabled>
                </HostInput>
                {/* <MediaIcon>
                  <MdFitScreen onClick={handleVideoToggle} />
                </MediaIcon> */}
                <MediaIcon>
                  <BsChatDotsFill onClick={handleChatRoom} />
                </MediaIcon>
                <Hangup isHost={studyGroup.createBy === user.email}>
                  <FaPhoneSlash onClick={handleStop} />
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
              {messages.map((message, index) =>
                user.email === message.sender ? (
                  <UserMessage key={index}>{message.message}</UserMessage>
                ) : (
                  <GuestMessage key={index}>
                    <span>{message.senderName}：</span>
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
          <Button onClick={handleSaveNote}>儲存筆記</Button>
        </Note>
      </Content>
    </Container>
  );
}
const HostInput = styled.div`
  display: ${({ isHost }) => (isHost ? 'flex' : 'none')};
  gap: 10px;
`;
const LocalVideo = styled.video`
  display: ${({ isHost, show }) => (isHost && show ? 'block' : 'none')};
  width: 200px;
  border-radius: 6px;
`;
const RemoteVideo = styled.video`
  display: ${({ isHost, show }) => (isHost || !show ? 'none' : 'block')};
  width: 200px;
  border-radius: 6px;
`;

const LiveContainer = styled.div`
  display: flex;
  width: 100%;
  height: 500px;
  gap: 15px;
  justify-content: space-between;
  margin-bottom: 20px;
`;
const Broadcast = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
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
  top: 10px;
  right: 10px;
`;
const LiveScreen = styled.div`
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  ${'' /* width: 100%; */}
  width: ${({ showChatRoom }) => (showChatRoom ? '740px' : '100%')};
  padding: 10px;
  position: relative;
  border-radius: 6px;
  background-color: #fff;
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
  background-color: ${({ disabled }) => (disabled ? '#b5b5b5' : '#ffac4c')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  color: #fff;
  padding: 8px 15px;
  margin-top: 10px;
  border-radius: 6px;
`;
const JoinInput = styled.input`
  display: ${({ isHost }) => (isHost ? 'none' : 'block')};
  background-color: ${({ disabled }) => (disabled ? '#b5b5b5' : '#ffac4c')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  color: #fff;
  padding: 8px 15px;
  margin-top: 10px;
  border-radius: 6px;
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
  height: 370px;
`;
const ProcessInputs = styled.div`
  margin-top: auto;
  align-items: center;
  gap: 8px;
  display: flex;
  justify-content: center;
  svg {
    transform: scale(1.2);
    cursor: pointer;
    color: #5b5b5b;
  }
`;
const MediaIcon = styled.div`
  padding: 10px;
  border-radius: 25px;
  background-color: #f1f1f1;
`;
const MutedIcon = styled(MediaIcon)`
  background-color: ${({ isMuted }) => (isMuted ? '#e95f5c' : '#f1f1f1')};
  svg {
    color: ${({ isMuted }) => (isMuted ? '#fff' : '#5b5b5b')};
  }
`;
const VideoDisabled = styled(MediaIcon)`
  background-color: ${({ isVideoDisabled }) =>
    isVideoDisabled ? '#e95f5c' : '#f1f1f1'};
  svg {
    color: ${({ isVideoDisabled }) => (isVideoDisabled ? '#fff' : '#5b5b5b')};
  }
`;

const Hangup = styled(MediaIcon)`
  display: ${({ isHost }) => (isHost ? 'block' : 'none')};
  background-color: #e95f5c;
  svg {
    color: #fff;
  }
`;

//---聊天室---//
const ChatRoom = styled.div`
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  display: ${({ showChatRoom }) => (showChatRoom ? 'flex' : 'none')};
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  background-color: #fff;
  width: 240px;
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
  padding: 0 5px;
  margin: 10px;
  border-radius: 25px;
  form {
    display: flex;
    align-items: center;
  }
  button {
    margin-top: 5px;
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
//---筆記---//
const Note = styled.div`
  height: 350px;
  background-color: #fff;
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
  background-color: rgba(236, 236, 236, 0.15);
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
  font-size: 32px;
  p {
    font-size: 28px;
    font-weight: 500;
    padding-top: 5px;
    letter-spacing: 1.5;
  }
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
