import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
// import { db } from '../../utils/firebase';
import styled from 'styled-components/macro';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Sidebar = styled.div`
  width: ${(props) => (props.isOpen ? '200px' : '50px')};
  background-color: #eaeaea;
  transition: all 0.3s ease;
  line-height: 1.5;
  padding: 10px;
`;
const ToggleButton = styled.div`
  color: red;
  border: none;
  cursor: pointer;
`;

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
      <ToggleButton onClick={toggleSidebar}>
        {isOpen ? '收合' : '展開'}
      </ToggleButton>
      <br/>
      <ul>
        <li>會員名稱:{user.name}</li>
        {/* <li>舉辦讀書會:5場</li> */}
        {/* <li>參加讀書會:2場</li> */}
      </ul>
      <br/>
      <ul>
        <Link to={`/profile`}>
          <li>所有讀書會</li>
        </Link>
        <Link to={`/profile/ongoing`}>
          <li>進行中</li>
        </Link>
        <Link to={`/profile/preparing`}>
          <li>準備中</li>
        </Link>
        <Link to={`/profile/finished`}>
          <li>已結束</li>
        </Link>
        <li onClick={logOut}>登出</li>
      </ul>
    </Sidebar>
  );
}
export default SideMenu;
