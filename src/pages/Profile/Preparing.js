import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { db } from '../../utils/firebase';
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
import { useNavigate } from 'react-router-dom';
import data from '../../utils/api';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';
import modal from '../../utils/modal';
import ProfileStudyGroup from '../../components/ProfileStudyGroup/ProfileStudyGroup';
import {
  HostEditInput,
  GuestEditInput,
} from '../../components/Buttons/Buttons';

const Preparing = () => {
  const [groupData, setGroupData] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  async function getData() {
    const groupData = await data.fetchUserGroup(user.email);
    const preparingData = groupData.filter(
      (item) => item.status === 'preparing'
    );
    setGroupData(preparingData);
  }

  useEffect(() => {
    getData();
  }, [user]);

  async function handleChangeState(id) {
    const groupRef = doc(db, 'studyGroups', id);

    try {
      const groupSnapshot = await getDoc(groupRef);
      const groupData = groupSnapshot.data();
      console.log(groupData);

      if (groupData.process === undefined || groupData.process.length === 0) {
        modal.fail('請新增至少一個流程!');
      } else {
        console.log('有流程');
        updateDoc(groupRef, { status: 'ongoing' });
        getData();
      }
    } catch (error) {
      console.error('Error fetching group data: ', error);
    }
  }

  async function handleQuitGroup(id) {
    // console.log(id);
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

  return (
    <ProfileStudyGroup>
      {/* <Already>
        3 <span> 天內舉辦</span>
      </Already> */}
      {groupData.length === 0 ? (
        <p>目前沒有參加的讀書會</p>
      ) : (
        groupData.map((item, i) => (
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
                導讀者：{item.createBy}
                <br />
                章節：{item.chapter}
                <br />
                {moment
                  .unix(item.startTime.seconds)
                  .format('MM-DD hh:mm A')} —{' '}
                {moment.unix(item.endTime.seconds).format('MM-DD hh:mm A')}
              </Creator>
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
            </CardContent>
          </StudyGroupCard>
        ))
      )}
    </ProfileStudyGroup>
  );
};
const Title = styled.div`
  font-weight: 600;
  font-size: 28px;
  letter-spacing: 0.05em;
`;
const BookGroupImg = styled.img`
  max-width: 150px;
  object-fit: cover;
  cursor: pointer;
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

const Buttons = styled.div`
  display: flex;
  gap: 5px;
`;

export default Preparing;
