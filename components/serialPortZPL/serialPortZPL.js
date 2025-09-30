resetVariable('file_content', '');
resetVariable('params', {
	port: '/dev/ttySUSB0',
	baudrate: 9600,
	databit: 8,
	parity: 'None',
	stopbit: 1,
	flowcontrol: 'None'
});

function readFile(zpl) {
	const file = zpl.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function(e) {
			const content = e.target.result;
			$('textarea').eq(0).val(content);
			file_content = content;
		};
		reader.readAsText(file);
	} else {
		$('textarea').eq(0).val('文件取消');
		file_content = '';
	}
}

function clearinp() {
	$('input').eq(0).val('');
	$('textarea').val('');
	file_content = '';
}

function sendData() {
	if (file_content) {
		srt_ateb.SerialPort.transportData('', file_content);
	} else {
		alert('未选择文件');
	}
}

srt_ateb.init({
	SerialPort: {
		serialPortData: function(port, data) {
			$('textarea').eq(1).val('GET: ' + data + ' from "' + port + '"\n' + $('textarea').eq(1).val());
		}
	},
	OnMessage: {
		onMessage: function(data) {
			let res = {};
			try {
				let res = JSON.parse(data);
			} catch (e) {
				res = data;
				console.warn('未解析JSON');
				//TODO handle the exception
			}
			$('textarea').eq(1).val('message: ' + res.message + '\n' + $('textarea').eq(1).val());
		}
	}
});

function serialStatusChange(item) {
	if (srt_ateb.status != 2) {
		alert('srt_ateb init fail');
	} else if ($('input').eq(1).val()) {
		params.port = $('input').eq(1).val();
		if ($(item).text() == 'OPEN') {
			$(item).text('CLOSE');
			$(item).removeClass('btn-info');
			$(item).addClass('.btn-secondary');
			$(item).attr('disabled', true);
			$('input').eq(1).removeAttr('disabled');
			srt_ateb.SerialPort.closePort(params.port);
		} else {
			$(item).text('OPEN');
			$(item).removeClass('.btn-secondary');
			$(item).addClass('btn-info');
			$(item).removeAttr('disabled');
			$('input').eq(1).attr('disabled', true);
			srt_ateb.SerialPort.openPort(params.port, +params.baudrate, +params.databit, params.parity, +params.stopbit,
				params.flowcontrol);
		}
	} else {
		alert('请确认serial port是否为空');
	}
}