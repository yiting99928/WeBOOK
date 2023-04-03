import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { db } from '../../utils/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  background-color: #f2f2f2;
  transition: all 0.3s ease;
  padding: 20px;
  width: ${(props) => (props.isOpen ? 'calc(100% - 200px)' : '100%')};
`;

const StudyGroupCard = styled.div`
  display: flex;
  border: 1px solid black;
  line-height: 30px;
`;
const BookImg = styled.div`
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  width: 300px;
  height: 300px;
  margin-right: 30px;
`;

const MemberStudyGroup = () => {
  const [groupData, setGroupData] = useState([]);

  useEffect(() => {
    const articlesRef = collection(db, 'studyGroups');
    const unsubscribe = onSnapshot(articlesRef, (querySnapshot) => {
      let groupData = querySnapshot.docs.map((doc) => doc.data());
      //   console.log('所有groupData', groupData);
      setGroupData(groupData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        {groupData.map((item, i) => (
          <StudyGroupCard key={i}>
            <BookImg imageUrl={item.image} />
            <div>
              <p>
                書名:<span>{item.name}</span>
              </p>
              <p>
                作者:<span>{item.author}</span>
              </p>
              <p>
                導讀者:<span>{item.createBy}</span>
              </p>
              <p>
                章節:<span>{item.chapter}</span>
              </p>
              <p>
                創建時間:<span>{item.createTime}</span>
              </p>
              <p>
                舉辦時間:<span>{item.hold}</span>
              </p>
              <p>公告：{item.post}</p>
              <input type="button" value="退出讀書會" />
              <input type="button" value="編輯流程" />
              <input type="button" value="開始讀書會" />
            </div>
          </StudyGroupCard>
        ))}
      </Content>
    </Container>
  );
};
export default MemberStudyGroup;
