import { setDoc, collection, doc, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';

function StudyGroups() {
  const [allGroupsData, setAllGroupsData] = useState([]);
  const { user } = useContext(AuthContext);
  useEffect(() => {
    async function getData() {
      const StudyGroupsData = collection(db, 'studyGroups');
      const groupsSnapshot = await getDocs(StudyGroupsData);
      const groups = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(groups);
      setAllGroupsData(groups);
    }
    getData();
  }, []);
  const handleJoinGroup = async (id) => {
    const userGroupRef = doc(db, 'users', user.email, 'userStudyGroups', id);
    await setDoc(userGroupRef, { note: '' }).then(alert('已加入讀書會'));
  };

  return (
    <Container>
      {allGroupsData.length === 0 ? (
        <>目前無讀書會</>
      ) : (
        allGroupsData.map((card, index) => (
          <Card key={index}>
            <BookImg imageUrl={card.image} />
            <h3>{card.name}</h3>
            <p>{card.author}</p>
            <p>舉辦時間：{card.author}</p>
            <p>導讀者：{card.host}</p>
            <input
              type="button"
              value="加入讀書會"
              onClick={() => handleJoinGroup(card.id)}
            />
          </Card>
        ))
      )}
    </Container>
  );
}
const BookImg = styled.div`
  background-image: url(${(props) => props.imageUrl});
  background-size: contain;
  background-repeat: no-repeat;
  width: 200px;
  height: 250px;
  margin-right: 30px;
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
`;

const Card = styled.div`
  width: 250px;
  height: 400px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
  }
`;
export default StudyGroups;
