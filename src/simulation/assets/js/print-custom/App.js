import $ from 'jquery';
import { TweenMax } from 'gsap';

import { mobilecheck, getUrlVars } from './globals';
import { Base, storageValue, orderLink, styleNum } from './base';
import { scrollEvents, orderMenu } from './Components';
import { loaderOut, spinner } from './Loader';
import ColourFunction from './BaseColour';

const Encoding = require('encoding-japanese');

const fontServer = 'https://mark.arena-jp.com/simulation/servlet/MarkSample2';
const markOptions = ['a', 'b', 'c', 'j', 'k', 'd', 'i', 'l', 'e', 'm', 'n', 'f', 'l', 'g', 'o'];
// const eventtype2 = mobilecheck() ? 'touchstart' : 'click';


export default class SimulationCommon extends Base {
  constructor(options) {
    super(options);

    this.rotationPath = '/simulation/wpcms/wp-content/uploads/sites/2/';
    this.markPickActive = false;
  }

  default() {
    // set the url for the json
    const slug = window.location.href.split('?')[0].split('/').pop();
    this.jsonPath = `/simulation/printcustom/wp-json/wp/v2/posts/?slug=${slug}`;

    this.render();
    this.events();
  }

  render() {
    this.itemSize();
    this.setStyleByCookie();

    this.colour = new ColourFunction({
      jsonUrl: this.jsonPath,
      print: true,
      callback: () => {
        this.markSetAsStart();
        TweenMax.to('.js-base-display', 0.4, {
          autoAlpha: 1,
          onComplete: () => { loaderOut(); },
        });
      },
    });

    this.colour.init();
  }

  events() {
    // mark events
    $('.js-colour--mark').on(window.eventtype, 'li', (event) => {
      this.changeColours(event);
      return false;
    });

    $('.js-mark-pick').on(window.eventtype, 'a', (event) => {
      this.markPick(event);
      return false;
    });

    $('.js-mark-form').on(window.eventtype, '.js-mark-submit', (event) => {
      this.markText({ event });
      return false;
    });

    $('.js-mark-pos').on(window.eventtype, 'a', (event) => {
      this.markPosPick(event);
      return false;
    });

    $('.js-mark-family').on('change', 'input', (event) => {
      this.markFamily(event);
    });

    $('.custom-menu__tabs').on(window.eventtype, 'li', this.tabs);

    $(document).on(window.eventtype, '.js-rotation', (event) => {
      this.rotation(event);
      return false;
    });

    $(document).on(window.eventtype, '.js-order-link-make', orderMenu.orderLinkMake);
    $(document).on(window.eventtype, '.js-modal', this.modals);
    $(document).on('click', '.js-base-display', this.imageModal);
    $(window).on('resize', this.itemSize);

    // $(document).on(window.eventtype, '.js-mark-tab-trigger', (event) => {
    //  this.markTab(event);
    //  return false;
    // });

    if (mobilecheck()) {
      $(document).on('touchstart', '.custom-menu__head', this.tapMenu);
    }
  }

  tabs = ({ currentTarget }) => {
    const tabName = $(currentTarget).data('tab');

    $('.custom-menu__tabs li').add('.custom-menu__content').removeClass('active');
    $(currentTarget).add(tabName).addClass('active');

    scrollEvents.scrollNavDisplay();
    // update the scrollbar height
    scrollEvents.updateScrollBar();
  };

  tapMenu = ({ currentTarget }) => {
    const $el = $('.custom-menu__content');
    const $tar = $(currentTarget).next().next();
    const $tapNav = $('.custom-menu__tap');
    const $tapTar = $(currentTarget).next();

    $el.removeClass('active');
    $tar.addClass('active');
    $tapNav.removeClass('is-hidden');
    $tapTar.addClass('is-hidden');
  };

  imageModal = ({ currentTarget }) => {
    const $el = $(currentTarget);
    const $tar = $el.find('svg');

    this.modalImage = document.createElement('div');
    this.modalImage.className = 'zoomed-image';
    this.modalImage.innerHTML = $tar.parent().html();
    this.modalImage.addEventListener('click', this.imageModalClose);

    TweenMax.set('.js-base-display', { opacity: 0 });
    document.body.appendChild(this.modalImage);
  };

  imageModalClose = () => {
    this.modalImage.removeEventListener('click', this.imageModalClose);
    TweenMax.set('.js-base-display', { opacity: 1 });
    TweenMax.to(this.modalImage, 0.4, {
      opacity: 0,
      onComplete: () => {
        document.body.removeChild(this.modalImage);
      },
    });
  }

  modals = (event) => {
    event.preventDefault();

    const $tar = $(event.currentTarget);
    const modal = $tar.data('modal');
    const alphaVal = !$tar.hasClass('active') ? 1 : 0;

    $tar.toggleClass('active');
    TweenMax.to(modal, 0.4, { autoAlpha: alphaVal });

    const modalClose = () => {
      $tar.removeClass('active');
      TweenMax.to(modal, 0.4, { autoAlpha: 0 });
      $('.content').off(window.eventtype, modalClose);
    };

    $('.content').on(window.eventtype, ':not(.modal)', modalClose);
  };

  itemSize = () => {
    const $container = $('.js-base-display');
    const $el = $container.find('svg');
    const viewBox = $el.length > 0 ? $el[0].viewBox.baseVal : '';
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (!viewBox) {
      $el.css('width', windowWidth * 0.4);
      return false;
    }

    if (viewBox.height > viewBox.width) {
      $el.css('height', windowHeight * 0.525);
    } else {
      $el.css('width', windowWidth * 0.4);
    }

    return true;
  };

  rotation(event) {
    spinner.in();

    const selector = mobilecheck() ? '.button-container .js-rotation' : '.js-rotation.u-pc';
    const $tar = event ? $(event.currentTarget) : $(selector);
    const data = $tar.data('svg');
    const rotationDir = $tar.data('rotation');
    const tarDir = rotationDir === 'front' ? 'back' : 'front';
    const storageKey = JSON.parse(localStorage.getItem(this.pageID));
    const key = storageKey.mark;
    const svg = rotationDir === 'front' ? '_back.svg' : '.svg';

    $('.js-base-display').load(`${this.rotationPath}${data}${svg}`, () => {
      this.restyle();
      this.markTextToCanvas(key, true);
      this.itemSize();
      spinner.out();
    });

    $tar.data('rotation', tarDir);
  }

  markSetAsStart() {
    // add mark text info at start
    if (getUrlVars().mark && getUrlVars().mark !== '') {
      storageValue.mark = $('.js-mark-text').val();
      orderLink.mark = $('.js-mark-text').val();
    }

    // apply if there are queries
    if (getUrlVars().pos && getUrlVars().pos !== '') {
      // set initial localStrage
      console.log('with query');
      if (getUrlVars().mark && getUrlVars().mark !== '') {
        console.log('show order');
        orderMenu.orderInfo();
      }

      this.reloadPage();
    } else {
      // apply no-mark option to dom and localStrage
      console.log('initial start');
      this.markPick($('.js-mark-pick .active'));
    }

    if ($('.js-mark-family input:checked').attr('data-max-lang') === 'en') {
      $('.js-mark-text').addClass('disabled');
    }
  }

  markPick(event) {
    const $tarEl = (event.currentTarget) ? $(event.currentTarget) : event;
    const condition = $($tarEl).data('mark');

    $('.js-mark-pick a').removeClass('active');
    $tarEl.addClass('active');

    // apply if [マーク有り] picked
    if (condition === 'on') {
      // remove overlay
      $('.js-mark-simulation').css('overflow', 'auto');
      $('.overlay--inactive').remove();

      // retrive mark info
      const pos = $('.js-mark-pos .active').data('pos');

      if (pos) {
        const markFont = $('.js-mark-family input:checked').val();
        const colour = $('.js-colour--mark').find('li.active').data('colour');
        const posTar = `#position-${pos.toLowerCase()}`;
        const $posEl = $(posTar).children(markFont).find('path');

        TweenMax.set($posEl, { fill: colour });
        $('.js-colour--mark').attr('data-target', posTar);
      }

      // apply if mark data already exists in localStrage
      if (orderLink.mark) {
        // update the order link following the stored localStrage info
        this.orderLinkChange();
      } else {
        // pop up order menu
        orderMenu.orderInfoHide();
      }

      // apply initial localStrage
      this.reloadPage();
      this.markSVGShow();
      this.markPickActive = false;
    } else if (!this.markPickActive) {
      // apply just once
      // add overlay on the layer
      const overlay = document.createElement('div');
      overlay.className = 'overlay overlay--inactive';
      document.querySelector('.js-mark-simulation').appendChild(overlay);
      $('.js-mark-simulation').css('overflow', 'hidden');

      // update the order link (remove mark data)
      this.currentURL = this.currentURL.split(/[?#]/)[0];

      const styleNumData = styleNum || '';
      const styleData = this.styleName || '';
      const baseColourData = orderLink.bcol || '';
      const orderLinkOrginal = `${this.currentURL}?style${styleNumData}=${styleData}&bcol=${baseColourData}`;

      $('.js-order-save').attr('href', orderLinkOrginal);

      // update scrollbar
      scrollEvents.updateScrollBar();
      // set value on localStrage and change the order link
      if (!orderMenu.orderInfoActive) orderMenu.orderInfo();

      this.markSVGRemove();
      this.markPickActive = true;
    }

    // update the scrollbar height
    scrollEvents.updateScrollBar();
  }

  markText(options) {
    spinner.in();

    const text = (options.text) ? options.text : $('.js-mark-text').val();
    const posData = storageValue.pos || $('.js-mark-pos .active').data('pos');
    const $tar = $('.js-mark-pos').find(`[data-pos="${posData}"]`);
    const $tar2 = $('.js-mark-family input:checked');
    const lang = $tar2.data('max-lang');
    const textLength = $tar.attr(`data-max-${lang}`);
    const encodedText = encodeURIComponent(text);
    const jdata = `/simulation/printcustom/validation/?lang=${lang}&max=${textLength}&text=${encodedText}&json`;

    $.ajax({
      url: jdata,
      type: 'GET',
      dataType: 'json',
    })
      .done((data) => {
        const { validate, message } = data;

        if (validate) {
          this.markTextToCanvas(text);
          $('.form-message').html('');
        } else {
          $('.form-message').html(message);
        }
      })
      .fail(() => { console.log('error'); })
      .always(() => { spinner.out(); });

    return false;
  }

  markTextToCanvas(text, isEncoded) {
    const { pos, font, bcol, col, mark } = storageValue;

    // convert text from UTF-8 to SJIS
    const str = text || mark;

    if (str) {
      // let imageElem = document.querySelector('.js-mark-check-image'); //Image element
      // const convertedText = Encoding.codeToString(sjisArray);
      let sjisText = str;

      if (!isEncoded || !mark) {
        const strArray = Encoding.stringToCode(str);
        const sjisArray = Encoding.convert(strArray, 'SJIS', 'UNICODE');

        sjisText = Encoding.urlEncode(sjisArray);
      }

      const imageUrl = `${fontServer}?bcol=${bcol}&pos=${pos}&font=${font}&col=${col}&mark=${sjisText}`;

      const posID = pos.toLowerCase();
      const svgTar = `#mark-${posID}`;

      TweenMax.set('.mark-group g', { autoAlpha: 0 });
      TweenMax.to(svgTar, 0.4, { autoAlpha: 1 });

      $(svgTar).children('image').attr('xlink:href', imageUrl);

      // show order info menu on the bottom right side
      if (!orderMenu.orderInfoActive && text) orderMenu.orderInfo();

      // set value on localStrage and change the order link
      storageValue.mark = sjisText;
      this.setLocalStrage();
      this.orderLinkChange('mark', sjisText);
    }
  }

  markPosPick(event, auto) {
    const $tarEl = event.currentTarget ? $(event.currentTarget) : event;
    const cate = $tarEl.parents('ul').data('cate');
    const pos = $tarEl.data('pos');
    const side = $tarEl.data('side');
    const rotationInfo = $('.js-rotation').data('rotation');
    const colour = $('.js-colour--mark').find('li.active').data('colour');
    const markFont = $('.js-mark-family input:checked').val();

    $.each(markOptions, (index, el) => {
      const $path = $(`#position-${el}`);
      TweenMax.set($path.children().find('path'), { fill: 'none' });
    });

    if (pos) {
      const tar = `#position-${pos.toLowerCase()}`;
      const $el = $(tar).children(markFont).find('path');

      TweenMax.set($el, { fill: colour });
      $('.js-colour--mark').attr('data-target', tar);

      // rotate the item if the mark is positioned on the opposite side
      if (side !== rotationInfo && !auto) this.rotation();
    }

    $('.js-mark-pos a').removeClass('active');
    $tarEl.addClass('active');

    // update localStrage and the order link
    this.orderLinkChange(cate, pos);
    storageValue[cate] = pos;

    this.setLocalStrage();
  }

  markFamily(event) {
    const $tarEl = (event.currentTarget) ? $(event.currentTarget) : event;
    const pos = $('.js-mark-pos a.active').data('pos');
    const code = $('.js-mark-family input:checked').data('code');
    const colour = $('.js-colour--mark').find('li.active').data('colour');
    const markFont = $('.js-mark-family input:checked').val();

    $('.js-mark-family input').prop('checked', false);
    $('.js-mark-family li').removeClass('active');
    $tarEl.prop('checked', true);
    $tarEl.parent().addClass('active');

    if ($tarEl.data('max-lang') === 'en') {
      $('.js-mark-text').addClass('disabled');
      console.log('en');
    } else {
      $('.js-mark-text').removeClass('disabled');
      console.log('em');
    }

    $.each(markOptions, (index, el) => {
      const $path = $(`#position-${el}`);

      TweenMax.set($path.children().find('path'), { fill: 'none' });
    });

    if (pos) {
      const tar = `#position-${pos.toLowerCase()}`;
      const $el = $(tar).children(markFont).find('path');

      TweenMax.set($el, { fill: colour });
    }

    // update localStrage and the order link
    this.orderLinkChange('font', code);

    storageValue.font = code;
    this.setLocalStrage();
  }

  markTab = (event) => {
    const target = $(event.currentTarget).attr('data-tab');

    $('.js-custom-pick-tab').add('.js-mark-tab-trigger').removeClass('active');
    $(target).add(event.currentTarget).addClass('active');
  };

  markSVGRemove = () => {
    $.each(markOptions, (index, el) => {
      const $path = $(`#position-${el}`);
      TweenMax.set($path.children().find('path'), { display: 'none' });
    });
  };

  markSVGShow = () => {
    $.each(markOptions, (index, el) => {
      const $path = $(`#position-${el}`);
      TweenMax.set($path.children().find('path'), { display: 'inherit' });
    });
  };

  reloadPage() {
    const { pos, font, col, mark } = getUrlVars();
    let $posEl;
    let $familyEl;
    let $colEl;

    if (pos) {
      $posEl = $('.js-mark-pos').find(`*[data-pos=${pos}]`);
    } else {
      $posEl = $('.js-mark-pos .active');
    }

    if (font) {
      $familyEl = $('.js-mark-family li').find(`*[data-code=${String(font)}]`);
    } else {
      $familyEl = $('.js-mark-family input:checked');
    }

    if (col) {
      $colEl = $('.js-colour--mark').find(`*[data-code=${col}]`);
    } else {
      $colEl = $('.js-colour--mark').find('li.active');
    }

    this.markPosPick($posEl, true);
    this.markFamily($familyEl);
    this.changeColours($colEl);

    if (mark) this.markTextToCanvas();
  }
}

