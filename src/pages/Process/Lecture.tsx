import parse, { domToReact } from 'html-react-parser';
import { useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import styled from 'styled-components/macro';
import EditContent from '../../components/EditContent';
import { LectureItem, PayloadType, TemplateType } from '../../types/types';

type LectureType = {
  item: TemplateType;
  dispatch: (action: { type: string; payload: PayloadType }) => void;
  processIndex: number;
  editable?: number;
};

function Lecture({ item, processIndex = 0, editable, dispatch }: LectureType) {
  const [content, setContent] = useState(item.data);

  const onContentChange = (newContent: LectureItem) => {
    setContent(newContent);
  };

  const saveContent = () => {
    dispatch({
      type: 'UPDATE_DATA',
      payload: { processIndex, data: content },
    });
  };

  const replace = (node: any) => {
    if (node.attribs && node.attribs.contenteditable) {
      delete node.attribs.contenteditable;
      return (
        <node.name {...node.attribs}>
          {domToReact(node.children, { replace })}
        </node.name>
      );
    }
  };
  return (
    <div>
      <PreviewContent $editing={editable === processIndex}>
        {parse(content as string, { replace })}
      </PreviewContent>
      <Edit $editing={editable === processIndex}>
        <EditContent
          value={content as string}
          onChange={onContentChange}
          onBlur={saveContent}
        />
      </Edit>
    </div>
  );
}

const PreviewContent = styled.div<{ $editing: boolean }>`
  display: ${({ $editing }) => ($editing ? 'none' : 'block')};
  line-height: 1.2;
`;
const Edit = styled.div<{ $editing: boolean }>`
  display: ${({ $editing }) => ($editing ? 'block' : 'none')};
  margin-top: 15px;
`;
export default Lecture;
