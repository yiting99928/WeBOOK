import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import styled from 'styled-components/macro';
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
          <HamburgerIcon onClick={handleClick}>
            <HamburgerLine1 isOpen={isOpen} />
            <HamburgerLine2 isOpen={isOpen} />
            <HamburgerLine3 isOpen={isOpen} />
          </HamburgerIcon>
          <Menu>
            <li>
              <Link to={user ? '/create' : '/login'}>創建讀書會</Link>
            </li>
            <li>
              <Link to={`/studyGroups`}>所有讀書會</Link>
            </li>
            <li>
              <Link to={user ? '/profile' : '/login'}>會員</Link>
            </li>
          </Menu>
        </Wrapper>
      </Container>
      <MobileMenuBlack isOpen={isOpen} />
      <MobileWrap isOpen={isOpen}>
        <MobileMenu>
          <li>
            <Link to={user ? '/create' : '/login'}>創建讀書會</Link>
          </li>
          <li>
            <Link to={`/studyGroups`}>所有讀書會</Link>
          </li>
          <li>
            <Link to={user ? '/profile' : '/login'}>會員</Link>
          </li>
        </MobileMenu>
      </MobileWrap>
    </>
  );
}
//-----HamburgerMenu-----//
const HamburgerIcon = styled.div`
  width: 30px;
  height: 20px;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  display: none;
  @media screen and (max-width: 768px) {
    position: fixed;
    z-index: 99;
    display: flex;
    right: 20px;
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
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  @media screen and (max-width: 768px) {
    font-size: 18px;
    ${'' /* display: flex; */}
    position: fixed;
    padding-top: 100px;
    padding-left: 50px;
    background-color: white;
    width: 40%;
    height: 100vh;
    right: 0;
    top: 0;
  }
`;
const MobileMenu = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
const MobileMenuBlack = styled.div`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  @media screen and (max-width: 768px) {
    ${'' /* display: block; */}
    position: fixed;
    background-color: black;
    width: 100%;
    height: 100vh;
    opacity: 0.5;
    right: 0;
    top: 0;
  }
`;
const Container = styled.div`
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
  padding: 20px;
  font-size: 20px;
  color: #5b5b5b;
  letter-spacing: 1.5;
`;
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 1300px;
  margin: 0 auto;
  justify-content: space-between;
`;
const Logo = styled.div`
  width: 230px;
  height: 63px;
  background-image: url(${logoImg});
  background-size: cover;
`;
const Menu = styled.ul`
  display: flex;
  gap: 40px;
  @media screen and (max-width: 768px) {
    display: none;
  }
`;
export default Header;
