import styled from 'styled-components/macro';
import React, { useState } from 'react';

function QA({ item }) {
  const [userAnswer, setUserAnswer] = useState(
    Array(item.data.length).fill(false)
  );
  const [submitted, setSubmitted] = useState(false);

  const handleCheckboxChange = (index, e) => {
    const newUserAnswer = [...userAnswer];
    newUserAnswer[index] = e.target.checked;
    setUserAnswer(newUserAnswer);
  };
  const checkColor = (index) => {
    if (!submitted) return '';
    if (!userAnswer[index]) return '';
    return userAnswer[index] === item.data[index].answer
      ? '#e6f4ea'
      : '#fce8e6';
  };

  const correctAnswer = () => {
    const correctAnswer = item.data
      .map((item, index) => (item.answer ? index + 1 : null))
      .filter((index) => index !== null)
      .join(',');
    return correctAnswer;
  };

  return (
    <Options>
      {item.data.map((item, index = 0) => (
        <Option key={index} checkColor={checkColor(index)}>
          <input
            type="checkbox"
            onChange={(e) => handleCheckboxChange(index, e)}
          />
          <ItemNum>{index + 1}.</ItemNum>
          <div>{item.option}</div>
        </Option>
      ))}
      <CorrectOption submitted={submitted}>
        正確答案：{correctAnswer()}
      </CorrectOption>
      <Button onClick={() => setSubmitted(true)}>送出看答案</Button>
    </Options>
  );
}

const Button = styled.button`
  background-color: #ffac4c;
  color: #fff;
  padding: 8px 15px;
  margin-top: 10px;
  border-radius: 6px;
`;

const ItemNum = styled.div`
  padding: 0 8px;
`;
const CorrectOption = styled.p`
  display: ${({ submitted }) => (submitted ? 'block' : 'none')};
`;
const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const Option = styled.div`
  padding: 5px;
  border-radius: 3px;
  display: flex;
  line-height: 1.5;
  background-color: ${(props) => props.checkColor};
`;
export default QA;
