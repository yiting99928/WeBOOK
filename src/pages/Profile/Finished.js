import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import data from '../../utils/api';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';
import ProfileStudyGroup from '../../components/ProfileStudyGroup/ProfileStudyGroup';
import { useNavigate } from 'react-router-dom';

const Finished = () => {
  const [groupData, setGroupData] = useState([]);
  const { user } = useContext(AuthContext);
  const [expanded, setExpanded] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      const groupData = await data.fetchUserGroup(user.email);
      const finishedData = groupData.filter(
        (item) => item.status === 'finished'
      );
      setGroupData(finishedData);
    }
    getData();
  }, [user]);

  function truncateHTML(htmlString, maxLength) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    const text = div.textContent || div.innerText || '';

    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }
  const toggleExpanded = (index) => {
    setExpanded((prevExpanded) => {
      const newExpanded = [...prevExpanded];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };
  return (
    <ProfileStudyGroup>
      {groupData.length === 0 ? (
        <p>目前沒有結束的讀書會</p>
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
              {item.note && (
                <Post onClick={() => toggleExpanded(i)}>
                  筆記：
                  <div
                    dangerouslySetInnerHTML={{
                      __html: expanded[i]
                        ? item.note
                        : truncateHTML(item.note, 20),
                    }}
                  />
                </Post>
              )}
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
const Post = styled.div`
  line-height: 1.2;
`;
export default Finished;
