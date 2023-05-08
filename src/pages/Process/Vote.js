import styled from 'styled-components';
import { produce } from 'immer';

function Vote({ item, processIndex, editable, dispatch }) {
  const handleAddOption = () => {
    const newItem = {
      number: 0,
      option: `請填寫投票選項`,
    };
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

  return (
    <div>
      {item.data.map((voteItem, index) => (
        <VoteItem key={index}>
          <ItemNum>{index + 1}.</ItemNum>
          <OptionInput
            type="text"
            value={voteItem.option}
            readOnly={editable !== processIndex}
            onChange={(e) => handleOptionChange(index, e)}
          />
          <DelOption
            editing={editable === processIndex}
            onClick={() => handleDelOption(index)}>
            x
          </DelOption>
        </VoteItem>
      ))}
      <Button editing={editable === processIndex} onClick={handleAddOption}>
        新增選項
      </Button>
    </div>
  );
}
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
  margin-top: 10px;
  border-radius: 6px;
`;
const VoteItem = styled.div`
  display: flex;
  line-height: 2;
`;
const DelOption = styled.span`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
  margin-left: auto;
  font-size: 18px;
  color: #5b5b5b;
  cursor: pointer;
`;
export default Vote;
