import React from 'react';
import styled from 'styled-components';
import { LiveMainBtn } from '../../components/Buttons';
import EditContent from '../../components/EditContent';

export function Note({ setNote, note, handleSaveNote, showSaveInfo }) {
  return (
    <NoteContainer>
      <EditContent onChange={setNote} value={note} />
      <LiveMainBtn onClick={handleSaveNote}>儲存筆記</LiveMainBtn>
      <SaveInfo showSaveInfo={showSaveInfo}>已儲存筆記</SaveInfo>
    </NoteContainer>
  );
}
const SaveInfo = styled.div`
  opacity: ${({ showSaveInfo }) => (showSaveInfo ? 1 : 0)};
  font-size: 14px;
  color: #e95f5c;
  display: inline-block;
  margin-left: 10px;
`;
const NoteContainer = styled.div`
  height: 350px;
  background-color: #fff;
`;
