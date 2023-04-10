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
          <div>{voteItem.number}票</div>
          <div
            dangerouslySetInnerHTML={{ __html: voteItem.option }}
            contentEditable={editable === processIndex}
            onBlur={(e) => handleOptionBlur(index, e)}
            onInput={onContentEditableInput}/>
          <DelOption
            editing={editable === processIndex}
            onClick={() => handleDelOption(index)}>
            x
          </DelOption>
        </VoteItem>
      ))}
      <AddOption
        type="button"
        value="+"
        editing={editable === processIndex}
        onClick={handleAddOption}
      />
    </div>
  );
}
const VoteItem = styled.div`
  display: flex;
  gap: 5px;
`;
const DelOption = styled.span`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
`;
const AddOption = styled.input`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
`;
export default Vote;
