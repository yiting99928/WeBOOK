import styled from 'styled-components/macro';
export default function DecoGb() {
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
`;
const Deco = styled.div`
  width: 414px;
  height: 414px;
  background: rgba(239, 140, 138, 0.3);
  filter: blur(100px);
  margin-top: -80px;
`;
const Deco2 = styled(Deco)`
  width: 140px;
  height: 140px;
  background: rgba(231, 93, 16, 0.3);
`;
const Deco3 = styled(Deco)`
  width: 228px;
  height: 228px;
  background: rgba(96, 160, 255, 0.3);
  align-self: flex-end;
  margin-top: -50px;
`;
const Deco4 = styled(Deco)`
  width: 350px;
  height: 350px;
  background: rgba(255, 172, 76, 0.3);
`;
