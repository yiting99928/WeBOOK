import styled from 'styled-components/macro';
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { getAuth, signOut } from 'firebase/auth';
import {
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
} from 'react-icons/md';

function SideMenu({ children }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const { user, setUser } = useContext(AuthContext);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  function logOut() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log(' Sign-out successful');
      })
      .then(() => {
        setUser(null);
        navigate('/');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <Container>
      <Sidebar isOpen={isOpen}>
        {isOpen ? (
          <SidebarContainer isOpen={isOpen}>
            <ArrowIcon>
              <MdKeyboardDoubleArrowLeft onClick={toggleSidebar} />
            </ArrowIcon>
            <SidebarLinks>
              <User>Hi! {user.name}</User>
              <br />
              <br />
              <Link to={`/profile`}>所有讀書會</Link>
              <Link to={`/profile/ongoing`}>進行中</Link>
              <Link to={`/profile/preparing`}>準備中</Link>
              <Link to={`/profile/finished`}>已結束</Link>
              <br />
              <Logout onClick={logOut}>登出</Logout>
            </SidebarLinks>
          </SidebarContainer>
        ) : (
          <SidebarContainer>
            <ArrowIcon>
              <MdKeyboardDoubleArrowRight onClick={toggleSidebar} />
            </ArrowIcon>
          </SidebarContainer>
        )}
      </Sidebar>
      <Content isOpen={true}>{children}</Content>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  transition: all 0.3s ease;
  margin: 0 auto;
  margin-top: 54px;
  margin-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 960px;
`;
const Sidebar = styled.div`
  width: ${({ isOpen }) => (isOpen ? '200px' : '40px')};
  background-color: #eaeaea;
  transition: all 0.3s ease;
  background-color: #fee0d4;
  position: relative;
`;
const SidebarContainer = styled.div`
  position: fixed;
  width: ${({ isOpen }) => (isOpen ? '200px' : '40px')};
`;
const User = styled.div`
  font-weight: 600;
`;
const Logout = styled.div`
  padding-top: 20px;
  border-top: 1px solid #5b5b5b;
  cursor: pointer;
`;
const ArrowIcon = styled.div`
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 10px;
  svg {
    transform: scale(1.3);
  }
`;
const SidebarLinks = styled.div`
  padding-top: 90px;
  padding-right: 30px;
  padding-left: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
export default SideMenu;
