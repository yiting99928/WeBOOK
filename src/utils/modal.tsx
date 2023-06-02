import Swal, { SweetAlertResult } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import webookJump from './webookJump.gif';
import webookSwing from './webookSwing.gif';

const createSwal = (
  title: string,
  imageUrl: string,
  imageAlt: string,
  callback?: (result: SweetAlertResult) => void
) => {
  Swal.fire({
    title,
    imageUrl,
    imageWidth: 100,
    imageAlt,
    scrollbarPadding: false,
  }).then(callback);
};

const modal = {
  success(text: string) {
    const success = withReactContent(Swal);
    createSwal.call(success, text, webookJump, 'success');
  },
  create(text: string, id: string) {
    createSwal(text, webookJump, 'success', (result) => {
      if (result.isConfirmed && id) {
        window.location.href = `/study-group/${id}/process`;
      }
    });
  },
  quit(text: string) {
    createSwal(text, webookSwing, 'quit');
  },
  noUser(text: string) {
    createSwal(text, webookSwing, 'quit', (result) => {
      if (result.isConfirmed) {
        window.location.href = `/login`;
      }
    });
  },
  noData(text: string) {
    createSwal(text, webookSwing, 'quit', (result) => {
      if (result.isConfirmed) {
        window.location.href = `/`;
      }
    });
  },
};

export default modal;
