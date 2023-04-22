import styled from 'styled-components/macro';
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
const Decos = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 600px;
  align-items: center;
  justify-content: space-between;
  z-index: -1;
`;
const Deco = styled.div`
  width: 50%;
  height: 50%;
  background: rgba(239, 140, 138, 0.3);
  filter: blur(100px);
  margin-top: -10%;
  margin-left: -30%;
`;
const Deco2 = styled.div`
  width: 20%;
  height: 20%;
  background: rgba(231, 93, 16, 0.3);
  filter: blur(80px);
`;
const Deco3 = styled.div`
  width: 25%;
  height: 25%;
  background: rgba(96, 160, 255, 0.3);
  align-self: flex-end;
  filter: blur(80px);
  margin-bottom: 50px;
`;
const Deco4 = styled.div`
  width: 10%;
  height: 35%;
  background: rgba(255, 172, 76, 0.3);
  filter: blur(80px);
`;
export default DecoBg;
