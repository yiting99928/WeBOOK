import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';

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

  const handleJoinGroup = async (id) => {
    const userGroupRef = doc(db, 'users', user.email, 'userStudyGroups', id);
    await setDoc(userGroupRef, { note: '' }).then(alert('已加入讀書會'));
  };
  const statusText = {
    ongoing: '進行中',
    preparing: '準備中',
    finished: '已結束',
  };
  return (
    <>
      {studyGroup === null ? (
        <>load</>
      ) : (
        <Container>
          <GroupInfo>
            <BookGroupImg>
              <img src={studyGroup.image} alt="feature" />
            </BookGroupImg>
            <GroupDetail>
              <Title>{studyGroup.name}</Title>
              <BookInfo>
                作者： {studyGroup.author}
                <br />
                類別：{studyGroup.category}
              </BookInfo>
              <Status>{statusText[studyGroup.status]}</Status>
              <Creator>
                導讀者：{studyGroup.host}
                <br />
                導讀章節：{studyGroup.chapter}
                <br />
                舉辦時間：
                {moment
                  .unix(studyGroup.hold.seconds)
                  .format('YYYY,MM,DD hh:mm A')}
              </Creator>
              <GroupButton
                onClick={() => {
                  handleJoinGroup(id);
                }}>
                加入讀書會
              </GroupButton>
            </GroupDetail>
          </GroupInfo>
          <Announcement>
            <Description>讀書會公告</Description>
            <div>{studyGroup.post}</div>
          </Announcement>
        </Container>
      )}
    </>
  );
}

const Announcement = styled.div`
  margin-top: 40px;
  color: #5b5b5b;
`;
const Description = styled.div`
  font-size: 20px;
  font-weight: 600;
  padding-bottom: 20px;
`;
const GroupButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  background: #ffac4c;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  letter-spacing: 1.2;
  font-size: 18px;
  margin-top: 8px;
`;
const Status = styled.div`
  background-color: #df524d;
  padding: 5px 16px;
  margin-right: auto;
  color: #fff;
  border-radius: 6px;
  width: 95px;
  text-align: center;
  margin-top: auto;
  margin-bottom: -10px;
`;
const Title = styled.div`
  color: #5b5b5b;
  font-weight: 600;
  font-size: 40px;
`;
const BookInfo = styled.div``;
const Creator = styled.div`
  ${'' /* margin-top: auto; */}
`;
const GroupDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-size: 18px;
  line-height: 150%;
`;

const Container = styled.div`
  width: 800px;
  margin: 120px auto 200px auto;
  line-height: 150%;
`;
const BookGroupImg = styled.div`
  max-width: 300px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
`;
const GroupInfo = styled.div`
  display: flex;
  gap: 40px;
  padding-bottom: 55px;
  border-bottom: 1px solid #b5b5b5;
`;
export default StudyGroup;
