import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import webookJump from './webookJump.gif';
import webookSwing from './webookSwing.gif';
// import { useNavigate } from 'react-router-dom';

const modal = {
  // const navigate = useNavigate();
  success(text) {
    const success = withReactContent(Swal);
    success.fire({
      title: text,
      imageUrl: webookJump,
      imageWidth: 100,
      imageAlt: 'success',
      scrollbarPadding: false,
    });
  },
  create(text, id) {
    const success = withReactContent(Swal);
    success
      .fire({
        title: text,
        imageUrl: webookJump,
        imageWidth: 100,
        imageAlt: 'success',
        scrollbarPadding: false,
      })
      .then((result) => {
        if (result.isConfirmed && id) {
          window.location = `/studyGroup/${id}`;
        }
      });
  },
  fail(text) {
    const fail = withReactContent(Swal);
    fail.fire({
      title: text,
      imageUrl: webookSwing,
      imageWidth: 100,
      imageAlt: 'fail',
      scrollbarPadding: false,
    });
  },
  quit(text) {
    const fail = withReactContent(Swal);
    fail.fire({
      title: text,
      imageUrl: webookSwing,
      imageWidth: 100,
      imageAlt: 'quit',
      scrollbarPadding: false,
    });
  },
  noUser(text) {
    const fail = withReactContent(Swal);
    fail
      .fire({
        title: text,
        imageUrl: webookSwing,
        imageWidth: 100,
        imageAlt: 'quit',
        scrollbarPadding: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          window.location = `/login`;
        }
      });
  },
};
export default modal;
