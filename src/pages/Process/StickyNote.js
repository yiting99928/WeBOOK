import styled from 'styled-components/macro';

function StickyNote({ item, dispatch, processIndex }) {
  const handleOptionChange = (index, e, field) => {
    const updatedData = [...item.data];
    updatedData[index][field] = e.target.value;
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };

  return (
    <div>
      {item.data === undefined ? (
        <></>
      ) : (
        item.data.map((item, index = 0) => (
          <Note key={index}>
            <Message
              type="text"
              value={item.message}
              onChange={(e) => handleOptionChange(index, e, 'message')}
            />
            <Name
              type="text"
              value={item.name}
              onChange={(e) => handleOptionChange(index, e, 'name')}
            />
          </Note>
        ))
      )}
    </div>
  );
}
const Message = styled.textarea`
  padding: 5px 0;
  height: 100%;
  width: 100%;
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
const Name = styled.input`
  margin-top: auto;
`;
export default StickyNote;
