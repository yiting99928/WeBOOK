import styled from 'styled-components/macro';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { BiTimeFive } from 'react-icons/bi';

function StudyGroupCard({ item }) {
  const navigate = useNavigate();
  return (
    <BookGroup onClick={() => navigate(`/studyGroup/${item.id}`)}>
      <ImgContainer>
        {item.status === 'ongoing' ? (
          <LiveTag>
            <LiveIcon />
            直播中
          </LiveTag>
        ) : (
          <div></div>
        )}
        <BookGroupImg src={item.image} alt="feature" />
      </ImgContainer>
      <BookGroupInfo>
        <BookTitle>{item.groupName}</BookTitle>
        <p>
          {item.name.length > 10 ? `${item.name.slice(0, 10)}...` : item.name}
        </p>
        <Creator>
          導讀人：{item.host}
          <div>
            <BiTimeFive />
            {moment.unix(item.startTime.seconds).format('MM.DD HH:mm')}
          </div>
        </Creator>
      </BookGroupInfo>
    </BookGroup>
  );
}
const LiveTag = styled.div`
  position: absolute;
  right: 8px;
  top: 8px;
  background-color: #df524d;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 25px;
  color: #fff;
  gap: 5px;
  z-index: 1;
  font-size: 14px;
`;
const LiveIcon = styled.div`
  width: 12px;
  height: 12px;
  background-image: url(https://cdn-cos-ke.myoed.com/ke_proj/core/_next/static/media/live-icon-1.0b738b5c.gif);
  background-size: contain;
  background-repeat: no-repeat;
`;
const ImgContainer = styled.div`
  overflow: hidden;
  height: 100%;
  position: relative;
`;
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
  div {
    background-color: #ffac4c;
    border-radius: 25px;
    padding-left: 10px;
    color: #fff;
    padding-top: 2px;
    width: 115px;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const BookGroupImg = styled.img`
  height: 100%;
  object-fit: cover;
  :hover {
    transform: scale(1.15);
  }
`;
const BookGroupInfo = styled.div`
  height: 180px;
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
  max-height: 480px;
  cursor: pointer;
`;
export default StudyGroupCard;
