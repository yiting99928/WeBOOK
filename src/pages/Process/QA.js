import styled from 'styled-components/macro';

function QA({ item, processIndex = 0, editable = false, dispatch = {} }) {
  const handleAddOption = () => {
    const newItem = {
      option: '請填寫選項並點選正確的選項',
      answer: false,
    };
    const updatedData = [...item.data, newItem];
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };
  const handleOptionBlur = (index, e) => {
    const updatedData = [...item.data];
    updatedData[index].option = e.target.innerText;
    console.log(updatedData);
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };
  const onContentEditableInput = (e) => {
    e.stopPropagation();
  };
  const handleCheckboxChange = (index, e) => {
    const updatedData = [...item.data];
    updatedData[index].answer = e.target.checked;
    console.log(updatedData);
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

  return (
    <div>
      {item.data.map((item, index = 0) => (
        <Option key={index}>
          <input
            type="checkbox"
            onChange={(e) => handleCheckboxChange(index, e)}
            checked={item.answer ? true : false}
          />
          <div
            dangerouslySetInnerHTML={{ __html: item.option }}
            contentEditable={editable === processIndex}
            onBlur={(e) => handleOptionBlur(index, e)}
            onInput={onContentEditableInput}
          />
          <DelOption
            editing={editable === processIndex}
            onClick={() => handleDelOption(index)}>
            x
          </DelOption>
        </Option>
      ))}
      <AddInput
        value="+"
        type="button"
        onClick={handleAddOption}
        editing={editable === processIndex}
      />
    </div>
  );
}
const DelOption = styled.span`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
  margin-left: 10px;
`;

const Option = styled.div`
  display: flex;
  line-height: 1.5;
`;
const AddInput = styled.input`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
`;
export default QA;
