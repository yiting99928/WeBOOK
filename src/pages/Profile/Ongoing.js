import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import data from '../../utils/api';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';
import ProfileStudyGroup from '../../components/ProfileStudyGroup/ProfileStudyGroup';
// import { OutlineBtn } from '../../components/Buttons/Buttons';

const Ongoing = () => {
  const [groupData, setGroupData] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      const groupData = await data.fetchUserGroup(user.email);
      const finishedData = groupData.filter(
        (item) => item.status === 'ongoing'
      );
      setGroupData(finishedData);
    }
    getData();
  }, [user]);

  return (
    <ProfileStudyGroup>
      {groupData.length === 0 ? (
        <p>目前沒有進行中的讀書會</p>
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
              <div>
                <Link to={`/study-group/${item.id}/live`}>
                  <GroupButton type="button" value="進入直播間" />
                </Link>
              </div>
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

const GroupButton = styled.input`
  background-color: #ececec;
  border-radius: 5px;
  width: 86px;
  height: 32px;
`;

export default Ongoing;
