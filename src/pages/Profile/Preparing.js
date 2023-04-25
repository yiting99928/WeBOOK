import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { db } from '../../utils/firebase';
import {
  doc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import data from '../../utils/data';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';

const Preparing = () => {
  const [groupData, setGroupData] = useState([]);
  const { user } = useContext(AuthContext);
  const [expanded, setExpanded] = useState([]);

  async function getData() {
    const groupData = await data.loadGroupData(user.email);
    const preparingData = groupData.filter(
      (item) => item.status === 'preparing'
    );
    setGroupData(preparingData);
  }

  useEffect(() => {
    getData();
  }, [user]);

  async function handleChangeState(item) {
    const groupRef = doc(db, 'studyGroups', item.id);

    try {
      const groupSnapshot = await getDoc(groupRef);
      const groupData = groupSnapshot.data();

      if (groupData.process && groupData.process.length === 0) {
        alert('請新增至少一個流程!');
      } else {
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
    await deleteDoc(groupRef).then(alert('已退出讀書會'));
    getData();
  }

  async function handleDelGroup(id) {
    try {
      await Promise.all([
        deleteAllDocs(id),
        deleteDoc(doc(db, 'studyGroups', id)),
      ]);
      alert('取消讀書會');
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

  const toggleExpanded = (index) => {
    setExpanded((prevExpanded) => {
      const newExpanded = [...prevExpanded];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };
  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        {groupData.length === 0 ? (
          <p>目前沒有參加的讀書會</p>
        ) : (
          groupData.map((item, i) => (
            <StudyGroupCard key={i}>
              <BookGroupImg>
                <img src={item.image} alt="feature" />
              </BookGroupImg>
              <CardContent>
                <Title>{item.name}</Title>
                <p>作者:{item.author}</p>
                <Creator>
                  導讀者:{item.createBy}
                  <br />
                  章節:{item.chapter}
                  <br />
                  舉辦時間:
                  {moment.unix(item.hold.seconds).format('YYYY,MM,DD hh:mm A')}
                </Creator>
                <Post onClick={() => toggleExpanded(i)}>
                  讀書會公告
                  <br />
                  {expanded[i]
                    ? item.post
                    : item.post.slice(0, 20) +
                      (item.post.length > 20 ? '...' : '')}
                </Post>
                <Buttons>
                  <UserEditInput
                    type="button"
                    value="退出讀書會"
                    isHost={user.email === item.createBy}
                    onClick={() => handleQuitGroup(item.id)}
                  />
                  <HostEditInput
                    type="button"
                    value="取消讀書會"
                    isHost={user.email === item.createBy}
                    onClick={() => handleDelGroup(item.id)}
                  />
                  <div>
                    <Link to={`/study-group/${item.id}/process`}>
                      <HostEditInput
                        type="button"
                        value="編輯流程"
                        isHost={user.email === item.createBy}
                      />
                    </Link>
                  </div>
                  <HostEditInput
                    type="button"
                    value="開始讀書會"
                    isHost={user.email === item.createBy}
                    onClick={() => handleChangeState(item)}
                  />
                </Buttons>
              </CardContent>
            </StudyGroupCard>
          ))
        )}
      </Content>
    </Container>
  );
};
const Buttons = styled.div`
  display: flex;
  gap: 5px;
`;
const GroupButton = styled.input`
  background-color: #ececec;
  border-radius: 5px;
  width: 86px;
  height: 32px;
`;
const Post = styled.div`
  line-height: 1.2;
`;
const Title = styled.div`
  font-weight: 600;
  font-size: 32px;
  letter-spacing: 0.05em;
`;

const BookGroupImg = styled.div`
  max-width: 180px;
`;
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  transition: all 0.3s ease;
  margin: 0 auto;
  margin-top: 54px;
  margin-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 960px;
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

const UserEditInput = styled(GroupButton)`
  display: ${({ isHost }) => (isHost ? 'none' : 'inline-block')};
`;
const HostEditInput = styled(GroupButton)`
  display: ${({ isHost }) => (isHost ? 'inline-block' : 'none')};
`;

export default Preparing;
