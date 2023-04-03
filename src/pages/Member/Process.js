import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { db } from '../../utils/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

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
const ProcessCard = styled.div`
  border: 1px solid black;
  padding: 10px;
`;
function Process() {
  const [studyGroup, setStudyGroup] = useState([]);
  const [templates, setTemplates] = useState([]);

  const { id } = useParams();
  useEffect(() => {
    getDoc(doc(db, 'studyGroups', id)).then((doc) => {
      if (doc.exists()) {
        setStudyGroup(doc.data());
      } else {
        console.log('No such document!');
      }
    });
    getDocs(collection(db, 'template')).then((snapshot) => {
      const templatesData = snapshot.docs.map((doc) => {
        return {
          ...doc.data(),
        };
      });
      const lecture = templatesData.find((item) => item.type === 'lecture');
      console.log(lecture);
      setStudyGroup((prevStudyGroup) => ({
        ...prevStudyGroup,
        process: [lecture],
      }));
      console.log(studyGroup.process);
      setTemplates(templatesData);
    });
  }, []);

  console.log(studyGroup.process);

  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        <h2>書名：{studyGroup.name}</h2>
        <p>
          作者：{studyGroup.author} <span>舉辦時間：{studyGroup.hold}</span>
        </p>
        <div>
          {studyGroup.process !== undefined &&
            studyGroup.process.map((item, i) => (
              <ProcessCard key={i}>
                <p>{item.type}</p>
                <hr />
                <p>{item.description}</p>
                <p>選項</p>
                <p>票數</p>
              </ProcessCard>
            ))}
        </div>
      </Content>
    </Container>
  );
}
export default Process;
