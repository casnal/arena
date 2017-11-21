import $ from 'jquery';
import { getUrlVars } from './globals';
import Base from './base.js';
import 'whatwg-fetch';

let eventtype = 'click';

export default class BaseColour extends Base {
	constructor(options) {
		super(options);
		this.jsonUrl = options.jsonUrl || '';
		this.print = options.print || '';
		this.callback = options.callback || '';
		this.colourFunction();
	}

	colourFunction() {
		// JSON データ取得
		fetch(this.jsonUrl, {
			//method: 'get'
			//method: 'POST'
		}).then((response)=> {
			return response.json();
		}).then((data)=> {  
			// 初期化
			const colour_code = data[0].meta.codes;
			// カラーのレベル数を取得する
			$.each(colour_code, ( index, value ) => {
				window['total_colour'] = value.length;
				return false;
			});

			window['keycode_upper'] = 65;
			window['keycode_lower'] = 97;

			for (let i = 1; i <= window['total_colour']; i++) {
				window['colour' + i] = [];
				window['label' + i] = [];
				// DOMに設定用
				window['dom_colour' + i] = [];
				window['dom_label' + i] = [];
			}

			window['colour'] = [];
			window['colour_code_name'] = [];

			$.each(colour_code, ( index, value ) =>{
				// 総合カラーリスト
				const temp = [];

				$.each(value, ( i, v ) => {
					temp.push(v.hex);
				});
				window['colour'].push(temp);
				window['colour_code_name'].push(index);

				// レベル毎のカラーリスト
				for (let i = 1; i <= window['total_colour']; i += 1) {
					if (typeof(value[i-1]) != 'undefined') {
						window[`colour${i}`].push(value[i-1].hex);
						window[`label${i}`].push(value[i-1].label);

						if ($.inArray(value[i-1].hex, window[`dom_colour${i}`]) == -1) {
							window[`dom_colour${i}`].push(value[i-1].hex);
							window[`dom_label${i}`].push(value[i-1].label);
						}
					} else {
						window[`colour${i}`].push('');
						window[`label${i}`].push('');
						console.log(`データが足りていないカラーコードあります：${index}`);
					}
				}
			});

			for (let i = 1; i <= window['total_colour']; i += 1) {
				// DOMに設定
				const ttl = String.fromCharCode(window['keycode_upper'] + (i - 1));
				const target = String.fromCharCode(window['keycode_lower'] + (i - 1));

				let txt;
				if (data[0].meta.gradation) {
					if (i === 1) {
						txt = `
							<div class="colour-section is-border">
								<h5 class="colour-name">${ttl}カラー</h5>
								<ul 
									class="custom-pick__colours js-colour js-colour--gradation colour${i}"
									data-level="${i}"
									data-cate="bcol"
									data-target="#${target}-color"
								>
								</ul>
							</div>
						`;
					} else {
						txt = `
							<div class="colour-section is-border">
								<h5 class="colour-name">${ttl}カラー</h5>
								<ul
									class="custom-pick__colours js-colour colour${i}"
									data-level="${i}"
									data-cate="bcol"
									data-target="#${target}-color"
								>
								</ul>
							</div>
						`;
					}
				} else {
					txt = `
						<div class="colour-section is-border">
							<h5 class="colour-name">${ttl}カラー</h5>
							<ul
								class="custom-pick__colours js-colour colour${i}"
								data-level="${i}"
								data-cate="bcol"
								data-target="#${target}-color"
							>
							</ul>
						</div>
					`;
				}

				$('.js-colour-scheme').append(txt);

				$.each(window[`dom_colour${i}`], ( index, value )=> {
					txt = `<li class="" data-code="" data-colour="${value}" style="background:${value};"></li>`;
					$('.colour' + i).append(txt);
				});
			}

			const txt = '<div class="colour-section"><p id="colour-code" class="colour-code u-text-right"></p></div>';
			$('.js-colour-scheme').append(txt);

			let initialIndex = 0;
			// 初期アクティブ化
			const click_interval = setInterval(()=>{ 
				if (window.location.search && getUrlVars().bcol) {
					const c_data = getUrlVars().bcol;

					$.each(colour_code[c_data], (c_index, c_el)=> {
						const hexCodes = colour_code[c_data][c_index].hex;
						const c_el_child = $(`.js-colour-scheme .colour${c_index+1}`).find(`*[data-colour="${hexCodes}"]`);
						$(c_el_child).trigger(eventtype);
						initialIndex ++;
					});
				} else {
					$('.js-colour-scheme .colour1 li:first-child').trigger(eventtype);
					this.callback();
				}

				clearInterval(click_interval);
			}, 10);

			// 色のボタンをクリック処理
			$('.js-colour-scheme').on(eventtype, 'li', (e) => {
				//e.preventDefault();

				const level = parseInt($(e.currentTarget).parents('ul').attr('data-level'));
				let click_colour = $(e.currentTarget).attr('data-colour');
				let parent_colour = click_colour;
				let available_index = [];

				$(`.colour${level} li`).removeClass('active');
				$(e.currentTarget).addClass('active');
				if (level > 1) {
					let another_parent_colour = $('.colour1 li.active').eq(0).attr('data-colour');

					for (let i = 1; i < level; i++) {
						const colour_index = window[`colour${i}`].multiIndexOf(another_parent_colour);

						if (!available_index.length) {
							available_index = colour_index;
						} else {
							temp = [];
							$.each(available_index, ( index, value ) => {
								if ($.inArray(value, colour_index) !== -1) temp.push(value);
							});
							available_index = temp;
						}

						another_parent_colour = $(`.colour${(i + 1)} li.active`).eq(0).attr('data-colour');
					}
				}

				for (let i = level; i < window['total_colour']; i++) {
					// 下のレベルの色をリセット
					$(`.colour${(i + 1)} li`).removeClass('active');
					$(`.colour${(i + 1)} li`).addClass('hide');

					let colour_index = window[`colour${i}`].multiIndexOf(parent_colour);

					if (!available_index.length) available_index = colour_index;
					
					if (i !== 1) {
						temp = [];
						$.each(available_index, ( index, value ) => {
							if ($.inArray(value, colour_index) !== -1) temp.push(value);
						});
						available_index = temp;
					}

					$.each(available_index, ( index, value ) => {
						// 押下可能な下のレベルの色を表示する
						const next_colour = window[`colour${(i + 1)}`][value];
						$(`.colour${(i + 1)} li[data-colour="${next_colour}"]`).removeClass('hide');
					});

					// 下のレベルの先頭の色にアクティブ化する
					$(`.colour${(i + 1)} li:not(.hide)`).eq(0).addClass('active');
					parent_colour = $(`.colour${(i + 1)} li:not(.hide)`).eq(0).attr('data-colour');
				}
				
				let available_index = [];
				let compare_index = [];

				for (let i = window['total_colour']; i >= 1; i--) {
					const child_colour = $(`.colour${i} li.active`).eq(0).attr('data-colour');

					if (i == window['total_colour']) {
						const available_index = window[`colour${i}`].multiIndexOf(child_colour);
					} else {
						const compare_index = window[`colour${i}`].multiIndexOf(child_colour);
						const temp = [];
						$.each(available_index, ( index, value ) =>{
							if ($.inArray(value, compare_index) !== -1) temp.push(value);
						});
						available_index = temp;
					}
				}

				available_index = available_index[0];
				$('#colour-code').text(`色番:${window['colour_code_name'][available_index]}`);

				Base.storageValue['bcol'] = window['colour_code_name'][available_index];
				Base.orderLink['bcol'] = window['colour_code_name'][available_index];

				this.orderLinkChange('bcol', window['colour_code_name'][available_index]);
				this.setLocalStrage();
				this.restyle();

				if (colour_code[getUrlVars().bcol]) {
					if (colour_code[getUrlVars().bcol].length === initialIndex + 1) this.callback();
				}

				return false;
			});
		}).catch((err) => {
			// Error :(
			alert('error!');
		});

		Array.prototype.multiIndexOf = function (el) { 
		    let idxs = [];
		    for (let i = this.length - 1; i >= 0; i--) {
		        if (this[i] === el) {
		            idxs.unshift(i);
		        }
		    }
		    return idxs;
		};
	}
}

