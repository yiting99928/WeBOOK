// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom';
// import { AuthContext } from '../../context/authContext';
import styled from 'styled-components/macro';

function Home() {
  // const { user } = useContext(AuthContext);
  return (
    <div>
      <Container>這裡之後會隨機出現一些讀書會</Container>;
    </div>
  );
}
const Container = styled.div`
  max-width: 1440;
  margin: 0 auto;
`;
export default Home;
