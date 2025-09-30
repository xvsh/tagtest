resetVariable('todoInput', document.getElementById('todo-input'));
resetVariable('addBtn', document.getElementById('add-btn'));
resetVariable('todoList', document.getElementById('todo-list'));
resetVariable('lockBtn', document.getElementById('lock-btn'));

resetVariable('labelInput', document.getElementById('label-input'));
resetVariable('labelList', document.getElementById('label-list'));

resetVariable('clearBtn', document.getElementById('clear'));
resetVariable('exportBtn', document.getElementById('export'));

resetVariable('ssiSettings', document.getElementById('ssi-settings'));
resetVariable('nameInput', document.getElementById('name-input'));
resetVariable('startBtn', document.getElementById('start-btn'));
resetVariable('hidInput', document.getElementById('hid'));

resetVariable('locked', false);
resetVariable('open', false);
resetVariable('todoCounter', 1);
resetVariable('labelCounter', 1);
resetVariable('firstDate', '');
resetVariable('prevDate', '');
resetVariable('times_interval', '');
resetVariable('prev_times', 0);

resetVariable('minInterval', 0);
resetVariable('Average', 0);
resetVariable('times', 0);
resetVariable('scanCount', 0);
resetVariable('correctCount', 0);
resetVariable('errorCount', 0);
resetVariable('accuracyRate', 0);
resetVariable('errorRate', 0);

function init() {
	labelInput.disabled = !locked;
	clearBtn.disabled = !locked;
	exportBtn.disabled = !locked;
	nameInput.value = '/dev/ttyACM0';
}
init();


function addItem(inputElement, listElement, allowDelete = true, isLabel = false, isWrong = false) {
	if (inputElement.value.trim() !== '') {
		const li = document.createElement('li');
		li.innerHTML = `
            ${(isLabel ? labelCounter++ : '')}
            ${isLabel ? '.' : ''} 
            ${inputElement.value} 
            ${isLabel ? new Date().toLocaleString() + '\t' + new Date().getMilliseconds() : ''}
            ${allowDelete ? '<button class="delete-btn">Delete</button>' : ''}`;

		if (isWrong) {
			li.className += 'error-item';
		}
		listElement.appendChild(li);

		inputElement.value = '';

		if (allowDelete) {
			li.querySelector('.delete-btn').addEventListener('click', function() {
				listElement.removeChild(li);
			});
		}

	}
}

addBtn.addEventListener('click', function() {
	if (!locked) {
		addItem(todoInput, todoList);
	}
});

todoInput.addEventListener('keypress', function(e) {
	if (e.key === 'Enter' && !locked) {
		addItem(todoInput, todoList);
	}
});

labelInput.addEventListener('keypress', function(e) {
	if (e.key === 'Enter') {
		const templateList = document.querySelector('.templateList').querySelectorAll('li');
		const templateValueList = Array.from(templateList).map(li => {
			// 获取 <li> 元素的所有文本内容
			const text = li.textContent.trim();
			// 去除 "Delete" 文本，假设每个 <li> 元素只有一个 "Delete" 按钮
			const cleanedText = text.replace(/Delete$/, '').trim();
			return cleanedText;
		});
		if (!templateValueList.includes(labelInput.value)) {
			addItem(labelInput, labelList, false, true, true);
		} else {

			addItem(labelInput, labelList, false, true, false);
		}
		calculatingFunction();
	}
});

lockBtn.addEventListener('click', function() {
	locked = !locked;
	lockBtn.classList.toggle('locked');
	lockBtn.textContent = locked ? 'Unlock' : 'Lock';
	todoInput.disabled = locked;
	addBtn.disabled = locked;
	labelInput.disabled = !locked;
	clearBtn.disabled = !locked;
	exportBtn.disabled = !locked;
	const delBtn = document.querySelectorAll('.delete-btn');
	delBtn.forEach(btn => btn.disabled = locked);
});

clearBtn.addEventListener('click', function() {
	// todoList.innerHTML = '';
	labelList.innerHTML = '';
	// todoCounter = 1;
	labelCounter = 1;

	firstDate = '';
	prevDate = '';
	minInterval = 0;
	Average = 0;
	times = 0;
	prev_times = 0;
	window.clearInterval(times_interval);

	const minIntervalElement = document.querySelector('#minInterval');
	const AverageElement = document.querySelector('#Average');
	const timesElement = document.querySelector('#times');
	const scanCountElement = document.querySelector('#scanCount');
	const correctCountElement = document.querySelector('#correctCount');
	const errorCountElement = document.querySelector('#errorCount');
	const accuracyRateElement = document.querySelector('#accuracyRate');
	const errorRateElement = document.querySelector('#errorRate');

	minIntervalElement.innerHTML = `Min Interval(ms)：${0} `;
	AverageElement.innerHTML = `Average(s)：${0} `;
	timesElement.innerHTML = `time/s：${0}/s `;
	scanCountElement.innerHTML = `Scan Count：${0} `;
	correctCountElement.innerHTML = `Correct Count：${0} `;
	errorCountElement.innerHTML = `Error Count：${0} `;
	accuracyRateElement.innerHTML = `Accuracy Rate：${0} %`;
	errorRateElement.innerHTML = `Error Rate：${0} %`;
});

document.querySelectorAll('input[name="mode"]').forEach(radio => {
	radio.addEventListener('change', function() {
		if (this.id === 'ssi') {
			ssiSettings.classList.add('active');
		} else {
			ssiSettings.classList.remove('active');
		}
	});
});

nameInput.addEventListener('input', function() {
	startBtn.disabled = !this.value.trim();
});

startBtn.addEventListener('click', function() {
	if (this.classList.contains('active')) {
		// Reset to default state
		closePort();
		this.classList.remove('active');
		this.textContent = 'open';
		nameInput.disabled = false;
		hidInput.disabled = false;
	} else {
		// Change to active state
		openPort();
		this.classList.add('active');
		this.textContent = 'close';
		nameInput.disabled = true;
		hidInput.disabled = true;
	}
});
exportBtn.addEventListener('click', function() {
	const labelList_ = document.querySelector('.labelList').querySelectorAll('li');
	const templateValueList = Array.from(labelList_).map(li => {
		// 获取 <li> 元素的所有文本内容
		const text = li.innerText;
		// 去除 "Delete" 文本，假设每个 <li> 元素只有一个 "Delete" 按钮
		return text;
	});
	downloadtext(templateValueList, 'list.txt');
});

function downloadtext(file, name) {
	if (file) {
		// 创建一个Blob对象，类型为纯文本
		let blob = new Blob([file.join('\n')], {
			type: 'text/plain;charset=utf-8'
		});
		// 创建一个指向Blob对象的URL
		let url = URL.createObjectURL(blob);
		// 创建一个a标签并设置下载属性
		let downloadLink = document.createElement("a");
		downloadLink.href = url;
		downloadLink.download = name; // 下载文件的名称
		// 触发下载
		downloadLink.click();
		// 清理URL对象
		URL.revokeObjectURL(url);
	}
}

function findFocusedInput(inputElements) {
	const focusedIndex = Array.from(inputElements).findIndex(input => input === document.activeElement);
	if (focusedIndex === -1) {
		alert('无聚焦输入框，请选择输入框');
	}
	return focusedIndex;
}


function triggerEnterEvent(inputElement) {
	console.log("start triggerEnterEvent");
	// 创建回车键事件
	var enterEvent = new KeyboardEvent('keydown', {
		key: 'Enter',
		bubbles: true,
		cancelable: true
	});
	inputElement.dispatchEvent(enterEvent);
}

function todoKeyevent(e) {
	if (e.key === 'Enter') {
		addItem(todoInput, todoList);
	}

}

function labelKeyevent(e) {
	if (e.key === 'Enter') {
		const templateList = document.querySelector('.templateList').querySelectorAll('li');
		const templateValueList = Array.from(templateList).map(li => {
			// 获取 <li> 元素的所有文本内容
			const text = li.textContent.trim();
			// 去除 "Delete" 文本，假设每个 <li> 元素只有一个 "Delete" 按钮
			const cleanedText = text.replace(/Delete$/, '').trim();
			return cleanedText;
		});
		if (!templateValueList.includes(labelInput.value)) {
			addItem(labelInput, labelList, false, true, true);
		} else {
			addItem(labelInput, labelList, false, true, false);
		}
		calculatingFunction();
	}


}

function calculatingFunction() {
	scanCount = document.querySelector('.labelList').querySelectorAll('li').length;
	correctCount = scanCount - document.querySelector('.labelList').querySelectorAll('.error-item').length;
	errorCount = document.querySelector('.labelList').querySelectorAll('.error-item').length;
	accuracyRate = correctCount / scanCount * 100;
	errorRate = errorCount / scanCount * 100;

	if (!firstDate) {
		firstDate = new Date();
		times_interval = setInterval(function() {
			times = scanCount - prev_times;
			prev_times = scanCount;
		}, 1000);
	} else if (!prevDate) {
		let current = new Date();
		minInterval = current - firstDate;
		prevDate = current;
		Average = (scanCount / minInterval).toFixed(4);
	} else {
		let current = new Date();
		let curr = current - prevDate;
		if (minInterval > curr) {
			minInterval = curr;
		}
		prevDate = current;
		Average = (scanCount / (current - firstDate)).toFixed(4);
	}

	const minIntervalElement = document.querySelector('#minInterval');
	const AverageElement = document.querySelector('#Average');
	const timesElement = document.querySelector('#times');
	const scanCountElement = document.querySelector('#scanCount');
	const correctCountElement = document.querySelector('#correctCount');
	const errorCountElement = document.querySelector('#errorCount');
	const accuracyRateElement = document.querySelector('#accuracyRate');
	const errorRateElement = document.querySelector('#errorRate');

	minIntervalElement.innerHTML = `Min Interval(ms)：${minInterval} `;
	AverageElement.innerHTML = `Average(s)：${Average} `;
	timesElement.innerHTML = `time/s：${times}/s `;
	scanCountElement.innerHTML = `Scan Count：${scanCount} `;
	correctCountElement.innerHTML = `Correct Count：${correctCount} `;
	errorCountElement.innerHTML = `Error Count：${errorCount} `;
	accuracyRateElement.innerHTML = `Accuracy Rate：${accuracyRate.toFixed(2)} %`;
	errorRateElement.innerHTML = `Error Rate：${errorRate.toFixed(2)} %`;
}

function openPort() {
	if (nameInput.value) {
		srt_ateb.SerialPort.openPort(nameInput.value, 9600, 8, 'None', 1, 'None');

	} else {
		alert('Please Enter A Serial Port Name');
	}
}

function closePort() {
	srt_ateb.SerialPort.openPort(nameInput.value);
}

function baseConversion(data) {
	let val = "";
	let arr = data.split(/[,\s]/g);
	for (let i = 0; i < arr.length; i++) {
		val += String.fromCharCode(parseInt(arr[i], 16));
	}
	return val;
}

srt_ateb.init({
	SerialPort: {
		serialPortData: (port, data) => {
			console.log(data);
			const currentInputIndex = findFocusedInput([todoInput, labelInput]);
			console.log(currentInputIndex);
			switch (currentInputIndex) {
				case -1:
					break;
				case 0:
					todoInput.value = baseConversion(data);
					triggerEnterEvent(todoInput);
					break;
				case 1:
					labelInput.value = baseConversion(data);
					triggerEnterEvent(labelInput);
					break;
				default:
					return;
			}
		}
	}
});
window.addEventListener('beforeunload', function() {
	window.clearInterval(times_interval);
})
