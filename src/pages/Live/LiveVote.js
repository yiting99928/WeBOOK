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
    console.log(updatedProcess);
    // 更新整個process
    await updateDoc(studyGroupDocRef, {
      process: updatedProcess,
    });
  };

  return (
    <VoteItems>
      {item.data.map((voteItem, index) => (
        <VoteItem key={index}>
          <input
            type="radio"
            name="option"
            onChange={() => handleVote(index)}
            // onChange={() => console.log(index)}
            disabled={hasVoted}
          />
          <div>{voteItem.option}</div>
          <Votes>{voteItem.number}票</Votes>
        </VoteItem>
      ))}
    </VoteItems>
  );
}
const Votes = styled.div`
  margin-left: auto;
`;
const VoteItem = styled.div`
  display: flex;
  gap: 5px;
  background-color: #efefef;
  padding: 10px;
`;
const VoteItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;
export default Vote;
