import styled, { keyframes } from 'styled-components/macro';

function GroupsLoading() {
  return (
    <LoadingContainer>
      <ImgContainer />
      <InfoContainer>
        <Info width="100%" />
        <Info width="100%" />
        <Info width="50%" />
        <Info width="80%" />
      </InfoContainer>
    </LoadingContainer>
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

const Info = styled.div`
  height: 25px;
  width: ${({ width }) => width || '100%'};
  background-color: #ececec;
  border-radius: 25px;
  animation: ${pulse} 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const LoadingContainer = styled.div`
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

const ImgContainer = styled.div`
  height: 343px;
  background-color: #ececec;
  animation: ${pulse} 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const InfoContainer = styled.div`
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 15px;
`;

export default GroupsLoading;
