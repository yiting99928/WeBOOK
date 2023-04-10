import styled from 'styled-components/macro';

function StickyNote({ item, dispatch, processIndex, editable }) {
  const handleAddOption = () => {
    const newItem = {
      name: '請填寫名字',
      message: `請填寫分享內容`,
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
      <NoteContainer>
        {item.data.map((item, index) => (
          <Note key={index}>
            <Message
              dangerouslySetInnerHTML={{ __html: item.message }}
              contentEditable
              onBlur={(e) => handleOptionBlur(index, e)}
              onInput={onContentEditableInput}
            />
            <Name>{item.name}</Name>
            <input
              value="x"
              type="button"
              onClick={() => handleDelOption(index)}
            />
          </Note>
        ))}
      </NoteContainer>
      <AddInput
        value="+"
        type="button"
        onClick={handleAddOption}
        editing={editable === processIndex}
      />
    </div>
  );
}
const AddInput = styled.input`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
`;
const NoteContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;
const Message = styled.div`
  padding: 5px 0;
`;
const Note = styled.div`
  width: 200px;
  height: 200px;
  background-color: #efefef;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;
const Name = styled.div`
  margin-top: auto;
`;
export default StickyNote;
