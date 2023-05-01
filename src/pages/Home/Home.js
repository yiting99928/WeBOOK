import styled from 'styled-components/macro';
import bannerImg from './bannerImg.png';
import DecoBg from '../../components/DecoBg';
import { RiLiveLine } from 'react-icons/ri';
import { AiOutlineEdit, AiOutlineQuestionCircle } from 'react-icons/ai';
import { BsBook, BsSticky, BsChatLeftDots } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';
import { VscSave } from 'react-icons/vsc';
import React, { useState, useEffect, useContext } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import StudyGroupCard from '../../components/StudyGroupCard';
import { AuthContext } from '../../context/authContext';
import modal from '../../utils/modal';
import edit from './edit.mp4';
import live from './live.mp4';
import note from './note.mp4';

function Home() {
  const [allGroupsData, setAllGroupsData] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function getData() {
      const StudyGroupsData = collection(db, 'studyGroups');
      const groupsSnapshot = await getDocs(StudyGroupsData);
      const groups = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const now = new Date();

      // 找到時間超過的讀書會更新為 finished 其餘的放到 unfinishedGroups
      const unfinishedGroups = [];
      for (const group of groups) {
        if (group.endTime.toDate() <= now && group.status !== 'ongoing') {
          await updateDoc(doc(db, 'studyGroups', group.id), {
            status: 'finished',
          });
        } else if (group.status !== 'finished') {
          unfinishedGroups.push(group);
        }
      }

      // 依照 createTime 排序找到新的
      const sortedGroups = unfinishedGroups.sort(
        (a, b) => b.createTime.seconds - a.createTime.seconds
      );
      const latestFourGroups = sortedGroups.slice(0, 4);

      setAllGroupsData(latestFourGroups);
      return latestFourGroups;
    }
    getData();
  }, []);

  const handleJoinGroup = async (id) => {
    if (user) {
      const userGroupRef = doc(db, 'users', user.email, 'userStudyGroups', id);
      await setDoc(userGroupRef, { note: '' }).then(
        modal.success('已加入讀書會!')
      );
    } else {
      modal.noUser('請先登入再創辦讀書會唷!');
    }
  };

  return (
    <div>
      <DecoBg />
      <Banner>
        <BannerInfo>
          <Title>
            走進書適圈
            <br />
            找到你的閱讀舒適圈
          </Title>
          <SubTitle>Cozy up with books!</SubTitle>
        </BannerInfo>
        <BannerImg src={bannerImg} alt="banner" />
      </Banner>
      <Features>
        <FeatureWrap>
          <FeatureImg>
            <FeatureDeco />
            <Video
              loop
              playsInline
              autoPlay
              muted
              src={edit}
              type="video/mp4"
              controls={false}
            />
          </FeatureImg>
          <Feature>
            <FeatureTitle>協助導讀的流程</FeatureTitle>
            <FeatureDescription>
              協助導讀者規劃有趣的讀書流程，讓導讀更輕鬆。
            </FeatureDescription>
            <FeaturePoints>
              <FeaturePoint>
                <AiOutlineEdit />
                <p>編輯導讀流程</p>
              </FeaturePoint>
              <FeaturePoint>
                <RiLiveLine />
                <p>線上直播導讀</p>
              </FeaturePoint>
            </FeaturePoints>
          </Feature>
        </FeatureWrap>
        <FeatureWrap>
          <FeatureImg>
            <FeatureDeco />
            <Video
              loop
              playsInline
              autoPlay
              muted
              src={live}
              type="video/mp4"
              controls={false}
            />
          </FeatureImg>
          <FeatureReversed>
            <FeatureTitle>有趣的讀書會互動</FeatureTitle>
            <FeatureDescription>
              互動元素，導讀過程變得生動有趣。
            </FeatureDescription>
            <FeaturePoints>
              <FeaturePoint>
                <BsBook />
                <p>導讀講稿分享</p>
              </FeaturePoint>
              <FeaturePoint>
                <AiOutlineQuestionCircle />
                <p>QA問答</p>
              </FeaturePoint>
              <FeaturePoint>
                <MdHowToVote />
                <p>問題票選</p>
              </FeaturePoint>
              <FeaturePoint>
                <BsSticky />
                <p>便利貼分享</p>
              </FeaturePoint>
            </FeaturePoints>
          </FeatureReversed>
        </FeatureWrap>
        <FeatureWrap>
          <FeatureImg>
            <FeatureDeco />
            <Video
              loop
              playsInline
              autoPlay
              muted
              src={note}
              type="video/mp4"
              controls={false}
            />
          </FeatureImg>
          <Feature>
            <FeatureTitle>讀書會的文字紀錄</FeatureTitle>
            <FeatureDescription>
              導讀過程聊天室互動、紀錄筆記功能，讓你能夠與他人討論，也紀錄精彩的讀書會過程留存。
            </FeatureDescription>
            <FeaturePoints>
              <FeaturePoint>
                <BsChatLeftDots />
                <p>與其他參與者聊天室互動</p>
              </FeaturePoint>
              <FeaturePoint>
                <VscSave />
                <p>留存讀書會筆記</p>
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
            allGroupsData.map((item, index) => (
              <StudyGroupCard
                item={item}
                key={index}
                onJoinGroup={handleJoinGroup}
              />
            ))
          )}
        </BookGroupWrap>
      </Recommended>
      <FooterBottom />
    </div>
  );
}
const Video = styled.video`
  width: 100%;
  border-radius: 6px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid white;
`;
const RecommendedTitle = styled.div`
  text-align: center;
  color: #df524d;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 10px;
`;
const BookGroupWrap = styled.div`
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 23px;
  margin-top: 40px;
  margin-bottom: 50px;
`;
const Recommended = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  margin-bottom: 110px;
  overflow: hidden;
`;
const FooterBottom = styled.div`
  height: 60px;
`;

//-----Feature-----//
const Features = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  letter-spacing: 0.05em;
  display: flex;
  flex-direction: column;
  margin-bottom: 180px;
  height: 1300px;
  justify-content: space-between;
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
`;
const FeatureReversed = styled(Feature)`
  order: -1;
`;
const FeatureDeco = styled.div`
  width: 450px;
  height: 400px;
  background-color: rgba(239, 140, 138, 0.1);
  position: absolute;
  z-index: -1;
  filter: blur(60px);
`;
const FeatureImg = styled.div`
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  :hover ${FeatureDeco} {
    background-color: rgba(239, 140, 138, 0.3);
  }
`;
const FeatureTitle = styled.div`
  color: #df524d;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 1.5;
`;
const FeatureDescription = styled.div`
  line-height: 1.5;
  color: #5b5b5b;
  font-size: 20px;
`;
const FeaturePoints = styled.div`
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const FeaturePoint = styled.div`
  font-size: 20px;
  color: #5b5b5b;
  display: flex;
  align-items: center;
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
  letter-spacing: 1.5;
  line-height: 1.5;
`;
const BannerImg = styled.img`
  z-index: 1;
  max-width: 712px;
`;
const Banner = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  justify-content: space-between;
`;
const BannerInfo = styled.div`
  padding-left: 20px;
  z-index: 1;
  align-items: center;
`;
export default Home;
