import React, { useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';

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
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useContext(AuthContext);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Sidebar isOpen={isOpen}>
      <ToggleButton onClick={toggleSidebar}>
        {isOpen ? '收合' : '展開'}
      </ToggleButton>
      <ul>
        <li>會員名稱:{user.name}</li>
        <li>舉辦讀書會:5場</li>
        <li>參加讀書會:2場</li>
      </ul>
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
      </ul>
    </Sidebar>
  );
}
export default SideMenu;
