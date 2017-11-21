export default const Popup = {
  popup: (e) => {
    e.preventDefault();

    const popupTar = $(e.currentTarget).attr('data-popup');
    TweenMax.to(popupTar, 0.4, { y: '0%' });
  },

  popupClose: (e) => {
    e.preventDefault();
    TweenMax.to('.js-popup', 0.4, { y: '100%' });
  }
};
