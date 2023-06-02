import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { LiveMainBtn } from '../../components/Buttons';
import EditContent from '../../components/EditContent';
import { AuthContext } from '../../context/authContext';
import data from '../../utils/firebase';

export function Note() {
  const [note, setNote] = useState('');
  const [showSaveInfo, setShowSaveInfo] = useState(false);
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  async function handleSaveNote() {
    if (!id || !user) return;
    try {
      await data.setUserGroup(id, user.email as string, {
        note: note,
      });
      setShowSaveInfo(true);
      setTimeout(() => {
        setShowSaveInfo(false);
      }, 1000);
    } catch (error) {
      console.error('Error: ', error);
    }
  }

  return (
    <NoteContainer>
      <EditContent onChange={setNote} value={note} />
      <LiveMainBtn onClick={handleSaveNote}>儲存筆記</LiveMainBtn>
      <SaveInfo $showSaveInfo={showSaveInfo}>已儲存筆記</SaveInfo>
    </NoteContainer>
  );
}
const SaveInfo = styled.div<{ $showSaveInfo: boolean }>`
  opacity: ${({ $showSaveInfo }) => ($showSaveInfo ? 1 : 0)};
  font-size: 14px;
  color: #e95f5c;
  display: inline-block;
  margin-left: 10px;
`;
const NoteContainer = styled.div`
  height: 350px;
  background-color: #fff;
`;
