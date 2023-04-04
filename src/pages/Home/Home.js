import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <ul>
      <li>
        <Link to={`./create`}>創建讀書會</Link>
      </li>
      <li>
        <Link to={`./studyGroups`}>所有讀書會</Link>
      </li>
      <li>
        <Link to={`./profile`}>會員</Link>
      </li>
    </ul>
  );
}
export default Home;
