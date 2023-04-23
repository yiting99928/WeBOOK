import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import data from '../../utils/data';
import { AuthContext } from '../../context/authContext';

const Finished = () => {
  const [groupData, setGroupData] = useState([]);
  const { user } = useContext(AuthContext);
  const [expanded, setExpanded] = useState([]);

  useEffect(() => {
    async function getData() {
      const groupData = await data.loadGroupData(user.email);
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
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        {groupData.length === 0 ? (
          <p>目前沒有結束的讀書會</p>
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
                  筆記：
                  <div
                    dangerouslySetInnerHTML={{
                      __html: expanded[i]
                        ? item.note
                        : truncateHTML(item.note, 20),
                    }}
                  />
                </Post>
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
export default Finished;
