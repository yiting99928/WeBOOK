import ReactQuill, { Quill } from 'react-quill';
import * as Emoji from 'quill-emoji';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
Quill.register('modules/emoji', Emoji);

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'emoji'],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
  'emoji-toolbar': true,
  'emoji-textarea': false,
  'emoji-shortname': true,
};

function EditContent({ onChange, value, onBlur }) {
  return (
    <ReactQuill
      className="quill-editor"
      theme="snow"
      value={value}
      onChange={onChange}
      modules={quillModules}
      onBlur={onBlur}
    />
  );
}
export default EditContent;
