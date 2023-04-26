import React, { useState } from 'react';
import styled from 'styled-components/macro';
import 'react-quill/dist/quill.snow.css';
import EditContent from '../../components/EditContent';

function Lecture({ item, processIndex = 0, editable = false, dispatch = {} }) {
  const [content, setContent] = useState(item.data);

  const onContentChange = (newContent) => {
    setContent(newContent);
  };

  const saveContent = () => {
    console.log(content);
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: content },
    });
  };

  return (
    <div>
      <PreviewContent
        dangerouslySetInnerHTML={{ __html: content }}
        editing={editable === processIndex}
      />
      <Edit editing={editable === processIndex}>
        <EditContent
          value={content}
          onChange={onContentChange}
          onBlur={saveContent}
        />
      </Edit>
    </div>
  );
}

const PreviewContent = styled.div`
  display: ${({ editing }) => (editing ? 'none' : 'block')};
  line-height: 1.2;
`;
const Edit = styled.div`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
  margin-top: 15px;
`;
export default Lecture;
