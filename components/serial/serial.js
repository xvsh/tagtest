// function resetVariable(variableName, value) {
// 	if (window[variableName]) { // 检查全局变量是否存在
// 		window[variableName] = value; // 如果存在，重置它的值
// 	} else {
// 		window[variableName] = value; // 如果不存在，声明并赋值
// 	}
// }
// 记录每个区域的参数状态
resetVariable('serial_list', [{
	port_state: 'select',
	item_index: 'default',
	params: null
}]);
// 记录创建数量
resetVariable('serial_item_index', 0);
// 记录当前存在数量
resetVariable('serial_item_count', 1);
resetVariable('SERIAL_ITEM', $('.serial_item').clone());

function portChange(btn_item) {
	if ($(btn_item).parents('.serial_item').find('.serial_status').text() == 'OPEN') {
		alert('串口未关闭');
	} else {
		const parent = $(btn_item).parent('.input-group');
		let item_index_ = $(btn_item).parents('.serial_item').attr('item_index');
		for (let i = 0; i < serial_list.length; i++) {
			if (serial_list[i].item_index == item_index_) {
				if (serial_list[i].port_state == 'select') {
					serial_list[i].port_state = 'input';
					parent.addClass('item_hide');
					parent.next().removeClass('item_hide');
				} else {
					serial_list[i].port_state = 'select';
					$(btn_item).next().val('');
					parent.addClass('item_hide');
					parent.prev().removeClass('item_hide');
				}
			}
		}
	}
}

function removeItem(item) {
	const parent = $(item).parents('.serial_item');
	if ($(parent).find('.serial_status').text() == 'OPEN') {
		alert('串口未关闭');
	} else {
		let attr = $(parent).attr('item_index');
		$(".serial_item[item_index='" + attr + "']").remove();
		serial_item_count--;
		if (serial_item_count == 0) {
			serial_item_index = -1;
		}
		serial_list = serial_list.filter(function(f) {
			if (f.item_index != $(parent).attr('item_index')) {
				return true
			}
			return false
		})
	}
}

function addItem() {
	serial_item_count++;
	serial_item_index++;
	let new_item = $(SERIAL_ITEM).clone();
	if (serial_item_index > 0) {
		$(new_item).attr('item_index', serial_item_index);
		$(new_item).find('.home').text('SERIAL - ' + serial_item_index);
		serial_list.push({
			port_state: 'select',
			item_index: serial_item_index,
			params: null
		});
	} else {
		serial_list = [{
			port_state: 'select',
			item_index: 'default',
			params: null
		}];
	}
	$('#serial_add').before($(new_item));
}

srt_ateb.init({
	SerialPort: {
		serialPortData: function(port, data) {
			for (let i = 0; i < serial_list.length; i++) {
				if (serial_list[i].params.port == port) {
					let textarea = $(".serial_item[item_index='" + serial_list[i].item_index + "'] textarea");
					$(textarea).val('GET: ' + data + '\n' + $(textarea).val());
				}
			}
		}
	},
	OnMessage: {
		onMessage: function(data) {
			let res = JSON.parse(data);
			for (let i = 0; i < serial_list.length; i++) {
				if (serial_list[i].params.port == res.port) {
					let textarea = $(".serial_item[item_index='" + serial_list[i].item_index + "'] textarea");
					$(textarea).val('message: ' + res.message + '\n' + $(textarea).val());
				}
			}
		}
	}
});

function serialStatusChange(item) {
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
	let item_index_ = $(item).parents('.serial_item').attr('item_index');
	for (let i = 0; i < serial_list.length; i++) {
		if (serial_list[i].item_index == item_index_) {
			if (serial_list[i].port_state == 'input') {
				params.port = $(inputs[0]).val();
			}
			serial_list[i].params = params;
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
}

function itemClear(item) {
	$(item).parents('.serial_item').find('textarea').val('');
	$(item).parents('.card_item_control').find('input').val('');
}

function itemSend(item) {
	let value = $(item).prev().find('input').val();
	if (value) {
		let item_index_ = $(item).parents('.serial_item').attr('item_index');
		for (let i = 0; i < serial_list.length; i++) {
			if (serial_list[i].item_index == item_index_) {
				let textarea = $(".serial_item[item_index='" + serial_list[i].item_index + "'] textarea");
				$(textarea).val('SEND: ' + value + '\n' + $(textarea).val());
				srt_ateb.SerialPort.transportData(serial_list[i].params.port, value);
			}
		}
	} else {
		alert('不能发送空值')
	}
}