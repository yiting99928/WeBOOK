import { useState, useRef } from 'react';
import styled from 'styled-components/macro';
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
  const [localStream, setLocalStream] = useState(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

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
        <div>
          <h4>Local</h4>
          <Video autoPlay playsInline controls ref={localVideoRef} muted />
        </div>
        <div>
          <h4>Remote</h4>
          <Video autoPlay playsInline controls ref={remoteVideoRef} />
        </div>
      </Screen>
    </div>
  );
}
const Video = styled.video`
  width: 250px;
`;
const Screen = styled.div`
  display: flex;
  gap: 2px;
`;
export default Broadcast;
