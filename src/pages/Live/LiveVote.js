import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { produce } from 'immer';
import React, { useState } from 'react';
import styled from 'styled-components';
import { db } from '../../utils/firebase';

function Vote({ item, id, processIndex }) {
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (index) => {
    setHasVoted(true);
    const studyGroupDocRef = doc(db, 'studyGroups', id);
    const studyGroupDocSnapshot = await getDoc(studyGroupDocRef);

    const updatedProcess = produce(
      studyGroupDocSnapshot.data().process,
      (draftProcess) => {
        draftProcess[processIndex].data[index].number += 1;
      }
    );

    await updateDoc(studyGroupDocRef, {
      process: updatedProcess,
    });
  };

  const maxVotes = Math.max(...item.data.map((voteItem) => voteItem.number));
  const totalVotes = item.data.reduce(
    (acc, voteItem) => acc + voteItem.number,
    0
  );

  return (
    <VoteItems>
      {item.data.map((voteItem, index) => {
        const percentage = (voteItem.number / totalVotes) * 100;
        return (
          <VoteItem key={index}>
            <ProgressBar
              percentage={percentage}
              votes={voteItem.number}
              maxVotes={maxVotes}
              hasVoted={hasVoted}>
              <input
                type="radio"
                name="option"
                onChange={() => handleVote(index)}
                disabled={hasVoted}
              />
              <ItemNum>{index + 1}.</ItemNum>
              <Option>{voteItem.option}</Option>
            </ProgressBar>
            <Votes hasVoted={hasVoted}>{voteItem.number}票</Votes>
          </VoteItem>
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
const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  width: ${({ percentage }) => `${percentage}%`};
  height: 100%;
  background-color: ${({ hasVoted }) =>
    hasVoted ? 'rgb(159, 223, 159)' : 'none'};
  transition: 0.3s ease-in-out;
  border-radius: 6px;
`;
const Votes = styled.div`
  margin-left: auto;
  width: 30px;
  display: ${({ hasVoted }) => (hasVoted ? 'block' : 'none')};
`;
const VoteItem = styled.div`
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
