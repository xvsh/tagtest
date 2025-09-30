resetVariable('tem_scanner', '');
resetVariable('tem_print', '');
resetVariable('tem_GPIO', '');
resetVariable('tem_serial', '');
resetVariable('tem_deviceSetting', '');
resetVariable('tem_RFID', '');
resetVariable('tem_USB', '');
resetVariable('tem_message', '');
// 记录当前已生成的组件编号
resetVariable('Jigsaw_number', 0);
// 记录每个组件的参数状态
resetVariable('Jigsaw_list', []);

function createCell(cell_type) {
	Jigsaw_number++;
	let str = window['tem_' + cell_type];
	let item = $(str).attr('Jigsaw-number', Jigsaw_number);
	$(item).find('[Jigsaw-name]').text(cell_type + '_' + Jigsaw_number);
	Jigsaw_list.push({
		port_state: 'select',
		item_index: Jigsaw_number,
		jigsaw_type: cell_type,
		params: null
	});
	$('.container-box .Jigsaw-skeleton').append($(item));
}

function getTemplate(file) {
	$.get('./assets/templates/' + file + '.txt', function(data) {
		resetVariable('tem_' + file, data);
		createCell(file);
	})
}
// 添加新组件
$('.menu .Jigsaw-skeleton button').on('click', function() {
	// if ($(this).attr('disabled')) {
	// 	$(this).removeAttr('disabled');
	// 	$(this).removeClass('btn-secondary');
	// 	$(this).addClass('btn-outline-info');
	// } else {
	// 	$(this).attr('disabled', true);
	// 	$(this).removeClass('btn-outline-info');
	// 	$(this).addClass('btn-secondary');
	// }


	let cell_type = $(this).attr('Jigsaw-cell');
	if (window['tem_' + cell_type] == '') {
		getTemplate(cell_type);
	} else {
		createCell(cell_type);
	}
})
// 移除当前组件
function removeSelf(item) {
	const parent = $(item).parents('[Jigsaw-type]');
	if ($(parent).find('.serial_status').text() == 'OPEN') {
		alert('串口未关闭');
	} else {
		let attr = $(parent).attr('Jigsaw-number');
		Jigsaw_list = Jigsaw_list.filter(function(f) {
			if (f.item_index != $(parent).attr('Jigsaw-number')) {
				return true
			}
			return false
		})
		$(parent).remove();
	}
}

function runAteb(state) {
	let ateb_type = Jigsaw_list.map((m) => m.jigsaw_type);
	ateb_type = new Set(ateb_type);
	if (ateb_type.size > 0) {
		if ($(state).hasClass('btn-light')) {
			$(state).removeClass('btn-light');
			$(state).addClass('btn-secondary');
			let params = {};
			if (ateb_type.has('scanner')) {
				// params['']
			} else if (ateb_type.has('GPIO')) {

			} else if (ateb_type.has('serial')) {
				params['SerialPort'] = {
					serialPortData: serialPortData
				};
			} else if (ateb_type.has('message')) {

			}
			console.log(params)
			srt_ateb.init(params);
		} else {
			let mark = false;
			//判断当前页面是否存在已开启的串口，判断依据是当存在 serial_status类并且按钮内容为OPEN，或者当存在serial_status类并且存在btn-info类
			if (ateb_type.has('serial')) {
				let btns = $('.serial_status');
				for (let i = 0; i < btns.length; i++) {
					if ($(btns[i]).text() == 'OPEN' || $(btns[i]).hasClass('btn-info')) {
						mark = true;
					}
				}
				if (mark) {
					alert('串口未关闭');
				}
			}
			if (!mark) {
				$(state).removeClass('btn-secondary');
				$(state).addClass('btn-light');
				srt_ateb.dispose();
			}
		}
	} else {
		alert('未创建组件');
	}
	console.log(ateb_type.size);
}
/* serial area start*/
function serialPortData(port, data) {
	console.log(Jigsaw_list)
	for (let i = 0; i < Jigsaw_list.length; i++) {
		if (Jigsaw_list[i].params?.port == port) {
			let textarea = $(".serial_item[Jigsaw-number='" + Jigsaw_list[i].item_index + "'] textarea");
			$(textarea).val('GET: ' + data + '\n' + $(textarea).val());
		}
	}
}

function portChange(btn_item) {
	if ($(btn_item).parents('.serial_item').find('.serial_status').text() == 'OPEN') {
		alert('串口未关闭');
	} else {
		const parent = $(btn_item).parent('.input-group');
		let item_index_ = $(btn_item).parents('.serial_item').attr('Jigsaw-number');
		for (let i = 0; i < Jigsaw_list.length; i++) {
			if (Jigsaw_list[i].item_index == item_index_) {
				if (Jigsaw_list[i].port_state == 'select') {
					Jigsaw_list[i].port_state = 'input';
					parent.addClass('item_hide');
					parent.next().removeClass('item_hide');
				} else {
					Jigsaw_list[i].port_state = 'select';
					$(btn_item).next().val('');
					parent.addClass('item_hide');
					parent.prev().removeClass('item_hide');
				}
			}
		}
	}
}

function serialStatusChange(item) {
	if (srt_ateb.status == 2) {
		let parents = $(item).parents('.card_item_params');
		let btn_sent = $(item).parents('.serial_item').find('.card_item_control button:first');
		let inputs = $(parents).find('.form-control');
		let params = {
			port: $(parents).find('select').val(),
			baudrate: $(inputs[1]).val(),
			databit: $(inputs[2]).val(),
			parity: $(inputs[3]).val(),
			stopbit: $(inputs[4]).val(),
			flowcontrol: $(inputs[5]).val(),
		};
		let item_index_ = $(item).parents('.serial_item').attr('Jigsaw-number');
		for (let i = 0; i < Jigsaw_list.length; i++) {
			if (Jigsaw_list[i].item_index == item_index_) {
				if (Jigsaw_list[i].port_state == 'input') {
					params.port = $(inputs[0]).val();
				}
				Jigsaw_list[i].params = params;
				if (params.port && params.baudrate && params.databit && params.parity && params.stopbit && params.flowcontrol) {
					if ($(item).text() == 'OPEN') {
						$(item).text('CLOSE');
						$(item).removeClass('btn-info');
						$(item).addClass('.btn-secondary');
						$(parents).find('select').removeAttr('disabled');
						$(inputs).removeAttr('disabled');
						$(btn_sent).attr('disabled', true);
						$(btn_sent).removeClass('btn-info');
						$(btn_sent).addClass('.btn-secondary');
						srt_ateb.SerialPort.closePort(params.port);
						// serial_list[i].params = null;
					} else {
						$(item).text('OPEN');
						$(item).removeClass('.btn-secondary');
						$(item).addClass('btn-info');
						$(parents).find('select').attr('disabled', true);
						$(inputs).attr('disabled', true);
						$(btn_sent).removeAttr('disabled');
						$(btn_sent).removeClass('.btn-secondary');
						$(btn_sent).addClass('btn-info');
						srt_ateb.SerialPort.openPort(params.port, +params.baudrate, +params.databit, params.parity, +params.stopbit,
							params.flowcontrol);
					}
				} else {
					alert('参数不完整');
				}
			}
		}
	} else {
		alert('ateb未启动');
	}
}

function itemClear(item) {
	$(item).parents('.serial_item').find('textarea').val('');
	$(item).parents('.card_item_control').find('input').val('');
}

function itemSend(item) {
	let value = $(item).prev().find('input').val();
	if (value) {
		let item_index_ = $(item).parents('.serial_item').attr('Jigsaw-number');
		for (let i = 0; i < Jigsaw_list.length; i++) {
			if (Jigsaw_list[i].item_index == item_index_) {
				let textarea = $(".serial_item[Jigsaw-number='" + Jigsaw_list[i].item_index + "'] textarea");
				$(textarea).val('SEND: ' + data + '\n' + $(textarea).val());
				srt_ateb.SerialPort.transportData(Jigsaw_list[i].params.port, value);
			}
		}
	} else {
		alert('不能发送空值')
	}
}
/* serial area end*/