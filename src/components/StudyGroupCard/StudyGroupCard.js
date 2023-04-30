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
        <p>
          {item.name.length > 10 ? `${item.name.slice(0, 10)}...` : item.name}
        </p>
        <Creator>
          導讀人：{item.host}
          <br />
          時間：
          {moment.unix(item.startTime.seconds).format('MM.DD HH:mm')}
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
  letter-spacing: 1.5;
  padding-bottom: 8px;
`;
const Creator = styled.div`
  font-size: 14px;
  margin-top: auto;
  line-height: 1.5;
`;

const BookGroupImg = styled.img`
  height: 100%;
  object-fit: cover;
  cursor: pointer;
`;
const BookGroupInfo = styled.div`
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 15px;
  color: #5b5b5b;
`;
const BookGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 230px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #ececec;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 510px;
`;
export default StudyGroupCard;
