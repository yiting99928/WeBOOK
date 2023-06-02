import { Draft, produce } from 'immer';
import { ChangeEvent, useState } from 'react';
import styled from 'styled-components/macro';
import { PayloadType, QAItem, TemplateType, VoteItem } from '../../types/types';

type OptionListType = {
  item: TemplateType;
  dispatch: (action: { type: string; payload: PayloadType }) => void;
  processIndex: number;
  editable: number;
};

function OptionList({
  item,
  processIndex,
  editable,
  dispatch,
}: OptionListType) {
  const [warnInfo, setWarnInfo] = useState(false);

  const createNewItem = () => {
    if (item.type === 'vote') {
      return {
        number: 0,
        option: `請填寫投票選項`,
      } as VoteItem;
    } else if (item.type === 'QA') {
      return {
        option: '請填寫選項並點選正確的選項',
        answer: false,
      } as QAItem;
    }
    throw new Error('Invalid item type');
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
      if (item.type === 'vote') {
        (draft as Draft<VoteItem[]>).push(newItem as VoteItem);
      } else if (item.type === 'QA') {
        (draft as Draft<QAItem[]>).push(newItem as QAItem);
      }
    });

    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };

  const handleDelOption = (index: number) => {
    const updatedData = produce(
      item.data,
      (draft: Draft<QAItem[] | VoteItem[]>) => {
        draft.splice(index, 1);
      }
    );
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };

  const handleOptionChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const updatedData = produce(item.data, (draft: Draft<VoteItem[]>) => {
      draft[index].option = e.target.value;
    });
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };

  const handleCheckboxChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const updatedData = produce(item.data, (draft: Draft<QAItem[]>) => {
      draft[index].answer = e.target.checked;
    });
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };
  const renderOption = (optionItem: QAItem | VoteItem, index: number) => {
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
            $editing={editable === processIndex}
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
            checked={(optionItem as QAItem).answer ? true : false}
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
            $editing={editable === processIndex}
            onClick={() => handleDelOption(index)}>
            x
          </DelOption>
        </Option>
      );
    }
  };

  return (
    <div>
      {(item.type === 'QA' || item.type === 'vote') &&
        item.data.map((optionItem, index) => renderOption(optionItem, index))}
      <Footer>
        <Button $editing={editable === processIndex} onClick={handleAddOption}>
          新增選項
        </Button>
        <Warn $warnInfo={warnInfo}>最多五個選項</Warn>
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

const Warn = styled.div<{ $warnInfo: boolean }>`
  opacity: ${({ $warnInfo }) => ($warnInfo ? 1 : 0)};
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

const Button = styled.button<{ $editing: boolean }>`
  display: ${({ $editing }) => ($editing ? 'block' : 'none')};
  background-color: #ffac4c;
  color: #fff;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
`;

const DelOption = styled.span<{ $editing: boolean }>`
  display: ${({ $editing }) => ($editing ? 'block' : 'none')};
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
