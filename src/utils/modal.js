import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import webookJump from './webookJump.gif';
import webookSwing from './webookSwing.gif';

const modal = {
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
    Swal.fire({
      title: text,
      imageUrl: webookJump,
      imageWidth: 100,
      imageAlt: 'success',
      scrollbarPadding: false,
    }).then((result) => {
      if (result.isConfirmed && id) {
        window.location = `/study-group/${id}/process`;
      }
    });
  },
  fail(text) {
    Swal.fire({
      title: text,
      imageUrl: webookSwing,
      imageWidth: 100,
      imageAlt: 'fail',
      scrollbarPadding: false,
    });
  },
  quit(text) {
    Swal.fire({
      title: text,
      imageUrl: webookSwing,
      imageWidth: 100,
      imageAlt: 'quit',
      scrollbarPadding: false,
    });
  },
  noUser(text) {
    Swal.fire({
      title: text,
      imageUrl: webookSwing,
      imageWidth: 100,
      imageAlt: 'quit',
      scrollbarPadding: false,
    }).then((result) => {
      if (result.isConfirmed) {
        window.location = `/login`;
      }
    });
  },
};
export default modal;
