import styled from 'styled-components/macro';
import { formatTimeRange } from '../../utils/formatTime';

function GroupTitle({ studyGroup }) {

  return (
    <TitleContainer>
      <TitleName>
        <GroupName>{studyGroup.groupName}</GroupName>
        <BookName>{studyGroup.name}</BookName>
      </TitleName>
      <div>
        作者：{studyGroup.author}
        <br />
        導讀人：{studyGroup.host}
        <br />
        章節：{studyGroup.chapter}
        <br />
        時間： {formatTimeRange(studyGroup.startTime, studyGroup.endTime)}
      </div>
    </TitleContainer>
  );
}
const TitleName = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  letter-spacing: 2;
`;
const GroupName = styled.div`
  font-weight: 600;
  font-size: 28px;
`;
const BookName = styled.div`
  font-size: 28px;
`;
const TitleContainer = styled.div`
  display: flex;
  color: #5b5b5b;
  margin-bottom: 20px;
  line-height: 1.5;
  justify-content: space-between;
  width: 100%;
`;
export default GroupTitle;
