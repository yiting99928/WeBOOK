import styled, { keyframes } from 'styled-components/macro';
import load from './load.mp4';

function Loading() {
  return (
    <VideoContainer>
      <Video
        loop
        playsInline
        autoPlay
        muted
        src={load}
        type="video/mp4"
        controls={false}
      />
      <p>Loading...</p>
    </VideoContainer>
  );
}
const VideoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.1);
  letter-spacing: 2;
  color: #df524d;
  font-family: 'Poppins', sans-serif;
`;
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
`;
const Video = styled.video`
  width: 200px;
  height: 200px;
  animation: ${bounce} 1s linear infinite;
`;
export default Loading;
