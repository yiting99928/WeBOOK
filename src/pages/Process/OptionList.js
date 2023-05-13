import { produce } from 'immer';
import React, { useState } from 'react';
import styled from 'styled-components/macro';

function OptionList({ item, processIndex, editable, dispatch, itemType }) {
  const [warnInfo, setWarnInfo] = useState(false);

  const createNewItem = () => {
    if (item.type === 'vote') {
      return {
        number: 0,
        option: `請填寫投票選項`,
      };
    } else if (item.type === 'QA') {
      return {
        option: '請填寫選項並點選正確的選項',
        answer: false,
      };
    }
  };

  const handleAddOption = () => {
    if (item.data.length >= 5) {
      setWarnInfo(true);
      setTimeout(() => {
        setWarnInfo(false);
      }, 1000);
      return;
    }
    const newItem = createNewItem();
    const updatedData = produce(item.data, (draft) => {
      draft.push(newItem);
    });
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };

  const handleDelOption = (index) => {
    const updatedData = produce(item.data, (draft) => {
      draft.splice(index, 1);
    });
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };

  const handleOptionChange = (index, e) => {
    const updatedData = produce(item.data, (draft) => {
      draft[index].option = e.target.value;
    });
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };

  const handleCheckboxChange = (index, e) => {
    const updatedData = produce(item.data, (draft) => {
      draft[index].answer = e.target.checked;
    });
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };
  const renderOption = (optionItem, index) => {
    if (item.type === 'vote') {
      return (
        <Option key={index}>
          <ItemNum>{index + 1}.</ItemNum>
          <OptionInput
            type="text"
            value={optionItem.option}
            readOnly={editable !== processIndex}
            onChange={(e) => handleOptionChange(index, e)}
            maxLength={30}
            required
          />
          <DelOption
            editing={editable === processIndex}
            onClick={() => handleDelOption(index)}>
            x
          </DelOption>
        </Option>
      );
    } else if (item.type === 'QA') {
      return (
        <Option key={index}>
          <input
            type="checkbox"
            onChange={(e) => handleCheckboxChange(index, e)}
            checked={optionItem.answer ? true : false}
          />
          <ItemNum>{index + 1}.</ItemNum>
          <OptionInput
            type="text"
            value={optionItem.option}
            readOnly={editable !== processIndex}
            onChange={(e) => handleOptionChange(index, e)}
            maxLength={30}
          />
          <DelOption
            editing={editable === processIndex}
            onClick={() => handleDelOption(index)}>
            x
          </DelOption>
        </Option>
      );
    }
  };

  return (
    <div>
      {item.data.map((optionItem, index) => renderOption(optionItem, index))}
      <Footer>
        <Button editing={editable === processIndex} onClick={handleAddOption}>
          新增選項
        </Button>
        <Warn warnInfo={warnInfo}>最多五個選項</Warn>
      </Footer>
    </div>
  );
}

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const Warn = styled.div`
  opacity: ${({ warnInfo }) => (warnInfo ? 1 : 0)};
  font-size: 14px;
  color: #e95f5c;
`;
const OptionInput = styled.input`
  width: 80%;
`;
const ItemNum = styled.div`
  padding: 0 8px;
  margin-top: 3px;
  width: 25px;
`;

const Button = styled.button`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
  background-color: #ffac4c;
  color: #fff;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
`;

const DelOption = styled.span`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
  margin-left: auto;
  font-size: 18px;
  color: #5b5b5b;
  cursor: pointer;
`;

const Option = styled.div`
  display: flex;
  line-height: 2;
`;
export default OptionList;
