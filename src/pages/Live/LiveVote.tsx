import { Draft, produce } from 'immer';
import { useState } from 'react';
import styled from 'styled-components';
import { StudyGroupType, TemplateType, VoteItem } from '../../types/types';
import data from '../../utils/firebase';

type VoteType = {
  item: TemplateType;
  processIndex: number;
  id: string;
};

function Vote({ item, id, processIndex }: VoteType) {
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (index: number) => {
    setHasVoted(true);
    const studyGroupDocSnapshot = (await data.getGroup(id)) as StudyGroupType;

    const updatedProcess = produce(
      studyGroupDocSnapshot.process ?? [],
      (draftProcess: Draft<TemplateType[]>) => {
        (draftProcess[processIndex].data[index] as VoteItem).number += 1;
      }
    );
    await data.updateDocument(id, 'studyGroups', {
      process: updatedProcess,
    });
  };

  let totalVotes = 0;
  if (item.type === 'vote') {
    totalVotes = item.data.reduce((acc, voteItem) => acc + voteItem.number, 0);
  }

  return (
    <VoteItems>
      {item.type === 'vote' &&
        item.data.map((voteItem, index) => {
          const percentage = (voteItem.number / totalVotes) * 100;
          return (
            <VoteItemStyled key={index}>
              <ProgressBar $percentage={percentage} $hasVoted={hasVoted}>
                <input
                  type="radio"
                  name="option"
                  onChange={() => handleVote(index)}
                  disabled={hasVoted}
                />
                <ItemNum>{index + 1}.</ItemNum>
                <Option>{voteItem.option}</Option>
              </ProgressBar>
              <Votes $hasVoted={hasVoted}>{voteItem.number}票</Votes>
            </VoteItemStyled>
          );
        })}
    </VoteItems>
  );
}
const ItemNum = styled.div`
  padding: 0 8px;
  width: 25px;
`;
const Option = styled.div`
  white-space: nowrap;
`;
const ProgressBar = styled.div<{ $percentage: number; $hasVoted: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  width: ${({ $percentage }) => `${$percentage}%`};
  height: 100%;
  background-color: ${({ $hasVoted }) =>
    $hasVoted ? 'rgb(159, 223, 159)' : 'none'};
  transition: 0.3s ease-in-out;
  border-radius: 6px;
`;
const Votes = styled.div<{ $hasVoted: boolean }>`
  margin-left: auto;
  width: 30px;
  display: ${({ $hasVoted }) => ($hasVoted ? 'block' : 'none')};
`;
const VoteItemStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #efefef;
  padding: 8px;
  border-radius: 6px;
`;
const VoteItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;
export default Vote;
