import React, { useState, useEffect, useContext } from 'react';
// import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import data from '../../utils/api';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';
import { useNavigate, Link } from 'react-router-dom';
import ProfileStudyGroup from '../../components/ProfileStudyGroup/ProfileStudyGroup';
import {
  HostEditInput,
  GuestEditInput,
} from '../../components/Buttons/Buttons';
import { OutlineBtn } from '../../components/Buttons/Buttons';
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import modal from '../../utils/modal';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();

  async function getData() {
    const groupData = await data.fetchUserGroup(user.email);
    setGroupData(groupData);
  }
  useEffect(() => {
    getData();
  }, []);

  const statusText = {
    ongoing: '進行中',
    preparing: '準備中',
    finished: '已結束',
  };

  async function handleQuitGroup(id) {
    const usersDocRef = doc(db, 'users', user.email);
    const userStudyGroupsRef = collection(usersDocRef, 'userStudyGroups');
    const groupRef = doc(userStudyGroupsRef, id);
    await deleteDoc(groupRef).then(modal.quit('已退出這場讀書會!'));
    getData();
  }

  async function handleDelGroup(id) {
    try {
      await Promise.all([
        deleteAllDocs(id),
        deleteDoc(doc(db, 'studyGroups', id)),
      ]);
      modal.quit('已取消這場讀書會!');
      getData();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteAllDocs(id) {
    const usersQuerySnapshot = await getDocs(collection(db, 'users'));

    for (const userDoc of usersQuerySnapshot.docs) {
      const userStudyGroupsRef = collection(userDoc.ref, 'userStudyGroups');
      const matchingGroupsQuery = query(
        userStudyGroupsRef,
        where('__name__', '==', id)
      );
      const matchingGroupsSnapshot = await getDocs(matchingGroupsQuery);

      for (const matchingGroupDoc of matchingGroupsSnapshot.docs) {
        try {
          await deleteDoc(matchingGroupDoc.ref);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  async function handleChangeState(id) {
    const groupRef = doc(db, 'studyGroups', id);

    try {
      const groupSnapshot = await getDoc(groupRef);
      const groupData = groupSnapshot.data();
      console.log(groupData);

      if (groupData.process === undefined || groupData.process.length === 0) {
        modal.fail('請新增至少一個流程!');
      } else {
        // console.log('有流程');
        updateDoc(groupRef, { status: 'ongoing' });
        getData();
      }
    } catch (error) {
      console.error('Error fetching group data: ', error);
    }
  }

  const ProfileGroupCard = ({ item }) => {
    switch (item.status) {
      case 'preparing':
        return (
          <Buttons>
            <GuestEditInput
              isHost={user.email === item.createBy}
              onClick={() => handleQuitGroup(item.id)}>
              退出讀書會
            </GuestEditInput>
            <HostEditInput
              isHost={user.email === item.createBy}
              onClick={() => handleDelGroup(item.id)}>
              取消讀書會
            </HostEditInput>
            <HostEditInput
              isHost={user.email === item.createBy}
              onClick={() => navigate(`/study-group/${item.id}/process`)}>
              編輯流程
            </HostEditInput>
            <HostEditInput
              isHost={user.email === item.createBy}
              onClick={() => handleChangeState(item.id)}>
              開始讀書會
            </HostEditInput>
          </Buttons>
        );
      case 'ongoing':
        return (
          <Buttons>
            <Link to={`/study-group/${item.id}/live`}>
              <OutlineBtn>進入直播間</OutlineBtn>
            </Link>
          </Buttons>
        );
      case 'finished':
        return (
          <Buttons>
            <OutlineBtn>讀書會筆記</OutlineBtn>
          </Buttons>
        );

      default:
        return null;
    }
  };

  return (
    <ProfileStudyGroup>
      {groupData.map((item, i) => (
        <StudyGroupCard key={i}>
          <BookGroupImg
            src={item.image}
            alt="feature"
            onClick={() => navigate(`/studyGroup/${item.id}`)}
          />
          <CardContent>
            <Title>{item.groupName}</Title>
            <p>書籍：{item.name}</p>
            <Creator>
              導讀者：{item.host}
              <br />
              章節：{item.chapter}
              <br />
              {moment
                .unix(item.startTime.seconds)
                .format('MM-DD hh:mm A')} —{' '}
              {moment.unix(item.endTime.seconds).format('MM-DD hh:mm A')}
            </Creator>
            {<ProfileGroupCard key={i} item={item} />}
          </CardContent>
          <Tag>
            <Status>{statusText[item.status]}</Status>
            <div>即將舉辦</div>
          </Tag>
        </StudyGroupCard>
      ))}
    </ProfileStudyGroup>
  );
};
const Tag = styled.div`
  margin-left: auto;
  display: flex;
  gap: 5px;
  flex-direction: column;
`;
const Title = styled.div`
  font-weight: 600;
  font-size: 28px;
  letter-spacing: 0.05em;
`;
const Buttons = styled.div`
  display: flex;
  gap: 5px;
`;
const Status = styled.div`
  background-color: #df524d;
  padding: 5px 16px;
  color: #fff;
  border-radius: 6px;
`;
const BookGroupImg = styled.img`
  cursor: pointer;
  max-width: 150px;
  object-fit: cover;
`;
const StudyGroupCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 50px;
  padding: 16px 20px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
`;
const Creator = styled.div`
  margin-top: auto;
  line-height: 1.5;
`;
const CardContent = styled.div`
  gap: 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 600px;
`;
export default Profile;
