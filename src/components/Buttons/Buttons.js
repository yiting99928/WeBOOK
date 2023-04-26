// Buttons.js
import styled from 'styled-components/macro';

function Buttons() {
  return (
    <>
      <JoinBtn>加入讀書會</JoinBtn>
    </>
  );
}
const JoinBtn = ({ children, onClick }) => {
  return <JoinBtnStyled onClick={onClick}>{children}</JoinBtnStyled>;
};

const JoinBtnStyled = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  background: #ffac4c;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  letter-spacing: 1.2;
  font-size: 16px;
  margin-top: 8px;
`;

export default Buttons;
export { JoinBtn };
