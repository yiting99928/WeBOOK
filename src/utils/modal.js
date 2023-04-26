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
};
export default modal;
