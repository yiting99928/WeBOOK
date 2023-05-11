import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import webookJump from './webookJump.gif';
import webookSwing from './webookSwing.gif';

const createSwal = (title, imageUrl, imageAlt, callback) => {
  Swal.fire({
    title,
    imageUrl,
    imageWidth: 100,
    imageAlt,
    scrollbarPadding: false,
  }).then(callback);
};

const modal = {
  success(text) {
    const success = withReactContent(Swal);
    createSwal.call(success, text, webookJump, 'success');
  },
  create(text, id) {
    createSwal(text, webookJump, 'success', (result) => {
      if (result.isConfirmed && id) {
        window.location = `/study-group/${id}/process`;
      }
    });
  },
  quit(text) {
    createSwal(text, webookSwing, 'quit');
  },
  noUser(text) {
    createSwal(text, webookSwing, 'quit', (result) => {
      if (result.isConfirmed) {
        window.location = `/login`;
      }
    });
  },
  noData(text) {
    createSwal(text, webookSwing, 'quit', (result) => {
      if (result.isConfirmed) {
        window.location = `/`;
      }
    });
  },
};

export default modal;
