import styled from 'styled-components/macro';
import { db } from '../../utils/firebase';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';

function StickyNote({ item, dispatch, processIndex, id }) {
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
    console.log(updatedProcess);
    // 更新整個process
    await updateDoc(studyGroupDocRef, {
      process: updatedProcess,
    });
  };
  return (
    <NoteContainer>
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
            <div>
              <AddInput value="+" type="button" onClick={handleAddOption} />
              <input
                value="x"
                type="button"
                onClick={() => handleDelOption(index)}
              />
            </div>
          </Note>
        ))
      )}
    </NoteContainer>
  );
}
const AddInput = styled.input``;
const NoteContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
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
