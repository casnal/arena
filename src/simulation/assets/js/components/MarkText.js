import $ from 'jquery';
import { TweenMax } from 'gsap';

import Component from './Component';
import OrderMenu from './OrderMenu';
import { spinner } from '../app/Loader';

const Encoding = require('encoding-japanese');

export default class MarkText extends Component {
  constructor(props) {
    super(props);

    this.render();
  }

  render() {
    this.events();
  }

  events() {
    $('.mark-text__form').on(window.eventtype, '.js-mark-submit', (e) => {
      e.preventDefault();
      spinner.in();
      this.setData(e);
    });
  }

  load(props) {
    const { e, jdata, text, line, data } = props;

    $.ajax({
      url: jdata,
      dataType: 'json',
    })
      .done((formData) => {
        const validation = formData.validate;

        if (validation) {
          this.markTextToCanvas(text, line, data);
          $('.form-message').html('');
        } else {
          const message = formData.message;

          $('.form-message').html(message);
        }
      })
      .fail(() => {
        console.log('error');
      })
      .always(() => {
        spinner.out();
        console.log('complete');
      });
  }

  setData(e) {
    const $container = $(e.currentTarget).parent();
    const text = $container.find('.js-mark-text').val();
    const encodedText = encodeURIComponent(text);
    const line = $container.find('.js-mark-text').data('line') || '';

    this.getMarkData().then((data) => {
      const { language, length } = data;
      const jdata = `/simulation/validation/?lang=${language}&max=${length}&text=${encodedText}&json`;
      this.load({ e, jdata, text, line, data });
    });
  }

  markTextToCanvas(text, line, data) {
    const { posA, posB, fontA, fontB, colA, colB, ecolA, ecolB, bcol } = Component.storageValue;

    console.log(Component.storageValue);
    console.log(data);

    const dir = $('.mark-simulation').find('.js-rotation').data('rotation');

    const markNum = dir === 'front' ? 'markA' : 'markB';
    const mark = `${markNum}${line}`;

    let posBupdated;
    let fontBupdated;
    let colBupdated;
    let ecolBupdated;

    if (data) {
      const { position, family, ccode, ecode } = data;

      posBupdated = posB || position;
      fontBupdated = fontB || family.replace('.mrk', '');
      colBupdated = colB || ccode;
      ecolBupdated = ecolB || ecode;
    } else {
      posBupdated = posB;
      fontBupdated = fontB;
      colBupdated = colB;
      ecolBupdated = ecolB;
    }

    const pos = dir === 'front' ? posA : posBupdated;
    const font = dir === 'front' ? fontA : fontBupdated;
    const col = dir === 'front' ? colA : colBupdated;
    const ecol = dir === 'front' ? ecolA : ecolBupdated;

    const str = text || Component.storageValue[mark];

    // convert text from UTF-8 to SJIS
    if (str) {
      const strArray = Encoding.stringToCode(str);
      const sjisArray = Encoding.convert(strArray, 'SJIS', 'UNICODE');
      const sjisText = Encoding.urlEncode(sjisArray);
      const fontServer = 'https://mark.arena-jp.com/simulation/servlet/MarkSample3';

      const posID = pos.toLowerCase();
      const svg = `#mark-${posID}`;
      const url = `${fontServer}?bcol=${bcol}&pos=${pos}&font=${font}&col=${col}&ecol=${ecol}&mark=${sjisText}`;

      if (posID === 'w' && line !== 2) {
        const svgAlt = '#mark-g';
        const urlAlt = `${fontServer}?bcol=${bcol}&pos=G&font=${font}&col=${col}&ecol=${ecol}&mark=${sjisText}`;

        $(svgAlt).children('image').attr('xlink:href', urlAlt);
        TweenMax.to(svgAlt, 0.4, { autoAlpha: 1 });
      } else {
        if (line !== 2) TweenMax.set('.mark-group g', { autoAlpha: 0 });
        $(svg).children('image').attr('xlink:href', url);
        TweenMax.to(svg, 0.4, { autoAlpha: 1 });
      }
    }

    // show order info menu on the bottom right side
    if (!OrderMenu.orderInfoActive && text) OrderMenu.orderInfo();

    // set value on localStrage and change the order link
    Component.storageValue[mark] = str;
    this.setLocalStrage();
    this.orderLinkChange(mark, str);
  }
}

Component.MarkText = MarkText;
