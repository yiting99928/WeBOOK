import { ChangeEvent, useState } from 'react';
import styled from 'styled-components/macro';
import { QAItem, TemplateType } from '../../types/types';

function QA({ item }: { item: TemplateType }) {
  const [userAnswer, setUserAnswer] = useState(
    Array(item.data.length).fill(false)
  );
  const [submitted, setSubmitted] = useState(false);

  const handleCheckboxChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const newUserAnswer = [...userAnswer];
    newUserAnswer[index] = e.target.checked;
    setUserAnswer(newUserAnswer);
  };
  const checkColor = (index: number) => {
    if (!submitted) return '';
    if (!userAnswer[index]) return '';

    const itemData = item.data[index] as QAItem;

    return itemData.answer === userAnswer[index] ? '#e6f4ea' : '#fce8e6';
  };

  const correctAnswer = () => {
    if (item.type !== 'QA') return;
    const correctAnswer = item.data
      .map((item: QAItem, index: number) => (item.answer ? index + 1 : null))
      .filter((index) => index !== null)
      .join(',');
    return correctAnswer;
  };

  return (
    <Options>
      {item.type === 'QA' &&
        item.data.map((item: QAItem, index = 0) => (
          <Option key={index} $checkColor={checkColor(index)}>
            <input
              type="checkbox"
              onChange={(e) => handleCheckboxChange(index, e)}
            />
            <ItemNum>{index + 1}.</ItemNum>
            <div>{item.option}</div>
          </Option>
        ))}
      <CorrectOption $submitted={submitted}>
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
  width: 25px;
`;
const CorrectOption = styled.p<{ $submitted: boolean }>`
  display: ${({ $submitted }) => ($submitted ? 'block' : 'none')};
`;
const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const Option = styled.div<{ $checkColor: string }>`
  padding: 5px;
  border-radius: 3px;
  display: flex;
  line-height: 1.5;
  background-color: ${({ $checkColor }) => $checkColor};
`;
export default QA;
