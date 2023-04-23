import styled from 'styled-components/macro';

function StickyNote({ item, dispatch, processIndex, editable }) {
  const handleOptionBlur = (index, e, field) => {
    const updatedData = [...item.data];
    updatedData[index][field] = e.target.innerText;
    console.log(updatedData);
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
      {item.data === undefined ? (
        <></>
      ) : (
        item.data.map((item, index = 0) => (
          <Note key={index}>
            <Message
              dangerouslySetInnerHTML={{ __html: item.message }}
              contentEditable
              onBlur={(e) => handleOptionBlur(index, e, 'message')}
              onInput={onContentEditableInput}
            />
            <Name
              dangerouslySetInnerHTML={{ __html: item.name }}
              contentEditable
              onBlur={(e) => handleOptionBlur(index, e, 'name')}
              onInput={onContentEditableInput}
            />
          </Note>
        ))
      )}
    </div>
  );
}
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
  border-radius: 5px;
`;
const Name = styled.div`
  margin-top: auto;
`;
export default StickyNote;
