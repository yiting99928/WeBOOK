import { useState, useRef, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import {
  doc,
  addDoc,
  onSnapshot,
  collection,
  updateDoc,
  arrayUnion,
  deleteField,
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../../context/authContext';

function Broadcast({ id, studyGroup }) {
  const { user } = useContext(AuthContext);
  const [localStream, setLocalStream] = useState(null);
  const [peerConnections, setPeerConnections] = useState([]);

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

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

    localStream.getTracks().forEach((track) => {
      console.log(track);
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
      await deleteOfferAndAnswer();
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

  return (
    <div>
      <div>
        <input type="button" value="open media" onClick={openUserMedia} />
        <input type="button" value="create room" onClick={createRoom} />
        <input type="button" value="join room" onClick={joinRoom} />
      </div>
      <Screen>
        <Host isHost={studyGroup.createBy === user.email}>
          <h4>Local</h4>
          <Video autoPlay playsInline controls ref={localVideoRef} muted />
        </Host>
        <Guest isHost={studyGroup.createBy === user.email}>
          <h4>Remote</h4>
          <Video autoPlay playsInline controls ref={remoteVideoRef} />
        </Guest>
      </Screen>
    </div>
  );
}
const Host = styled.div`
  display: ${({ isHost }) => (isHost ? 'block' : 'none')};
  transition: 0s;
`;
const Guest = styled.div`
  display: ${({ isHost }) => (isHost ? 'none' : 'block')};
  transition: 0s;
`;
const Video = styled.video`
  width: 250px;
`;
const Screen = styled.div`
  display: flex;
  gap: 2px;
`;
export default Broadcast;
