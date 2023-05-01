import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';
import modal from '../../utils/modal';
import { MainBtn } from '../../components/Buttons/Buttons';

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
    await setDoc(userGroupRef, { note: '' }).then(modal.success('加入讀書會'));
  };

  const statusText = {
    ongoing: { type: '進行中', color: '#DF524D' },
    preparing: { type: '準備中', color: '#F89D7D' },
    finished: { type: '已結束', color: '#FAC6B8' },
    upcoming: { type: '即將舉辦', color: '#DF524D' },
  };
  return (
    <div>
      {studyGroup === null ? (
        <>load</>
      ) : (
        <Container>
          <GroupInfo>
            <BookGroupImg src={studyGroup.image} alt="feature" />
            <GroupDetail>
              <Title>{studyGroup.groupName}</Title>
              <BookInfo>
                書名：{studyGroup.name}
                <br />
                類別：{studyGroup.category}
              </BookInfo>
              <Status statusColor={statusText[studyGroup.status].color}>
                {statusText[studyGroup.status].type}
              </Status>
              <Creator>
                作者：{studyGroup.author}
                <br />
                導讀人：{studyGroup.host}
                <br />
                章節：{studyGroup.chapter}
                <br />
                時間：
                {`${moment
                  .unix(studyGroup.startTime.seconds)
                  .format('MM.DD HH:mm')} — ${moment
                  .unix(studyGroup.endTime.seconds)
                  .format('MM.DD HH:mm')}`}
              </Creator>
              <MainBtn
                onClick={() => {
                  handleJoinGroup(id);
                }}
                height={'45px'}>
                加入讀書會
              </MainBtn>
            </GroupDetail>
          </GroupInfo>
          <Announcement>
            <Description>讀書會公告</Description>
            <div>{studyGroup.post}</div>
          </Announcement>
        </Container>
      )}
    </div>
  );
}

const Announcement = styled.div`
  margin-top: 40px;
`;
const Description = styled.div`
  font-size: 20px;
  font-weight: 600;
  padding-bottom: 20px;
`;
const Status = styled.div`
  text-align: center;
  background-color: ${({ statusColor }) => statusColor};
  color: #fff;
  border-radius: 6px;
  padding: 5px 0px;
  width: 95px;
  cursor: pointer;
  letter-spacing: 1.3;
  margin-top: auto;
`;
const Title = styled.div`
  font-weight: 600;
  font-size: 36px;
  letter-spacing: 1.5;
`;
const BookInfo = styled.div``;
const Creator = styled.div`
  margin-bottom: -8px;
`;
const GroupDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.5;
  margin-top: 80px;
  margin-bottom: 180px;
  color: #5b5b5b;
`;
const BookGroupImg = styled.img`
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  max-width: 300px;
`;
const GroupInfo = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  padding-bottom: 55px;
  border-bottom: 1px solid #b5b5b5;
  width: 100%;
  height: 500px;
`;
export default StudyGroup;
