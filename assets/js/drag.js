// 获取元素
var dragItem = document.querySelector('.drag-item');
var container = document.querySelector('.container');

// 记录拖动状态的变量
var active = false;
var currentX;
var currentY;
var initialX;
var initialY;
var xOffset = 0;
var yOffset = 0;

// 事件监听器
function dragStart(e) {
	if (e.type === "touchstart") {
		initialX = e.touches[0].clientX - xOffset;
		initialY = e.touches[0].clientY - yOffset;
	} else {
		initialX = e.clientX - xOffset;
		initialY = e.clientY - yOffset;
	}

	if (e.target === dragItem) {
		active = true;
	}
}

function dragEnd(e) {
	initialX = currentX;
	initialY = currentY;
	active = false;
}

function drag(e) {
	if (active) {
		e.preventDefault();
		if (e.type === "touchmove") {
			currentX = e.touches[0].clientX - initialX;
			currentY = e.touches[0].clientY - initialY;
		} else {
			currentX = e.clientX - initialX;
			currentY = e.clientY - initialY;
		}

		xOffset = currentX;
		yOffset = currentY;

		setTranslate(currentX, currentY, dragItem);
	}
}

function setTranslate(xPos, yPos, el) {
	el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}

// 添加事件监听器
dragItem.addEventListener('mousedown', dragStart);
dragItem.addEventListener('touchstart', dragStart);
container.addEventListener('mousemove', drag);
container.addEventListener('touchmove', drag);
container.addEventListener('mouseup', dragEnd);
container.addEventListener('touchend', dragEnd);
container.addEventListener('touchcancel', dragEnd);

// 阻止选中文本
dragItem.addEventListener('mousedown', function() {
	window.getSelection().removeAllRanges();
});