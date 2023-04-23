import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { Link } from 'react-router-dom';
import data from '../../utils/data';
import { AuthContext } from '../../context/authContext';

const Ongoing = () => {
  const [groupData, setGroupData] = useState([]);
  const { user } = useContext(AuthContext);
  const [expanded, setExpanded] = useState([]);

  useEffect(() => {
    async function getData() {
      const groupData = await data.loadGroupData(user.email);
      const finishedData = groupData.filter(
        (item) => item.status === 'ongoing'
      );
      setGroupData(finishedData);
    }
    getData();
  }, [user]);

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
          <p>目前沒有進行中的讀書會</p>
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
                  舉辦時間:{item.hold}
                </Creator>
                <Post onClick={() => toggleExpanded(i)}>
                  讀書會公告
                  <br />
                  {expanded[i]
                    ? item.post
                    : item.post.slice(0, 20) +
                      (item.post.length > 20 ? '...' : '')}
                </Post>
                <div>
                  <Link to={`/study-group/${item.id}/live`}>
                    <GroupButton type="button" value="進入直播間" />
                  </Link>
                </div>
              </CardContent>
            </StudyGroupCard>
          ))
        )}
      </Content>
    </Container>
  );
};
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
  ${'' /* margin-left: 30px; */}
  ${'' /* margin-right: 30px; */}
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
export default Ongoing;
