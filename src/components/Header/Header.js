import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import styled from 'styled-components/macro';
import logoImg from './logo.png';

function Header() {
  const { user } = useContext(AuthContext);
  return (
    <Container>
      <Wrapper>
        <Link to="./">
          <Logo />
        </Link>
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
  );
}
const Container = styled.div`
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
  padding: 18px 0;
`;
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 1300px;
  margin: 0 auto;
  justify-content: space-between;
  font-size: 24px;
  color: #5b5b5b;
  letter-spacing: 1.5;
`;
const Logo = styled.div`
  width: 265px;
  height: 76px;
  background-image: url(${logoImg});
  background-size: cover;
`;
const Menu = styled.ul`
  display: flex;
  gap: 40px;
`;
export default Header;
