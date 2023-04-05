import React from 'react';
import styled from 'styled-components/macro';

function Lecture({ item, processIndex, editable, dispatch }) {
  const onContentEditableBlur = (e) => {
    const data = e.currentTarget.innerHTML;
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data },
    });
  };

  const onContentEditableInput = (e) => {
    e.stopPropagation();
  };

  const bold = () => {
    document.execCommand('bold'); // 在選取的文字前後加上 <b> 標籤
  };
  const italic = () => {
    document.execCommand('italic'); // 在選取的文字前後加上 <i> 標籤
  };
  const underlined = () => {
    document.execCommand('underline'); // 在選取的文字前後加上 <u> 標籤
  };
  return (
    <div>
      <div
        dangerouslySetInnerHTML={{ __html: item.data }}
        contentEditable
        onBlur={onContentEditableBlur}
        onInput={onContentEditableInput}
      />
      <TitleEditIcons editable={editable === processIndex}>
        <input type="button" onClick={bold} value="bold" />
        <input type="button" onClick={italic} value="italic" />
        <input type="button" onClick={underlined} value="underlined" />
      </TitleEditIcons>
    </div>
  );
}
const TitleEditIcons = styled.div`
  display: ${({ editable }) => (editable ? 'block' : 'none')};
  margin-top: 15px;
`;
const TitleEdit = styled.span`
  font-size: 18px;
  margin-top: 5px;
`;
export default Lecture;
