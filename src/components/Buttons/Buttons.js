import styled from 'styled-components/macro';

const MainBtn = ({ children, onClick, height = '36px' }) => {
  return (
    <MainBtnStyled onClick={onClick} height={height}>
      {children}
    </MainBtnStyled>
  );
};
const OutlineBtn = ({ children, onClick, isHost }) => {
  return (
    <OutlineBtnStyled onClick={onClick} isHost={isHost}>
      {children}
    </OutlineBtnStyled>
  );
};

const MainBtnStyled = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${({ height }) => height};
  background: #ffac4c;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  letter-spacing: 1.2;
  font-size: 16px;
  margin-top: 8px;
`;
const OutlineBtnStyled = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 8px 4px 8px;
  border: 2px solid #ffac4c;
  border-radius: 5px;
  background-color: white;
  color: #ffac4c;
  cursor: pointer;
  letter-spacing: 1.2;
  font-size: 14px;
  :hover {
    background-color: #ffac4c;
    color: #fff;
  }
`;
const GuestEditInput = styled(OutlineBtnStyled)`
  display: ${({ isHost }) => (isHost ? 'none' : 'inline-block')};
`;
const HostEditInput = styled(OutlineBtnStyled)`
  display: ${({ isHost }) => (isHost ? 'inline-block' : 'none')};
`;

// export default Buttons;
export { MainBtn };
export { OutlineBtn };
export { GuestEditInput };
export { HostEditInput };
