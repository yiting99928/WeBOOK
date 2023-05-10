import { produce } from 'immer';
import styled from 'styled-components/macro';

function QA({ item, processIndex, editable, dispatch }) {
  const handleAddOption = () => {
    const newItem = {
      option: '請填寫選項並點選正確的選項',
      answer: false,
    };
    const updatedData = produce(item.data, (draft) => {
      draft.push(newItem);
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
  const handleDelOption = (index) => {
    const updatedData = produce(item.data, (draft) => {
      draft.splice(index, 1);
    });
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };
  return (
    <div>
      {item.data.map((item, index = 0) => (
        <Option key={index}>
          <input
            type="checkbox"
            onChange={(e) => handleCheckboxChange(index, e)}
            checked={item.answer ? true : false}
          />
          <ItemNum>{index + 1}.</ItemNum>
          <OptionInput
            type="text"
            value={item.option}
            readOnly={editable !== processIndex}
            onChange={(e) => handleOptionChange(index, e)}
          />
          <DelOption
            editing={editable === processIndex}
            onClick={() => handleDelOption(index)}>
            x
          </DelOption>
        </Option>
      ))}
      <Button onClick={handleAddOption} editing={editable === processIndex}>
        增加選項
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
export default QA;
