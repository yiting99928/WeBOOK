import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import logoImg from './logo.png';

function Header() {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <Container>
        <Wrapper>
          <Link to="./">
            <Logo />
          </Link>
          <Menu>
            <Link to="study-groups">所有讀書會</Link>
            <Link to={user ? '/create' : '/login'}>建立讀書會</Link>
            <Link to={user ? '/profile' : '/login'}>會員</Link>
          </Menu>
        </Wrapper>
      </Container>
      <HamburgerIcon onClick={handleClick}>
        <HamburgerLine1 isOpen={isOpen} />
        <HamburgerLine2 isOpen={isOpen} />
        <HamburgerLine3 isOpen={isOpen} />
      </HamburgerIcon>
      <MobileWrap isOpen={isOpen}>
        <MobileMenu>
          <p>
            <Link onClick={handleClick} to={user ? '/create' : '/login'}>
              建立讀書會
            </Link>
          </p>
          <p>
            <Link onClick={handleClick} to={`/study-groups`}>
              所有讀書會
            </Link>
          </p>
          <p>
            <Link onClick={handleClick} to={user ? '/profile' : '/login'}>
              會員
            </Link>
          </p>
        </MobileMenu>
      </MobileWrap>
      <MobileBg isOpen={isOpen} onClick={handleClick}/>
    </>
  );
}
const MobileBg = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

const HamburgerIcon = styled.div`
  width: 30px;
  height: 20px;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  top: 20px;
  right: 30px;
  cursor: pointer;
  position: fixed;
  z-index: 20;
  display: none;
  @media screen and (max-width: 768px) {
    display: flex;
    right: 45px;
  }
  @media screen and (max-width: 375px) {
    right: 60px;
  }
`;

const lineStyles = `
  width: 100%;
  height: 3px;
  background-color: #DF524D;
`;

const HamburgerLine1 = styled.div`
  ${lineStyles}
  transform: ${({ isOpen }) => (isOpen ? 'rotate(45deg)' : 'rotate(0)')};
  position: ${({ isOpen }) => (isOpen ? 'absolute' : 'static')};
  top: ${({ isOpen }) => (isOpen ? 'calc(50% - 1.5px)' : 'auto')};
`;

const HamburgerLine2 = styled.div`
  ${lineStyles}
  display: ${({ isOpen }) => (isOpen ? 'none' : 'block')};
`;

const HamburgerLine3 = styled.div`
  ${lineStyles}
  transform: ${({ isOpen }) => (isOpen ? 'rotate(-45deg)' : 'rotate(0)')};
  position: ${({ isOpen }) => (isOpen ? 'absolute' : 'static')};
  top: ${({ isOpen }) => (isOpen ? 'calc(50% - 1.5px)' : 'auto')};
`;

const MobileWrap = styled.div`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  font-size: 18px;
  position: fixed;
  background-color: white;
  top: 60px;
  width: 100vw;
  z-index: 3;
  padding: 50px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
`;
const MobileMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  p {
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  }
  a {
    color: #5b5b5b;
    :hover {
      color: #df524d;
    }
  }
`;
const Container = styled.div`
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
  padding: 10px 70px;
  font-size: 20px;
  color: #5b5b5b;
  letter-spacing: 1.5;
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #fff;
`;
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media screen and (max-width: 768px) {
    justify-content: center;
  }
`;
const Logo = styled.div`
  width: 230px;
  height: 63px;
  background-image: url(${logoImg});
  background-size: cover;
  @media screen and (max-width: 768px) {
    height: 40px;
    width: 150px;
  }
`;
const Menu = styled.div`
  display: flex;
  gap: 40px;
  letter-spacing: 2;
  a {
    color: #5b5b5b;
    overflow: visible;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transition: color 0.4s;
    transition: color 0.4s;
  }

  @keyframes eff24-move {
    30% {
      -webkit-transform: translate3d(0, -5px, 0) rotate(5deg);
      transform: translate3d(0, -5px, 0) rotate(5deg);
    }
    50% {
      -webkit-transform: translate3d(0, -3px, 0) rotate(-4deg);
      transform: translate3d(0, -3px, 0) rotate(-4deg);
    }
    80% {
      -webkit-transform: translate3d(0, 0, 0) rotate(-3deg);
      transform: translate3d(0, 0, 0) rotate(-3deg);
    }
    100% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
  }

  a:hover {
    color: #df524d;
    -webkit-animation-name: eff24-move;
    animation-name: eff24-move;
    -webkit-animation-duration: 0.4s;
    animation-duration: 0.4s;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    -webkit-animation-iteration-count: 1;
    animation-iteration-count: 1;
  }
  a:hover {
    color: #df524d;
  }
  @media screen and (max-width: 768px) {
    display: none;
  }
`;
export default Header;
