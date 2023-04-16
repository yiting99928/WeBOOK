import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';

import { useParams } from 'react-router-dom';
function StudyGroup() {
  const { user } = useContext(AuthContext);

  const [studyGroup, setStudyGroup] = useState(null);
  const { id } = useParams();
  useEffect(() => {
    const fetchStudyGroup = async () => {
      const studyGroupRef = doc(db, 'studyGroups', id);
      const studyGroupDoc = await getDoc(studyGroupRef);

      if (studyGroupDoc.exists()) {
        setStudyGroup({ id: studyGroupDoc.id, ...studyGroupDoc.data() });
      } else {
        console.error('Document not found');
      }
    };

    fetchStudyGroup();
  }, [id]);
  console.log(studyGroup);
  function toReadableDate(dateString, locale = 'zh-TW') {
    const dateObj = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  }

  const handleJoinGroup = async (id) => {
    const userGroupRef = doc(db, 'users', user.email, 'userStudyGroups', id);
    await setDoc(userGroupRef, { note: '' }).then(alert('已加入讀書會'));
  };
  return (
    <>
      {studyGroup === null ? (
        <>load</>
      ) : (
        <Container>
          <GroupInfo>
            <BookImg imageUrl={studyGroup.image} />
            <div>
              <p>{studyGroup.name}</p>
              <p>作者： {studyGroup.author}</p>
              <p>類別：{studyGroup.category}</p>
              <p>導讀者：{studyGroup.host}</p>
              <p>導讀章節：{studyGroup.chapter}</p>
              <p>舉辦時間：{toReadableDate(studyGroup.hold)}</p>
              <input
                type="button"
                value="加入讀書會"
                onClick={() => handleJoinGroup(id)}
              />
            </div>
          </GroupInfo>
          <div>
            <p>{studyGroup.post}</p>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  width: 800px;
  margin: 0 auto;
  margin-top: 50px;
`;
const BookImg = styled.div`
  background-image: url(${(props) => props.imageUrl});
  background-size: contain;
  background-repeat: no-repeat;
  width: 250px;
  height: 300px;
  margin-right: 30px;
`;
const GroupInfo = styled.div`
  display: flex;
`;
export default StudyGroup;
