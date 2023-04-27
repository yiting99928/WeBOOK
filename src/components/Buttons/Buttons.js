import styled from 'styled-components/macro';

const MainBtn = ({ children, onClick, height = '36px' }) => {
  return (
    <MainBtnStyled onClick={onClick} height={height}>
      {children}
    </MainBtnStyled>
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

// export default Buttons;
export { MainBtn };
