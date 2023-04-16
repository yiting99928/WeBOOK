import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import styled from 'styled-components/macro';

function Header() {
  const { user } = useContext(AuthContext);
  return (
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
  );
}
const Menu = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: #f5f5f5;
  height: 50px;
`;
export default Header;
