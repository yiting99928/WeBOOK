import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import DecoBg from '../../components/DecoBg';
import GroupsLoading from '../../components/GroupsLoading';
import StudyGroupCard from '../../components/StudyGroupCard';
import data from '../../utils/firebase';
import BannerSection from './BannerSection';
import FeatureSection from './FeatureSection';

function Home() {
  const [allGroupsData, setAllGroupsData] = useState([]);

  useEffect(() => {
    async function getData() {
      const groups = await data.getGroupsData();

      const now = dayjs();

      const unfinishedGroups = [];
      for (const group of groups) {
        if (
          dayjs(group.endTime.toDate()).isBefore(now) &&
          group.status !== 'ongoing'
        ) {
          await data.updateDocument(group.id, 'studyGroups', {
            status: 'finished',
          });
        } else if (group.status !== 'finished') {
          unfinishedGroups.push(group);
        }
      }

      const sortedGroups = unfinishedGroups.sort(
        (a, b) => b.createTime.seconds - a.createTime.seconds
      );
      const latestFourGroups = sortedGroups.slice(0, 4);

      setAllGroupsData(latestFourGroups);
      return latestFourGroups;
    }
    getData();
  }, []);

  return (
    <div>
      <DecoBg />
      <BannerSection />
      <FeatureSection />
      <Recommended>
        <RecommendedTitle>最新成立的讀書會</RecommendedTitle>
        <BookGroupWrap>
          {allGroupsData.length === 0 ? (
            <>
              <GroupsLoading />
              <GroupsLoading />
              <GroupsLoading />
              <GroupsLoading />
            </>
          ) : (
            allGroupsData.map((item, index) => (
              <StudyGroupCard item={item} key={index} />
            ))
          )}
        </BookGroupWrap>
      </Recommended>
      <FooterBottom />
    </div>
  );
}

const RecommendedTitle = styled.div`
  text-align: center;
  color: #df524d;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 10px;
  @media screen and (max-width: 768px) {
    font-size: 30px;
  }
`;
const BookGroupWrap = styled.div`
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 23px;
  margin-top: 40px;
  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media screen and (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 0px 20px;
  }
  @media screen and (max-width: 375px) {
    grid-template-columns: repeat(1, 1fr);
    padding: 0px 40px;
  }
`;
const Recommended = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  margin-bottom: 110px;
  padding: 0 20px;
  overflow: hidden;
  @media screen and (max-width: 768px) {
    margin-bottom: 50px;
  }
`;
const FooterBottom = styled.div`
  height: 60px;
`;
export default Home;
