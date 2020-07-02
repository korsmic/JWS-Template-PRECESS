import iziModal from '../lib/iziModal';

export default function() {
  $.fn.iziModal = iziModal;
  var options1 = {
    background: 'transparent',
    width: 900,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    onOpening: function() {},
    onClosing: function() {},
  };

  // $('modal').iziModal(options1);
}
