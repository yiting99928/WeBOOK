import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';

function Home() {
  const { isLogin } = useContext(AuthContext);
  return (
    <ul>
      <li>
        <Link to={`./create`}>創建讀書會</Link>
      </li>
      <li>
        <Link to={`./studyGroups`}>所有讀書會</Link>
      </li>
      <li>
        <Link to={isLogin ? '/profile' : '/login'}>會員</Link>
      </li>
    </ul>
  );
}
export default Home;
