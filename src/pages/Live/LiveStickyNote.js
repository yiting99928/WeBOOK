import { produce } from 'immer';
import { useContext, useEffect, useState } from 'react';
import { BiMessageAdd } from 'react-icons/bi';
import { FaRegSave } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import data from '../../utils/firebase';

function StickyNote({ item, dispatch, processIndex, id }) {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [shouldUpdate, setShouldUpdate] = useState(false);

  const handleUpdateNote = async () => {
    const studyGroupDocSnapshot = await data.getGroup(id);

    const updatedProcess = produce(
      studyGroupDocSnapshot.process,
      (draft) => {
        draft[processIndex].data = item.data;
      }
    );
    await data.updateDocument(id, 'studyGroups', {
      process: updatedProcess,
    });
  };

  useEffect(() => {
    if (!isEditing) {
      handleUpdateNote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  useEffect(() => {
    if (shouldUpdate) {
      handleUpdateNote();
      setShouldUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldUpdate]);

  const handleAddOption = () => {
    const newItem = {
      name: user.name,
      email: user.email,
      message: `請填寫分享內容`,
    };
    const updatedData = produce(item.data, (draft) => {
      draft.push(newItem);
    });
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
    setShouldUpdate(true);
  };

  const handleOptionChange = (index, e) => {
    const updatedData = produce(item.data, (draft) => {
      draft[index].message = e.target.value;
    });
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };

  const handleDelOption = async (index) => {
    const updatedData = produce(item.data, (draft) => {
      draft.splice(index, 1);
    });
    await dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
    setShouldUpdate(true);
  };

  const noteColor = ['#FFE4E1', '#FFF5EE', '#FFE4B5', '#F0FFF0', '#E0FFFF'];
  return (
    <div>
      <Add>
        <BiMessageAdd onClick={handleAddOption} />
      </Add>
      <NoteContainer>
        {item.data?.map((item, index = 0) => (
          <Note key={index} noteColor={noteColor[index % noteColor.length]}>
            <Icons>
              <FaRegSave onClick={() => setIsEditing(false)} />
              <MdClose onClick={() => handleDelOption(index)} />
            </Icons>
            <Message
              type="text"
              value={item.message}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              onChange={(e) => handleOptionChange(index, e, 'message')}
              readOnly={user.email !== item.email}
            />
            <Name>{item.name}</Name>
          </Note>
        ))}
      </NoteContainer>
    </div>
  );
}
const Add = styled.div`
  position: absolute;
  top: 65px;
  left: 40px;
  cursor: pointer;
  background-color: #e95f5c;
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  z-index: 3;
  svg {
    color: white;
    transform: scale(1.3);
  }
`;
const Icons = styled.div`
  display: flex;
  gap: 5px;
  padding: 3px;
  position: absolute;
  top: 5px;
  right: 5px;
  svg {
    cursor: pointer;
    color: #5b5b5b;
    transform: scale(1.2);
  }
`;
const NoteContainer = styled.div`
  position: relative;
  display: flex;
  gap: 10px;
  width: 100%;
  height: 100%;
  overflow-x: scroll;
  align-items: center;
  @media screen and (max-width: 768px) {
    height: 100%;
  }
`;
const Message = styled.textarea`
  padding: 5px 0;
  height: 100%;
  width: 100%;
  outline: none;
`;
const Note = styled.div`
  position: relative;
  min-width: 200px;
  height: 200px;
  background-color: ${(props) => props.noteColor || '#efefef'};
  display: flex;
  flex-direction: column;
  padding: 20px;
`;
const Name = styled.div`
  margin-top: auto;
`;
export default StickyNote;
