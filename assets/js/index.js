//当前渲染的内容
let page_id = '';
//当前画面可能包含的标签
let tag_list = [];
let default_config = {};
let ateb_detail = [];
let ateb_module = {};
let ateb_version = {};

eruda.init();

function toHome() {
	let mark = false;
	//判断当前页面是否存在已开启的串口，判断依据是当存在 serial_status类并且按钮内容为OPEN，或者当存在serial_status类并且存在btn-info类
	if (tag_list.includes('serial')) {
		let btns = $('.serial_status');
		for (let i = 0; i < btns.length; i++) {
			if ($(btns[i]).text() == 'OPEN' || $(btns[i]).hasClass('btn-info')) {
				mark = true;
			}
		}
		if (mark) {
			alert('串口未关闭')
		}
	}
	// 未发现标记，允许返回首页
	if (!mark) {
		page_id = 'default';
		tag_list = [];
		$('select').attr('disabled', true);
		$('#main_js').remove();
		getHtml('default').then(function(res) {
			$('.card-box').html(res);
			getJson('module').then(function(data) {
				ateb_module = data;
				renderHome();
			});
			getJson('version').then(function(data) {
				ateb_version = data;
				renderSelect();
				renderVersion();
			});
		});
		$('select').removeAttr('disabled');
		renderHome();
		renderVersion();
	}
}

function getJson(id) {
	return new Promise(function(resolve, reject) {
		$.getJSON('./assets/json/' + id + '.json', function(res) {
			resolve(res);
		});
	})
}

function renderHome() {
	for (let key in ateb_module) {
		$('.card-box .col-4').append($('<button class="btn btn-info home_item" onclick="viewItem(\'' + key + '\')">' +
			key + '</button>'));
	}
}

function renderSelect() {
	let opt = '';
	let selected_v = 'debug';
	for (let key in ateb_version) {
		if (ateb_version[key].selected) {
			selected_v = key;
		}
		opt += '<option value="' + key + '">' + key + '</option>';
	}
	$('.home+div>select').html(opt);
	$('select').val(selected_v);
}

function renderVersion() {
	let version = $('select').val();
	if (ateb_version[version]) {
		const item = ateb_version[version];
		let str = '<dt>atebjs_' + item.version + '</dt><dd>' + item.description +
			'</dd><dd><b>操作手册：</b><a href="./assets/file/AtebJs使用手册V' + item.file + '.pdf" class="btn btn-link">下载</a></dd>';
		// 渲染新增模块
		if (item.new_list && item.new_list.length) {
			let flag = false;
			for (let i = 0; i < ateb_detail.length; i++) {
				if (item.new_list.includes(ateb_detail[i].title)) {
					flag = true;
					str += '<dt class="new_tag">模块：' + ateb_detail[i].title + '</dt><dd>' + ateb_detail[i].description +
						'</dd><dt>--方法名：</dt>';
					const itemmethod = ateb_detail[i].method;
					for (let j = 0; j < itemmethod.length; j++) {
						str += '<dd class="new_tag"><i><b>' + itemmethod[j].title + '：</b>' + itemmethod[j].description +
							'</i></dd>';
					}
				}
			}
			flag && (str += '<hr>');
		}
		for (let i = 0; i < ateb_detail.length; i++) {
			let new_flag = item.new_list.includes(ateb_detail[i].title);
			if (item.select_list.includes(ateb_detail[i].title) && !new_flag) {
				str += '<dt>模块：' + ateb_detail[i].title + '</dt><dd>' + ateb_detail[i].description + '</dd><dt>--方法名：</dt>';
				const itemmethod = ateb_detail[i].method;
				for (let j = 0; j < itemmethod.length; j++) {
					if (!itemmethod[j].version || version.includes(itemmethod[j].version)) {
						if (!item.hide_list || !item.hide_list.includes(ateb_detail[i].title + ':' + itemmethod[j].title)) {
							// 判断模块中新增的参数
							if (item.new_list && item.new_list.includes(ateb_detail[i].title + ':' + itemmethod[j].title)) {
								str += '<dd class="new_tag"><i><b>' + itemmethod[j].title + '：</b>' + itemmethod[j].description +
									'</i></dd>';
							} else {
								str += '<dd><i><b>' + itemmethod[j].title + '：</b>' + itemmethod[j].description + '</i></dd>';
							}
						} else {
							// 隐藏的内容
						}
					} else {
						// 低于版本的方法
					}
				}
			}
		}
		$('.version_box').html(str);
	} else {
		alert('请补充版本信息');
	}

}
// 获取模块信息
function getHtml(id) {
	page_id = id;
	return new Promise(function(resolve, reject) {
		$.get('./components/' + id + '/' + id + '.html', function(res) {
			resolve($(res).html());
		});
	})
}
// 渲染模块信息
function renderHtml(item) {
	tag_list = item.tags;
	getHtml(item.id).then(function(res) {
		if (res) {
			$('select').attr('disabled', true);
			$('#main_js').remove();
			$('#insert_mark').before($('<script src="./assets/js/srt_ateb_' + $('select').val() +
				'.min.js" id="main_js"></script>'));
			$('.card-box').html(res);
		} else {
			alert('暂无模板');
		}
	});
}

getJson('ateb').then(function(data) {
	ateb_detail = data;
});
getHtml('default').then(function(res) {
	if (res) {
		$('.card-box').html(res);
		getJson('module').then(function(data) {
			ateb_module = data;
			renderHome();
		});
		getJson('version').then(function(data) {
			ateb_version = data;
			renderSelect();
			renderVersion();
		});
	} else {
		alert('暂无模板');
	}
});

function viewItem(key) {
	let str = '';
	if (ateb_module[key].tags && ateb_module[key].tags.length > 0) {
		str += '</dd><dd><b>标签：</b>';
		for (let i = 0; i < ateb_module[key].tags.length; i++) {
			const opt = ateb_module[key].tags[i];
			str += '<span class="badge text-bg-info">' + opt + '</span>';
		}
	}
	if (ateb_module[key].link) {
		$('.card-box .col-3').html(
			'<dt>' + ateb_module[key].title + '</dt><dd><b>功能描述：</b>' + ateb_module[key].description + str +
			'</dd><dd><b>链接：</b><a class="btn btn-link" href="' + ateb_module[key].link +
			'" target="_blank">跳转</a></dd>'
		);
	} else {
		let obj = JSON.stringify({
			id: ateb_module[key].id,
			tags: ateb_module[key].tags
		});
		$('.card-box .col-3').html(
			'<dt>' + ateb_module[key].title + '</dt><dd><b>功能描述：</b>' + ateb_module[key].description + str +
			'</dd><dd><b>链接：</b><button class="btn btn-link" onclick=\'renderHtml(' + obj +
			')\'>跳转</button></dd>'
		);
	}
}

function resetVariable(variableName, value) {
	if (window[variableName]) { // 检查全局变量是否存在
		window[variableName] = value; // 如果存在，重置它的值
	} else {
		window[variableName] = value; // 如果不存在，声明并赋值
	}
}