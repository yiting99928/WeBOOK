import styled from 'styled-components';
import React, { useState } from 'react';
import { db } from '../../utils/firebase';
import { updateDoc, doc, getDoc } from 'firebase/firestore';

function Vote({ item, id, processIndex }) {
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (index) => {
    setHasVoted(true);
    const studyGroupDocRef = doc(db, 'studyGroups', id);
    const studyGroupDocSnapshot = await getDoc(studyGroupDocRef);
    // console.log(studyGroupDocSnapshot.data().process[processIndex].data);

    const newVoteItems = [
      ...studyGroupDocSnapshot.data().process[processIndex].data,
    ];
    newVoteItems[index].number += 1;
    // console.log(newVoteItems);

    // 複製整個process
    const updatedProcess = [...studyGroupDocSnapshot.data().process];

    // 用新的newVoteItems取代process[processIndex].data
    updatedProcess[processIndex].data = newVoteItems;
    // console.log(updatedProcess);
    // 更新整個process
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
              <Option>{voteItem.option}</Option>
            </ProgressBar>
            <Votes hasVoted={hasVoted}>{voteItem.number}票</Votes>
          </VoteItem>
        );
      })}
    </VoteItems>
  );
}
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
`;
const Votes = styled.div`
  margin-left: auto;
  display: ${({ hasVoted }) => (hasVoted ? 'block' : 'none')};
`;
const VoteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  height: 35px;
  background-color: #efefef;
  padding: 5px;
`;
const VoteItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;
export default Vote;
