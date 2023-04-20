// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom';
// import { AuthContext } from '../../context/authContext';
import styled from 'styled-components/macro';
import bannerImg from './bannerImg.png';
import DecoBg from '../../components/DecoBg';
function Home() {
  // const { user } = useContext(AuthContext);
  return (
    <div>
      <Banner>
        <DecoBg></DecoBg>
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
      <Feature>
        <div></div>
        <div>
          <div>協助導讀的流程</div>
          <div>協助導讀者規劃有趣的讀書流程，讓導讀更輕鬆。</div>
          <div>
            <div>
              <span></span>編輯導讀流程
            </div>
            <div>
              <span></span>線上直播導讀
            </div>
          </div>
        </div>
      </Feature>
    </div>
  );
}
//-----Feature-----//
const Feature = styled.div`
  max-width: 1440;
  margin: 0 auto;
`;
//-----Banner-----//
const SubTitle = styled.div`
  margin-top: 16px;
  font-size: 24px;
  color: #e95f5c;
`;
const Title = styled.div`
  font-weight: 600;
  color: #e95f5c;
  font-size: 42px;
  letter-spacing: 0.05em;
  line-height: 1.2;
`;
const BannerImg = styled.div`
  z-index: 1;
`;
const Banner = styled.div`
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1300;
  margin: 0 auto;
  position: relative;
  justify-content: space-between;
`;
const BannerInfo = styled.div`
  z-index: 1;
`;
export default Home;
