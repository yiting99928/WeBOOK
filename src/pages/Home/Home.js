import styled from 'styled-components/macro';
import bannerImg from './bannerImg.png';
import editProcess from './editProcess.png';
import live from './live.png';
import note from './note.png';
import DecoBg from '../../components/DecoBg';
import { RiLiveLine } from 'react-icons/ri';
import { AiOutlineEdit, AiOutlineQuestionCircle } from 'react-icons/ai';
import { BsBook, BsSticky, BsChatLeftDots } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';
import { VscSave } from 'react-icons/vsc';
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import moment from 'moment';

function Home() {
  const [allGroupsData, setAllGroupsData] = useState([]);
  useEffect(() => {
    async function getData() {
      const StudyGroupsData = collection(db, 'studyGroups');
      const groupsSnapshot = await getDocs(StudyGroupsData);
      const groups = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const sortedGroups = groups.sort(
        (a, b) => b.createTime.seconds - a.createTime.seconds
      );
      const latestFourGroups = sortedGroups.slice(0, 4);
      console.log(latestFourGroups);
      setAllGroupsData(latestFourGroups);
      return latestFourGroups;
    }
    getData();
  }, []);
  // console.log('allGroupsData', allGroupsData);
  return (
    <div>
      <Banner>
        <DecoBg />
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
      <Features>
        <FeatureWrap>
          <FeatureImg>
            <FeatureDeco />
            <img src={editProcess} alt="feature" />
          </FeatureImg>
          <Feature>
            <FeatureTitle>協助導讀的流程</FeatureTitle>
            <FeatureDescription>
              協助導讀者規劃有趣的讀書流程，讓導讀更輕鬆。
            </FeatureDescription>
            <FeaturePoints>
              <FeaturePoint>
                <RiLiveLine />
                編輯導讀流程
              </FeaturePoint>
              <FeaturePoint>
                <AiOutlineEdit />
                線上直播導讀
              </FeaturePoint>
            </FeaturePoints>
          </Feature>
        </FeatureWrap>
        <FeatureWrap>
          <Feature>
            <FeatureTitle>有趣的讀書會互動</FeatureTitle>
            <FeatureDescription>
              互動元素，導讀過程變得生動有趣。
            </FeatureDescription>
            <FeaturePoints>
              <FeaturePoint>
                <BsBook />
                導讀講稿分享
              </FeaturePoint>
              <FeaturePoint>
                <AiOutlineQuestionCircle />
                QA問答
              </FeaturePoint>
              <FeaturePoint>
                <MdHowToVote />
                問題票選
              </FeaturePoint>
              <FeaturePoint>
                <BsSticky />
                便利貼分享
              </FeaturePoint>
            </FeaturePoints>
          </Feature>
          <FeatureImg>
            <FeatureDeco />
            <img src={live} alt="feature" />
          </FeatureImg>
        </FeatureWrap>
        <FeatureWrap>
          <FeatureImg>
            <FeatureDeco />
            <img src={note} alt="feature" />
          </FeatureImg>
          <Feature>
            <FeatureTitle>讀書會的文字紀錄</FeatureTitle>
            <FeatureDescription>
              導讀過程聊天室互動、紀錄筆記功能，讓你能夠與他人討論，也紀錄精彩的讀書會過程留存。
            </FeatureDescription>
            <FeaturePoints>
              <FeaturePoint>
                <BsChatLeftDots />
                與其他參與者聊天室互動
              </FeaturePoint>
              <FeaturePoint>
                <VscSave />
                留存讀書會筆記
              </FeaturePoint>
            </FeaturePoints>
          </Feature>
        </FeatureWrap>
      </Features>
      <Recommended>
        <RecommendedTitle>最新成立的讀書會</RecommendedTitle>
        <BookGroupWrap>
          {allGroupsData.length === 0 ? (
            <></>
          ) : (
            allGroupsData.map((item) => (
              <BookGroup>
                <BookGroupImg>
                  <img src={item.image} alt="feature" />
                </BookGroupImg>
                <BookGroupInfo>
                  <BookTitle>{item.name}</BookTitle>
                  <BookAuthor>{item.author}</BookAuthor>
                  <Creator>
                    舉辦時間： {moment
                        .unix(item.hold.seconds)
                        .format('YYYY,MM,DD hh:mm A')} <br />
                    導讀人：{item.host}
                  </Creator>
                  <GroupButton>加入讀書會</GroupButton>
                </BookGroupInfo>
              </BookGroup>
            ))
          )}
        </BookGroupWrap>
      </Recommended>
      <FooterBottom />
    </div>
  );
}
const GroupButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  background: #ffac4c;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  letter-spacing: 1.2;
  font-size: 18px;
  margin-top: 8px;
`;
const BookTitle = styled.div`
  padding-bottom: 4px;
  font-weight: 600;
  font-size: 20px;
`;
const BookAuthor = styled.div`
  color: #5b5b5b;
  padding-top: 6px;
  font-size: 14px;
`;
const Creator = styled.div`
  font-size: 16px;
  margin-top: auto;
  line-height: 1.3;
`;
const RecommendedTitle = styled.div`
  text-align: center;
  color: #df524d;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 10px;
`;
const BookGroupWrap = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 65px;
`;
const BookGroupImg = styled.div`
  width: 280px;
`;
const BookGroupInfo = styled.div`
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 15px;
`;
const BookGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 280px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #ececec;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;
const Recommended = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 110px;
  overflow: hidden;
`;
const FooterBottom = styled.div`
  height: 60px;
`;

//-----Feature-----//
const Features = styled.div`
  max-width: 1200px;
  margin: 80px auto;
  letter-spacing: 0.05em;
  display: flex;
  flex-direction: column;
  gap: 50px;
  margin-bottom: 150px;
`;
const FeatureWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  gap: 60px;
`;
const Feature = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 480px;
  line-height: 1.2;
`;
const FeatureImg = styled.div`
  max-width: 500px;
  display: flex;
  align-items: center;
`;
const FeatureDeco = styled.div`
  width: 500px;
  height: 450px;
  background-color: rgba(239, 140, 138, 0.1);
  position: absolute;
  z-index: -1;
  filter: blur(100px);
`;
const FeatureTitle = styled.div`
  color: #df524d;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 10px;
`;
const FeatureDescription = styled.div`
  color: #5b5b5b;
  font-size: 20px;
`;
const FeaturePoints = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const FeaturePoint = styled.div`
  font-size: 20px;
  color: #5b5b5b;
  display: flex;
  gap: 10px;
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
  max-width: 712px;
`;
const Banner = styled.div`
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1300px;
  margin: 0 auto;
  position: relative;
  justify-content: space-between;
  padding-left: 30px;
`;
const BannerInfo = styled.div`
  z-index: 1;
`;
export default Home;
