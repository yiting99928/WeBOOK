import styled from 'styled-components/macro';
import { produce } from 'immer';
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';

function StickyNote({ item, dispatch, processIndex, editable }) {
  const { user } = useContext(AuthContext);
  const handleOptionChange = (index, e, field) => {
    const updatedData = produce(item.data, (draft) => {
      draft[index][field] = e.target.value;
    });

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
              readOnly={editable !== processIndex}
              type="text"
              value={item.message}
              onChange={(e) => handleOptionChange(index, e, 'message')}
            />
            <Name>{user.name}</Name>
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
  outline: none;
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
