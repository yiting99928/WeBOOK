import styled from 'styled-components/macro';
import { db } from '../../utils/firebase';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { BiMessageAdd, BiTrash } from 'react-icons/bi';
import { useState } from 'react';

function StickyNote({ item, dispatch, processIndex, id }) {
  // const [noteColors, setNoteColors] = useState(['#FFE4E1', '#FFF5EE', '#FFE4B5', '#F0FFF0', '#E0FFFF']);
  useEffect(() => {
    handleUpdateNote();
  }, [item.data]);

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
  const handleDelOption = async (index) => {
    const updatedData = [...item.data];
    console.log([...item.data]);
    updatedData.splice(index, 1);
    await dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };

  const handleUpdateNote = async () => {
    const studyGroupDocRef = doc(db, 'studyGroups', id);
    const studyGroupDocSnapshot = await getDoc(studyGroupDocRef);
    // console.log(studyGroupDocSnapshot.data().process[processIndex].data);

    // 複製整個process
    const updatedProcess = [...studyGroupDocSnapshot.data().process];
    updatedProcess[processIndex].data = item.data;
    // console.log(updatedProcess);
    // 更新整個process
    await updateDoc(studyGroupDocRef, {
      process: updatedProcess,
    });
  };

  const noteColor = ['#FFE4E1', '#FFF5EE', '#FFE4B5', '#F0FFF0', '#E0FFFF'];

  return (
    <NoteContainer>
      {item.data === undefined ? (
        <></>
      ) : (
        item.data.map((item, index = 0) => (
          <Note key={index} noteColor={noteColor[index % noteColor.length]}>
            <Icons>
              <BiMessageAdd onClick={handleAddOption} />
              {index === 0 ? (
                <div></div>
              ) : (
                <BiTrash onClick={() => handleDelOption(index)} />
              )}
            </Icons>
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
    </NoteContainer>
  );
}
const Icons = styled.div`
  padding: 3px;
  border-radius: 6px;
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 2px;
  svg {
    cursor: pointer;
    color: #5b5b5b;
  }
`;
const NoteContainer = styled.div`
  display: flex;
  gap: 15px;
  width: 100%;
  height: 70%;
  overflow-x: scroll;
  align-items: center;
`;
const Message = styled.div`
  padding: 5px 0;
  overflow-wrap: break-word;
  max-width: 160px;
`;
const Note = styled.div`
  position: relative;
  min-width: 200px;
  height: 200px;
  background-color: ${(props) => props.noteColor || '#efefef'};
  display: flex;
  flex-direction: column;
  padding: 15px;
`;
const Name = styled.div`
  margin-top: auto;
  overflow-wrap: break-word;
  max-width: 100%;
`;
export default StickyNote;
