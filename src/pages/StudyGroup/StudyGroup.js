import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components/macro';
import { MainBtn } from '../../components/Buttons';
import { AuthContext } from '../../context/authContext';
import { statusText } from '../../utils/dataConstants';
import data from '../../utils/firebase';
import { formatTimeRange } from '../../utils/formatTime';
import modal from '../../utils/modal';

function StudyGroup() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [studyGroup, setStudyGroup] = useState(null);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudyGroup = async () => {
      const group = await data.getGroup(id);
      if (group?.name) {
        setStudyGroup(group);
      } else {
        modal.noData('無此讀書會');
      }
    };

    fetchStudyGroup();
  }, [id]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, [studyGroup]);

  const handleJoinGroup = async (id) => {
    if (user) {
      await data.setUserGroup(id, user.email, { note: '' });
      modal.success('已加入讀書會!');
      if (studyGroup.status === 'ongoing') {
        navigate(`/study-group/${id}/live`);
      } else {
        navigate(`/profile`);
      }
    } else {
      modal.noUser('請先登入再加入讀書會唷!');
    }
  };

  return (
    <div>
      {isLoading && (
        <Container>
          <GroupInfo>
            <LoadingImg />
            <LoadingInfo>
              <Info height={'56px'} width={'100%'} />
              <Info height={'50px'} width={'50%'} />
              <Info3 height={'36px'} width={'20%'} />
              <Info height={'40px'} width={'60%'} />
              <Info height={'40px'} width={'60%'} />
              <Info5 />
            </LoadingInfo>
          </GroupInfo>
          <Info height={'40px'} width={'20%'} />
          <Info height={'120px'} width={'100%'} />
        </Container>
      )}
      {studyGroup && (
        <Container>
          <GroupInfo>
            <div>
              <BookGroupImg src={studyGroup.image} alt="feature" />
            </div>
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
                {formatTimeRange(studyGroup.startTime, studyGroup.endTime)}
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
            <Post>{studyGroup.post}</Post>
          </Announcement>
        </Container>
      )}
    </div>
  );
}
const Post = styled.div`
  word-break: break-word;
`;
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

const Pulse = styled.div`
  animation: ${pulse} 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;
const Info = styled(Pulse)`
  height: ${({ height }) => height};
  width: ${({ width }) => width};
  background-color: #ececec;
  border-radius: 25px;
  margin-top: 15px;
`;
const Info3 = styled(Info)`
  margin-top: auto;
`;
const Info5 = styled(Info)`
  height: 45px;
  border-radius: 6px;
`;

const LoadingInfo = styled.div`
  width: 360px;
  gap: 20px;
  display: flex;
  flex-direction: column;
`;
const LoadingImg = styled(Pulse)`
  width: 300px;
  height: 443px;
  background-color: #ececec;
`;

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
  letter-spacing: 1.3;
  margin-top: auto;
  cursor: default;
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
  min-width: 300px;
  max-width:300px;
`;

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.5;
  margin-top: 80px;
  margin-bottom: 180px;
  color: #5b5b5b;
  padding: 0 30px;
`;
const BookGroupImg = styled.img`
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  height: 100%;
`;
const GroupInfo = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  padding-bottom: 55px;
  border-bottom: 1px solid #b5b5b5;
  width: 100%;
  height: 500px;
  @media screen and (max-width: 640px) {
    flex-direction: column;
    height: auto;
  }
`;
export default StudyGroup;
