import styled from 'styled-components/macro';
import moment from 'moment';
import { JoinBtn } from '../Buttons/Buttons';

function StudyGroupCard({ item, onClick, onJoinGroup }) {
  return (
    <BookGroup onClick={onClick}>
      <BookGroupImg src={item.image} alt="feature" />
      <BookGroupInfo>
        <BookTitle>{item.name}</BookTitle>
        <BookAuthor>{item.author}</BookAuthor>
        <Creator>
          時間：
          {moment.unix(item.hold.seconds).format('YYYY-MM-DD hh:mm A')} <br />
          導讀人：{item.host}
        </Creator>
        <JoinBtn
          onClick={(e) => {
            e.stopPropagation();
            onJoinGroup(item.id);
          }}>
          加入讀書會
        </JoinBtn>
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
  max-height: 320px;
  object-fit: cover;
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
  width: 230px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #ececec;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 510px;
`;
const GroupButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  background: #ffac4c;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  letter-spacing: 1.2;
  font-size: 18px;
  margin-top: 8px;
  cursor: pointer;
`;
export default StudyGroupCard;
