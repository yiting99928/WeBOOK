import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import data from '../../utils/api';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';
import { useNavigate, Link } from 'react-router-dom';
import SideMenu from '../../components/SideMenu';
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
import parse, { domToReact } from 'html-react-parser';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(Array(groupData.length).fill(false));
  const { status } = useParams();

  async function getData() {
    const groupData = await data.fetchUserGroup(user.email);
    let filteredData;
    if (!status) {
      const finishedGroups = groupData.filter(
        (group) => group.status === 'finished'
      );
      const otherGroups = groupData.filter(
        (group) => group.status !== 'finished'
      );
      filteredData = [...otherGroups, ...finishedGroups];
    } else {
      filteredData = groupData.filter((item) => item.status === status);
    }
    setGroupData(filteredData);
  }

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const statusText = {
    ongoing: { type: '進行中', color: '#DF524D' },
    preparing: { type: '準備中', color: '#F89D7D' },
    finished: { type: '已結束', color: '#FAC6B8' },
    upcoming: { type: '即將舉辦', color: '#DF524D' },
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

  function handleExpanded(index) {
    setExpanded((prevExpanded) => {
      const newExpanded = [...prevExpanded];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  }
  const ProfileGroupCard = ({ item, index }) => {
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
            <OutlineBtn onClick={() => handleExpanded(index)}>
              讀書會筆記
            </OutlineBtn>
          </Buttons>
        );

      default:
        return null;
    }
  };
  const replace = (node) => {
    if (node.attribs && node.attribs.contenteditable) {
      delete node.attribs.contenteditable;
      return (
        <node.name {...node.attribs}>
          {domToReact(node.children, { replace })}
        </node.name>
      );
    }
  };
  return (
    <SideMenu>
      {groupData.map((item, index) => {
        const currentTime = moment().unix();
        const threeDaysLater = moment().add(3, 'days').unix();
        const startTime = item.startTime.seconds;
        const isUpcoming =
          startTime >= currentTime &&
          startTime <= threeDaysLater &&
          item.status !== 'ongoing';
        return (
          <StudyGroupCard key={index}>
            <GroupInfo expanded={expanded[index]}>
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
                    .format('MM-DD hh:mm A')}{' '}
                  — {moment.unix(item.endTime.seconds).format('MM-DD hh:mm A')}
                </Creator>
                {<ProfileGroupCard index={index} item={item} />}
              </CardContent>
              <Tag>
                <Status
                  statusColor={statusText[item.status].color}
                  onClick={() => navigate(`/profile/${item.status}`)}>
                  {statusText[item.status].type}
                </Status>
                {isUpcoming && (
                  <Status statusColor={statusText.upcoming.color}>
                    {statusText.upcoming.type}
                  </Status>
                )}
              </Tag>
            </GroupInfo>
            {expanded[index] && (
              <Note>
                <br />
                {parse(item.note, { replace })}
              </Note>
            )}
          </StudyGroupCard>
        );
      })}
    </SideMenu>
  );
};
const Note = styled.div`
  border-top: 1px solid #b5b5b5;
  padding-top: 15px;
  line-height: 1.3;
`;

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
  text-align: center;
  background-color: ${({ statusColor }) => statusColor};
  color: #fff;
  border-radius: 6px;
  padding: 5px 0px;
  width: 95px;
  cursor: pointer;
  letter-spacing: 1.3;
`;
const BookGroupImg = styled.img`
  cursor: pointer;
  max-width: 150px;
  object-fit: cover;
`;
const GroupInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 50px;
  padding-bottom: ${({ expanded }) => (expanded ? '30px' : '0px')};
`;
const StudyGroupCard = styled.div`
  display: flex;
  flex-direction: column;
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
