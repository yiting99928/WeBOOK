import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { db } from '../../utils/firebase';
import { collection, onSnapshot } from 'firebase/firestore';


const Profile = () => {
  const [groupData, setGroupData] = useState([]);
  useEffect(() => {
    const groupsRef = collection(db, 'studyGroups');
    const unsubscribe = onSnapshot(groupsRef, (querySnapshot) => {
      let groups = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroupData(groups);
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
            <CardContent>
              <p>{item.status}</p>
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
            </CardContent>
          </StudyGroupCard>
        ))}
      </Content>
    </Container>
  );
};
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  transition: all 0.3s ease;
  padding: 20px;
  width: ${(props) => (props.isOpen ? 'calc(100% - 200px)' : '100%')};
`;

const StudyGroupCard = styled.div`
  display: flex;
  border: 1px solid black;
  line-height: 15px;
`;
const BookImg = styled.div`
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  width: 300px;
  height: 300px;
  margin-right: 30px;
`;
const CardContent = styled.div`
  width: 800px;
`;
export default Profile;
