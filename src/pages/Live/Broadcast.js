import { useState, useRef } from 'react';
import {
  doc,
  addDoc,
  onSnapshot,
  collection,
  updateDoc,
  arrayUnion,
  deleteField,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { v4 as uuidv4 } from 'uuid';
function Broadcast({ id }) {
  // const [peerConnections, setPeerConnections] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  // const [roomId, setRoomId] = useState('');
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

  async function createMutedAudioStream() {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const dst = oscillator.connect(audioContext.createMediaStreamDestination());
    oscillator.start();

    const stream = dst.stream;
    const tracks = stream.getAudioTracks();
    return new MediaStream(tracks);
  }

  async function createRoom() {
    const roomRef = doc(collection(db, 'rooms'), id);

    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach((track) => {
      console.log(track);
      peerConnection.addTrack(track, localStream);
    });

    // const roomRef = doc(collection(db, 'rooms'), id);

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
    // 等待 createRoom 執行完畢
    // let createRoomCompleted = false;
    // while (!createRoomCompleted) {
    //   // 從 Firebase 獲取 createRoomCompleted 欄位
    //   const roomSnapshot = await getDoc(roomRef);
    //   createRoomCompleted = roomSnapshot.data().createRoomCompleted;

    //   // 如果 createRoom 尚未執行完畢，稍作暫停再次檢查
    //   if (!createRoomCompleted) {
    //     await new Promise((resolve) => setTimeout(resolve, 500));
    //   }
    // }
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.addEventListener('track', async (event) => {
      console.log('Join remoteStream', event);
      const [remoteStream] = event.streams;
      remoteVideoRef.current.srcObject = remoteStream;
    });

    const mutedAudioStream = await createMutedAudioStream();
    setLocalStream(mutedAudioStream);

    mutedAudioStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, mutedAudioStream);
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
  return (
    <div className="App">
      <input type="button" value="open media" onClick={openUserMedia} />
      <input type="button" value="create room" onClick={createRoom} />
      <input type="button" value="join room" onClick={joinRoom} />
      {/* <input type="button" value="join room" onClick={getDocId} /> */}
      {/* <input
        type="text"
        onChange={(e) => setRoomId(e.target.value)}
        value={roomId}
      /> */}
      <h4>Local</h4>
      <video autoPlay playsInline controls ref={localVideoRef} muted />
      <h4>Remote</h4>
      <video autoPlay playsInline controls ref={remoteVideoRef} />
    </div>
  );
}
export default Broadcast;
