import styled, { keyframes } from 'styled-components';

function DecoBg() {
  const animations = {
    move1: keyframes`
      from {
        transform: translate(0, 0);
      }
      to {
        transform: translate(75%, 0%);
      }
    `,
    move2: keyframes`
      from {
        transform: translate(0, 0);
      }
      to {
        transform: translate(100%, 20%);
      }
    `,
    move3: keyframes`
      from {
        transform: translate(0, 0);
      }
      to {
        transform: translate(80%, 0%);
      }
    `,
    move4: keyframes`
      from {
        transform: translate(0, 0);
      }
      to {
        transform: translate(-100%, 0%);
      }
    `,
  };

  return (
    <Decos>
      <Deco
        {...{
          animations,
          name: 'move1',
          color: '239, 140, 138',
          blur: '100px',
          top: '-20%',
          left: '-10%',
          width: '40%',
          height: '90%',
        }}
      />
      <Deco
        {...{
          animations,
          name: 'move2',
          color: '231, 93, 16',
          blur: '100px',
          top: '20%',
          left: '30%',
          width: '25%',
          height: '60%',
        }}
      />
      <Deco
        {...{
          animations,
          name: 'move3',
          color: '96, 160, 255',
          blur: '40px',
          bottom: '0px',
          right: '20%',
          width: '20%',
          height: '45%',
        }}
      />
      <Deco
        {...{
          animations,
          name: 'move4',
          color: '255, 172, 76',
          blur: '50px',
          top: '25%',
          right: '0px',
          width: '15%',
          height: '30%',
        }}
      />
    </Decos>
  );
}

const Decos = styled.div`
  position: absolute;
  z-index: -1;
  width: 90vw;
  height: 85vh;
  display: flex;
`;

const Deco = styled.div`
  position: absolute;
  background: rgba(${(props) => props.color}, 0.2);
  filter: blur(${(props) => props.blur});
  border-radius: 50%;
  animation: ${({ animations, name }) => animations[name]} 2s linear infinite
    alternate;
  ${({ top }) => top && `top: ${top}`};
  ${({ bottom }) => bottom && `bottom: ${bottom}`};
  ${({ left }) => left && `left: ${left}`};
  ${({ right }) => right && `right: ${right}`};
  width: ${({ width }) => width};
  height: ${({ height }) => height};
`;

export default DecoBg;
