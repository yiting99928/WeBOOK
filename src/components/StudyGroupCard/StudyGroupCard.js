import styled from 'styled-components/macro';
import moment from 'moment';
import { MainBtn } from '../Buttons/Buttons';
import { useNavigate } from 'react-router-dom';

function StudyGroupCard({ item, onClick, onJoinGroup }) {
  const navigate = useNavigate();
  return (
    <BookGroup onClick={onClick}>
      <BookGroupImg
        src={item.image}
        alt="feature"
        onClick={() => navigate(`/studyGroup/${item.id}`)}
      />
      <BookGroupInfo>
        <BookTitle>{item.groupName}</BookTitle>
        <BookAuthor>{item.name}</BookAuthor>
        <BookAuthor>{item.author}</BookAuthor>
        <Creator>
          時間：
          {moment
            .unix(item.startTime.seconds)
            .format('YYYY-MM-DD hh:mm A')}{' '}
          <br />
          導讀人：{item.host}
        </Creator>
        <MainBtn
          onClick={(e) => {
            onJoinGroup(item.id);
          }}>
          加入讀書會
        </MainBtn>
      </BookGroupInfo>
    </BookGroup>
  );
}

const BookTitle = styled.div`
  padding-bottom: 4px;
  font-weight: 600;
  font-size: 18px;
`;
const BookAuthor = styled.div`
  color: #5b5b5b;
  padding-top: 6px;
  font-size: 12px;
`;
const Creator = styled.div`
  font-size: 14px;
  margin-top: auto;
  line-height: 1.3;
`;

const BookGroupImg = styled.img`
  object-fit: cover;
  cursor: pointer;
`;
const BookGroupInfo = styled.div`
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 15px;
`;
const BookGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 230px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #ececec;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 510px;
`;
export default StudyGroupCard;
