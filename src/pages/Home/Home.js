import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';

function Home() {
  const { user } = useContext(AuthContext);
  return (
    <ul>
      <li>
        <Link to={user ? '/create' : '/login'}>創建讀書會</Link>
      </li>
      <li>
        <Link to={`/studyGroups`}>所有讀書會</Link>
      </li>
      <li>
        <Link to={user ? '/profile' : '/login'}>會員</Link>
      </li>
    </ul>
  );
}
export default Home;
