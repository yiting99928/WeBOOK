import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
// import { db } from '../../utils/firebase';
import styled from 'styled-components/macro';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import {
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
} from 'react-icons/md';
function SideMenu() {
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
    <Sidebar isOpen={isOpen}>
      <ArrowIcon>
        {isOpen ? (
          <MdKeyboardDoubleArrowLeft onClick={toggleSidebar} />
        ) : (
          <MdKeyboardDoubleArrowRight onClick={toggleSidebar} />
        )}
      </ArrowIcon>
      {isOpen ? (
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
      ) : (
        <></>
      )}
    </Sidebar>
  );
}
const Sidebar = styled.div`
  width: ${({ isOpen }) => (isOpen ? '200px' : '40px')};
  background-color: #eaeaea;
  transition: all 0.3s ease;
  position: relative;
  background-color: #fee0d4;
`;
const User = styled.div`
  font-weight: 600;
`;
const Logout = styled.div`
  padding-top: 20px;
  border-top: 1px solid #5b5b5b;
`;
const ArrowIcon = styled.div`
  position: absolute;
  right: 12;
  top: 15px;
  svg {
    transform: scale(1.3);
    ${'' /* color: #fff; */}
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
