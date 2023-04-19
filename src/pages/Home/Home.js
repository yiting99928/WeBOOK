// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom';
// import { AuthContext } from '../../context/authContext';
import styled from 'styled-components/macro';
import bannerImg from './bannerImg.png';

function Home() {
  // const { user } = useContext(AuthContext);
  return (
    <div>
      <Container>
        <Banner>
          <BannerInfo>
            <Title>
              走進書適圈
              <br />
              找到你的閱讀舒適圈
            </Title>
            <SubTitle>Cozy up with books!</SubTitle>
          </BannerInfo>
          <BannerImg>
            <img src={bannerImg} alt="banner" />
          </BannerImg>
        </Banner>
      </Container>
      ;
    </div>
  );
}
const BackgroundColor1 = styled.div`
  width: 500px;
  height: 500px;

  background: rgba(239, 140, 138, 0.3);
  filter: blur(100px);
`;
const BackgroundColor2 = styled.div`
  width: 140px;
  height: 140px;

  background: rgba(231, 93, 16, 0.3);
  filter: blur(75px);
`;
const BackgroundColor3 = styled.div`
  width: 300px;
  height: 300px;

  background: rgba(96, 160, 255, 0.3);
  filter: blur(100px);
`;
const BackgroundColor4 = styled.div`
  width: 350px;
  height: 350px;

  background: rgba(255, 172, 76, 0.3);
  filter: blur(100px);
`;

const SubTitle = styled.div`
  margin-top: 16px;
  font-size: 24px;
  color: #e95f5c;
`;
const Title = styled.div`
  font-weight: 600;
  color: #e95f5c;
  font-size: 46px;
  letter-spacing: 0.05em;
  line-height: 1.2;
`;
const BannerImg = styled.div`
  padding: 30px;
`;
const Background = styled.div``;
const Container = styled.div`
  max-width: 1440;
  margin: 0 auto;
`;
const Banner = styled.div`
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px;
`;
const BannerInfo = styled.div``;
export default Home;
