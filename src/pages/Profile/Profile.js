import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components/macro';
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
import webookLogo from './webookLogo.png';
import Loading from '../../components/Loading';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(Array(groupData.length).fill(false));
  const { status } = useParams();
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (groupData.length !== 0) {
      setTimeout(() => setIsLoading(false), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupData]);

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
              onClick={() => navigate(`/studyGroup/${item.id}/process`)}>
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
            <Link to={`/studyGroup/${item.id}/live`}>
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
  // console.log(isLoading);
  return (
    <SideMenu>
      {isLoading && (
        <>
          <LoadingContainer>
            <LoadingImg />
            <LoadingContent>
              <Info height={'56px'} width={'80%'} />
              <Info height={'56px'} width={'60%'} />
              <Info height={'56px'} width={'200px'} />
              <Info height={'25px'} width={'90px'} />
            </LoadingContent>
          </LoadingContainer>
          <LoadingContainer>
            <LoadingImg />
            <LoadingContent>
              <Info height={'56px'} width={'80%'} />
              <Info height={'56px'} width={'60%'} />
              <Info height={'56px'} width={'200px'} />
              <Info height={'25px'} width={'90px'} />
            </LoadingContent>
          </LoadingContainer>
          <LoadingContainer>
            <LoadingImg />
            <LoadingContent>
              <Info height={'56px'} width={'80%'} />
              <Info height={'56px'} width={'60%'} />
              <Info height={'56px'} width={'200px'} />
              <Info height={'25px'} width={'90px'} />
            </LoadingContent>
          </LoadingContainer>
        </>
      )}

      {!isLoading &&
        (groupData.length === 0 ? (
          <NoData>
            <img src={webookLogo} alt="img" />
            此類別目前無讀書會 <br />
            到全部讀書會逛逛吧~
          </NoData>
        ) : (
          groupData.map((item, index) => {
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
                  <ImgContainer>
                    <BookGroupImg
                      src={item.image}
                      alt="feature"
                      onClick={() => navigate(`/studyGroup/${item.id}`)}
                    />
                  </ImgContainer>
                  <CardContent>
                    <Title>{item.groupName}</Title>
                    <BookName>{item.name}</BookName>
                    <Creator>
                      導讀人：{item.host}
                      <br />
                      章節：{item.chapter}
                      <br />
                      時間：
                      {moment
                        .unix(item.startTime.seconds)
                        .format('MM.DD HH:mm')}{' '}
                      —{' '}
                      {moment.unix(item.endTime.seconds).format('MM.DD HH:mm')}
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
                    {item.note ? (
                      parse(item.note, { replace })
                    ) : (
                      <NoNote>無讀書會筆記</NoNote>
                    )}
                  </Note>
                )}
              </StudyGroupCard>
            );
          })
        ))}
    </SideMenu>
  );
};

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

const Pulse = styled.div`
  animation: ${pulse} 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 248px;
  display: flex;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1.5px solid #ececec;
  align-self: flex-start;
`;

const LoadingImg = styled(Pulse)`
  width: 150px;
  margin-right: 50px;
  background-color: #ececec;
`;

const LoadingContent = styled.div`
  gap: 10px;
  display: flex;
  flex-direction: column;
  width: 600px;
`;
const Info = styled(Pulse)`
  height: ${({ height }) => height};
  width: ${({ width }) => width};
  background-color: #ececec;
  border-radius: 25px;
`;
const NoNote = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;
const NoData = styled.div`
  text-align: center;
  line-height: 1.5;
  font-size: 20px;
  margin: 0 auto;
  img {
    width: 200px;
    height: 200px;
  }
`;
const Note = styled.div`
  border-top: 1px solid #b5b5b5;
  padding-top: 15px;
  line-height: 1.3;
`;
const BookName = styled.div`
  font-size: 28px;
  letter-spacing: 1.5;
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
  letter-spacing: 1.5;
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

const ImgContainer = styled.div`
  overflow: hidden;
`;
const BookGroupImg = styled.img`
  width: 150px;
  height: 210px;
  object-fit: cover;
  cursor: pointer;
  :hover {
    transform: scale(1.15);
  }
`;
const GroupInfo = styled.div`
  display: flex;
  gap: 50px;
  padding-bottom: ${({ expanded }) => (expanded ? '30px' : '0px')};
`;
const StudyGroupCard = styled.div`
  padding: 16px 20px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 100%;
`;
const Creator = styled.div`
  margin-top: auto;
  font-size: 14px;
  line-height: 1.5;
`;
const CardContent = styled.div`
  gap: 10px;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  color: #5b5b5b;
`;
export default Profile;
