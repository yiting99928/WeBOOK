import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { produce } from 'immer';
import { useContext, useEffect } from 'react';
import { BiMessageAdd } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import { db } from '../../utils/firebase';

function StickyNote({ item, dispatch, processIndex, id }) {
  const { user } = useContext(AuthContext);
  useEffect(() => {
    const handleUpdateNote = async () => {
      const studyGroupDocRef = doc(db, 'studyGroups', id);
      const studyGroupDocSnapshot = await getDoc(studyGroupDocRef);
      const updatedProcess = produce(
        studyGroupDocSnapshot.data().process,
        (draft) => {
          draft[processIndex].data = item.data;
        }
      );
      await updateDoc(studyGroupDocRef, {
        process: updatedProcess,
      });
    };
    handleUpdateNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.data]);

  const handleAddOption = () => {
    const newItem = {
      name: user.name,
      message: `請填寫分享內容`,
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
  };

  const noteColor = ['#FFE4E1', '#FFF5EE', '#FFE4B5', '#F0FFF0', '#E0FFFF'];
  return (
    <>
      <Add>
        <BiMessageAdd onClick={handleAddOption} />
      </Add>
      <NoteContainer>
        {item.data === undefined ? (
          <></>
        ) : (
          item.data.map((item, index = 0) => (
            <Note key={index} noteColor={noteColor[index % noteColor.length]}>
              <Icons>
                <MdClose onClick={() => handleDelOption(index)} />
              </Icons>
              <Message
                type="text"
                value={item.message}
                onChange={(e) => handleOptionChange(index, e, 'message')}
              />
              <Name>{item.name}</Name>
            </Note>
          ))
        )}
      </NoteContainer>
    </>
  );
}
const Add = styled.div`
  position: absolute;
  top: 75px;
  left: 40px;
  cursor: pointer;
  background-color: #e95f5c;
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  svg {
    color: white;
    transform: scale(1.3);
  }
`;
const Icons = styled.div`
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
  height: 70%;
  overflow-x: scroll;
  align-items: center;
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
