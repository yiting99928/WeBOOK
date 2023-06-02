import { Draft, produce } from 'immer';
import { ChangeEvent, useContext } from 'react';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import { PayloadType, StickyNoteItem, TemplateType } from '../../types/types';

type StickyNoteType = {
  item: TemplateType;
  dispatch: (action: { type: string; payload: PayloadType }) => void;
  processIndex: number;
  editable: number;
};

function StickyNote({
  item,
  dispatch,
  processIndex,
  editable,
}: StickyNoteType) {
  const { user } = useContext(AuthContext);

  const handleOptionChange = (
    index: number,
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const updatedData = produce(item.data, (draft: Draft<StickyNoteItem[]>) => {
      draft[index]['message'] = e.target.value;
      draft[index]['name'] = user.name ?? '';
      draft[index]['email'] = user.email ?? '';
    });

    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: updatedData },
    });
  };
  return (
    <div>
      {item.type === 'stickyNote' &&
        item.data?.map((item, index = 0) => (
          <Note key={index}>
            <Message
              readOnly={editable !== processIndex}
              value={item.message}
              onChange={(e) => handleOptionChange(index, e)}
              maxLength={70}
            />
            <Name>{user.name}</Name>
          </Note>
        ))}
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
