import React, { useState } from 'react';
import styled from 'styled-components/macro';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

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
        <ReactQuill
          value={content}
          onChange={onContentChange}
          modules={quillModules}
        />
        <button onClick={saveContent}>Save</button>
      </Edit>
    </div>
  );
}
const PreviewContent = styled.div`
  display: ${({ editing }) => (editing ? 'none' : 'block')};
`;
const Edit = styled.div`
  display: ${({ editing }) => (editing ? 'block' : 'none')};
  margin-top: 15px;
`;
export default Lecture;
