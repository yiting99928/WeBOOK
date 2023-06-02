import styled from 'styled-components/macro';
import { StudyGroupType } from '../../types/types';
import { formatTimeRange } from '../../utils/formatTime';

function GroupTitle({ studyGroup }: { studyGroup: StudyGroupType }) {
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
  @media screen and (max-width: 768px) {
    font-size: 24px;
  }
`;
const BookName = styled.div`
  font-size: 28px;
  @media screen and (max-width: 768px) {
    font-size: 24px;
  }
`;
const TitleContainer = styled.div`
  display: flex;
  color: #5b5b5b;
  margin-bottom: 20px;
  line-height: 1.5;
  justify-content: space-between;
  width: 100%;
  @media screen and (max-width: 768px) {
    font-size: 14px;
    line-height: 1.2;
  }
`;
export default GroupTitle;
