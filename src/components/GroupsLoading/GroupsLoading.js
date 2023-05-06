import styled, { keyframes } from 'styled-components/macro';

function GroupsLoading() {
  return (
    <LoadingContainter>
      <ImgContainer />
      <InfoContainer>
        <Info />
        <Info />
        <Info2 />
        <Info3 />
      </InfoContainer>
    </LoadingContainter>
  );
}
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

const Pulse = styled.div`
  animation: ${pulse} 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const Info = styled(Pulse)`
  height: 25px;
  width: 100%;
  background-color: #ececec;
  border-radius: 25px;
`;

const Info2 = styled(Info)`
  width: 50%;
`;
const Info3 = styled(Info)`
  width: 80%;
`;
const LoadingContainter = styled.div`
  max-width: 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  max-height: 480px;
  border: 1.5px solid #ececec;
`;
const ImgContainer = styled(Pulse)`
  height: 343px;
  background-color: #ececec;
`;
const InfoContainer = styled.div`
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 15px;
`;
const Btn = styled(Pulse)`
  border-radius: 10px;
  height: 36px;
  background-color: #ececec;
`;
export default GroupsLoading;
