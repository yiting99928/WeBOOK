import styled, { keyframes } from 'styled-components/macro';

function DecoBg() {
  return (
    <Decos>
      <Deco />
      <Deco2 />
      <Deco3 />
      <Deco4 />
    </Decos>
  );
}

const move1 = keyframes`
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(75%, 0%);
  }
`;

const move2 = keyframes`
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(100%, 20%);
  }
`;

const move3 = keyframes`
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(80%, 0%);
  }
`;

const move4 = keyframes`
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(-100%, 0%);
  }
`;

const Decos = styled.div`
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 85vh;
  display: flex;
`;

const Deco = styled.div`
  position: absolute;
  width: 40%;
  height: 90%;
  background: rgba(239, 140, 138, 0.25);
  top: -20%;
  left: -10%;
  filter: blur(100px);
  border-radius: 50%;
  animation: ${move1} 2s linear infinite alternate;
`;

const Deco2 = styled.div`
  left: 30%;
  position: absolute;
  width: 25%;
  height: 60%;
  top: 20%;
  background: rgba(231, 93, 16, 0.2);
  filter: blur(100px);
  border-radius: 50%;
  animation: ${move2} 1.5s linear infinite alternate;
`;

const Deco3 = styled.div`
  position: absolute;
  width: 20%;
  height: 45%;
  right: 20%;
  bottom: 0px;
  background: rgba(96, 160, 255, 0.2);
  border-radius: 50%;
  filter: blur(40px);
  animation: ${move3} 3s linear infinite alternate;
`;

const Deco4 = styled.div`
  position: absolute;
  width: 15%;
  height: 30%;
  right: 0px;
  top: 25%;
  background: rgba(255, 172, 76, 0.3);
  border-radius: 50%;
  filter: blur(50px);
  animation: ${move4} 2s linear infinite alternate;
`;

export default DecoBg;
