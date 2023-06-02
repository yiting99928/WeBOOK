import { MouseEvent, ReactNode } from 'react';
import styled from 'styled-components/macro';

const MainBtn = ({
  children,
  onClick,
  height = '36px',
}: {
  children: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  height?: string;
}) => {
  return (
    <MainBtnStyled onClick={onClick} $height={height}>
      {children}
    </MainBtnStyled>
  );
};
const OutlineBtn = ({
  children,
  onClick,
  selectedCategory = false,
}: {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  selectedCategory?: boolean;
}) => {
  return (
    <OutlineBtnStyled
      onClick={onClick}
      $selectedCategory={selectedCategory}>
      {children}
    </OutlineBtnStyled>
  );
};

const StartBtn = ({
  children,
  isHost,
  disabled,
  onClick,
}: {
  children: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  isHost: boolean;
  disabled: boolean;
}) => {
  return (
    <OpenInput $isHost={isHost} onClick={onClick} disabled={disabled}>
      {children}
    </OpenInput>
  );
};
const LiveMainBtn = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) => {
  return <LiveInput onClick={onClick}>{children}</LiveInput>;
};

const LiveInput = styled.button`
  background-color: #ffac4c;
  cursor: pointer;
  color: #fff;
  cursor: 'pointer';
  padding: 8px 15px;
  margin-top: 10px;
  border-radius: 6px;
  :hover {
    background-color: rgb(223, 82, 77);
  }
`;
const OpenInput = styled(LiveInput)<{ $isHost: boolean }>`
  display: ${({ $isHost }) => ($isHost ? 'block' : 'none')};
  background-color: ${({ disabled }) => (disabled ? '#b5b5b5' : '#ffac4c')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;
const MainBtnStyled = styled.button<{ $height: string }>`
  cursor: pointer;
  height: ${({ $height }) => $height};
  background-color: #ffac4c;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  letter-spacing: 1.2;
  font-size: 16px;
  margin-top: 8px;
  width: 100%;
  :hover {
    background-color: rgb(223, 82, 77);
  }
`;
const OutlineBtnStyled = styled.button<{
  $selectedCategory?: boolean;
}>`
  padding: 3px 8px;
  border: 2px solid #ffac4c;
  border-radius: 5px;
  background-color: ${({ $selectedCategory }) =>
    $selectedCategory ? '#ffac4c' : '#fff'};
  color: ${({ $selectedCategory }) => ($selectedCategory ? '#fff' : '#ffac4c')};
  cursor: pointer;
  letter-spacing: 1.2;
  font-size: 14px;
  :hover {
    background-color: #ffac4c;
    color: #fff;
  }
`;
const GuestEditInput = styled(OutlineBtnStyled)<{ $isHost: boolean }>`
  display: ${({ $isHost }) => ($isHost ? 'none' : 'inline-block')};
`;
const HostEditInput = styled(OutlineBtnStyled)<{ $isHost: boolean }>`
  display: ${({ $isHost }) => ($isHost ? 'inline-block' : 'none')};
`;

export {
  MainBtn,
  OutlineBtn,
  LiveMainBtn,
  StartBtn,
  GuestEditInput,
  HostEditInput,
};
