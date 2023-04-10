import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { db } from '../../utils/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import data from '../../utils/data';

const Preparing = () => {
  const [groupData, setGroupData] = useState([]);

  useEffect(() => {
    async function getData() {
      const groupData = await data.loadGroupData();
      const preparingData = groupData.filter(
        (item) => item.status === 'preparing'
      );
      setGroupData(preparingData);
    }

    getData();

    const unsubscribes = groupData.map((item) => {
      const studyGroupRef = doc(db, 'studyGroups', item.id);
      return onSnapshot(studyGroupRef, (doc) => {
        if (doc.data().status === 'ongoing') {
          getData();
        }
      });
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  function handleChangeState(item) {
    const groupRef = doc(db, 'studyGroups', item.id);
    updateDoc(groupRef, { status: 'ongoing' })
      .then(() => {
        console.log('Document successfully updated!');
      })
      .catch((error) => {
        console.error('Error updating document: ', error);
      });
  }
  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        {groupData.length === 0 ? (
          <p>目前沒有參加的讀書會</p>
        ) : (
          groupData.map((item, i) => (
            <StudyGroupCard key={i}>
              <BookImg imageUrl={item.image} />
              <CardContent>
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
                  舉辦時間:<span>{item.hold}</span>
                </p>
                <p>公告：{item.post}</p>
                <input type="button" value="退出讀書會" />
                <Link to={`/study-group/${item.id}/process`}>
                  <input type="button" value="編輯流程" />
                </Link>
                <input
                  type="button"
                  value="開始讀書會"
                  onClick={() => handleChangeState(item)}
                />
              </CardContent>
            </StudyGroupCard>
          ))
        )}
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
  background-size: contain;
  background-repeat: no-repeat;
  width: 250px;
  height: 300px;
  margin-right: 30px;
`;
const CardContent = styled.div`
  width: 800px;
`;
export default Preparing;
