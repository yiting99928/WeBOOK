import React, { useState, useEffect, useContext } from 'react';
// import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import data from '../../utils/api';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import ProfileStudyGroup from '../../components/ProfileStudyGroup/ProfileStudyGroup';
import {
  HostEditInput,
  GuestEditInput,
} from '../../components/Buttons/Buttons';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      async function getData() {
        const groupData = await data.fetchUserGroup(user.email);
        setGroupData(groupData);
      }
      getData();
    }
  }, [user]);

  const statusText = {
    ongoing: '進行中',
    preparing: '準備中',
    finished: '已結束',
  };

  const ProfileGroupCard = ({ item }) => {
    switch (item.status) {
      case 'preparing':
        return (
          <Buttons>
            <GuestEditInput
              isHost={user.email === item.createBy}
              // onClick={() => handleQuitGroup(item.id)}
            >
              退出讀書會
            </GuestEditInput>
            <HostEditInput
              isHost={user.email === item.createBy}
              // onClick={() => handleDelGroup(item.id)}
            >
              取消讀書會
            </HostEditInput>
            <HostEditInput
              isHost={user.email === item.createBy}
              // onClick={() => navigate(`/study-group/${item.id}/process`)}
              >
              編輯流程
            </HostEditInput>
            <HostEditInput
              isHost={user.email === item.createBy}
              // onClick={() => handleChangeState(item.id)}
            >
              開始讀書會
            </HostEditInput>
          </Buttons>
        );
      // case "ongoing":
      //   return </>;
      // case "finished":
      //   return </>;
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
          <Status>{statusText[item.status]}</Status>
        </StudyGroupCard>
      ))}
    </ProfileStudyGroup>
  );
};
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
  margin-left: auto;
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
