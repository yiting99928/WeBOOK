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
