import styled from 'styled-components';

function Vote({ item, processIndex = 0, editable = false, dispatch = {} }) {
  // console.log(item);

  const handleAddOption = () => {
    const newItem = {
      number: 0,
      option: `請填寫投票選項`,
    };
    const updatedData = [...item.data, newItem];
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };
  const handleDelOption = (index) => {
    const updatedData = [...item.data];
    updatedData.splice(index, 1);
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };
  const handleOptionBlur = (index, e) => {
    const updatedData = [...item.data];
    updatedData[index].option = e.target.innerText;
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };
  const onContentEditableInput = (e) => {
    e.stopPropagation();
  };
  return (
    <div>
      {item.data.map((voteItem, index) => (
        <VoteItem key={index}>
          <input type="radio" name="option" />
          <ItemNum>{index + 1}.</ItemNum>
          <div
            dangerouslySetInnerHTML={{ __html: voteItem.option }}
            contentEditable={editable === processIndex}
            onBlur={(e) => handleOptionBlur(index, e)}
            onInput={onContentEditableInput}
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
const ItemNum = styled.div`
  padding: 0 8px;
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
