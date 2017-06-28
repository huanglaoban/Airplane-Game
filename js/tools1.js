// 定义函数，将元素查找方式封装起来
// getElementById()				#id
// getElementsByTagName()		tagName
// getElementsByClassName()		.className
// 参数：
//		select : 查找元素的选择器，可以为 id、类、元素选择器
//		context : 查询上下文对象
function $(selector, context) {
	// console.log(context); // 未传递context参数，默认值为undefined
	context = context || document;

	if (selector.indexOf("#") === 0) // id 查询
		return document.getElementById(selector.slice(1));
	if (selector.indexOf(".") === 0) // 根据类名查询
		// return context.getElementsByClassName(selector.slice(1));
		return getElementsByClass(selector.slice(1), context);
	return context.getElementsByTagName(selector);
	// if (selector.slice(0,1) === "#")
	// if (selector.charAt(0) === "#")
	// if (selector[0] === "#")
	// if (selector.startsWidth("#"))
}

// 解决 getElementsByClassName() 方法兼容问题
// 参数：
//		className : 类名
//		context : 查询上下文对象
function getElementsByClass(className, context) {
	context = context || document;
	if (context.getElementsByClassName)  // 支持使用 getElementsByClassName() 方法 
		return context.getElementsByClassName(className);

	/* 不支持使用 getElementsByClassName() */
	// 保存查找到的元素的数组结构
	var result = [];
	// 在查找上下文中查询出所有元素
	var tags = context.getElementsByTagName("*");
	// 遍历每一个元素，判断是否存在查询的类名
	for (var i = 0, len = tags.length; i < len; i++) {
		// 获取当前遍历到元素的所有类名
		var classNames = tags[i].className.split(" ");
		var index = inArray(className, classNames);
		if (index !== -1) // 当前遍历到的元素标签是要查找的标签
			result.push(tags[i]);
	}
	// 返回查找结果的数组
	return result;
}

// 查找 value 在 array 数组中的索引
// 参数：
// 		value: 元素
//		array: 数组
// 返回值：
//		查找到的索引，-1表示未查找到
function inArray(value, array) {
	if (Array.prototype.indexOf) // 支持使用数组的 indexOf() 方法
		return array.indexOf(value);
	/* 不支持数组 indexOf() 方法 */
	for (var i = 0, len = array.length; i < len; i++) {
		if (array[i] === value) // 找到
			return i;
	}

	return -1; // 未找到
}

// 封装用于获取/设置CSS属性的函数
function css(element, attr, value) {
	// 获取
	if (typeof attr === "string" && !value)
		return window.getComputedStyle 
				? getComputedStyle(element)[attr]
				: element.currentStyle[attr];
	// 设置CSS样式
	if (typeof attr === "string" && value)
		element.style[attr] = value; // 使用内联样式设置CSS
	else if (typeof attr === "object") {
		for (var prop in attr) {
			element.style[prop] = attr[prop];
		}
	}
}

// 封装函数，实现事件监听注册
// 解决addEventListener与attachEvent兼容
function on(element, type, callback) {
	if (element.addEventListener) { // 支持addEventListener方法的使用
		if (type.indexOf("on") === 0)
			type = type.slice(2);
		element.addEventListener(type, callback);
	} else { // 不支持，则使用 attachEvent
		if (type.indexOf("on") !== 0)
			type = "on" + type;
		element.attachEvent(type, callback);
	}
}

// 获取/设置指定元素在文档中的定位坐标
// 参数：
//		element: DOM元素对象
//		coordinates: 可选，待设置的元素在文档中的定位坐标
// 返回值：
// 		坐标对象，有两个属性：{top, left}
function offset(element, coordinates) {
	var _top = 0,
		_left = 0,
		current = typeof coordinates === "object" 
					? element.offsetParent 
					: element; // 当前待求解在文档中定位坐标的元素
	// 累加计算 current 所代表的元素在文档中的定位坐标
	while (current !== null) {
		_top += current.offsetTop;
		_left += current.offsetLeft;
		current = current.offsetParent;
	}

	if (typeof coordinates !== "object") { // 获取元素在文档中定位坐标
		return {
			top : _top,
			left : _left
		};
	} else { // 为指定的 element 元素设置定位坐标
		css(element, {
			top : coordinates.top - _top + "px",
			left : coordinates.left - _left + "px"
		});
	}
}

function innerWidth(element) {
	return element.clientWidth;
	// 有待完善
}

function innerHeight(element) {
	return element.clientHeight;
	// 有待完善
}

function outerWidth(element) {
	return element.offsetWidth;
}

function outerHeight(element) {
	return element.offsetHeight;
}

// 获取/设置 cookie
// 
// 参数：
//		key: cookie名称
//		value: 可选参数，cookie值
//		options: 可选参数，其它可配置信息，如：
//			{expires:7, path:"/", domain:"xxx.baidu.com", secure:true}
// 返回值：
//		对于获取操作，返回 key 名称所对应的 cookie 值，如果未查找到，则返回null
//		对于设置 cookie暂无返回值
function cookie(key, value, options) {
	if (typeof value !== "undefined") { // write
		options = options || {};
		// 最基本的名值对结构
		var cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value);
		// 判断是否有设置失效时间
		if (typeof options.expires === "number") { // 有设置失效时间天数
			var date = new Date();
			date.setDate(date.getDate() + options.expires);
			cookie += ";expires=" + date.toUTCString();
		}
		// 判断是否有设置路径 
		if (options.path)
			cookie += ";path=" + options.path;
		// 判断是否有设置主机
		if (options.domain)
			cookie += ";domain=" + options.domain;
		// 判断是否有设置安全链接
		if (options.secure)
			cookie += ";secure";
		// 保存 cookie
		document.cookie = cookie;
	} else { // read
		var cookies = document.cookie.split("; ");
		for (var i = 0, len = cookies.length; i < len; i++) {
			var cookie = cookies[i].split("=");
			var name = decodeURIComponent(cookie.shift()); // cookie名
			if (name === key) { // 查找到 cookie 信息
				return decodeURIComponent(cookie.join("="));
			}
		}
		// 未查找到，则返回 null
		return null;
	}
}

function removeCookie(key, options) {
	options = options || {};
	options.expires = -1;
	cookie(key, "", options);
}

// 显示指定的元素
function show(element) {
	css(element, "display", "block");
}

// 隐藏指定的元素
function hide(element) {
	css(element, "display", "none");
}

// 运动函数框架
// 参数：
//		element：待实现运动动画效果的元素
//		options: 实现运动效果的属性对象
//			{width:500, height:100, top:500, left:300}
//		speed：限定的运动总时长
//		fn：可选，函数，是在运动动画结束后要执行的函数
function animate(element, options, speed, fn) {
	// 先清除element元素上已有的运动动画效果
	clearInterval(element.timer);
	// 定义变量保存各属性运动初始值、运动区间
	var start = {}, range = {};
	// 为start与range对象初始化属性
	for (var attr in options) {
		// 为当前遍历到 attr 属性设置初始值
		start[attr] = parseFloat(css(element, attr));
		// 区间
		range[attr] = options[attr] - start[attr];
	}
	// 记录运动起始时间
	var startTime = +new Date();
	// 启动计时器，实现运动动画效果
	element.timer = setInterval(function(){
		// 各属性运动消耗时间
		var elapsed = Math.min(+new Date() - startTime, speed);
		// 为各属性计算运动当前值
		for (var attr in options) {
			// 根据公式计算
			var result = elapsed * range[attr] / speed + start[attr];
			// 设置当前attr属性值
			element.style[attr] = result + (attr == "opacity" ? "" : "px");
		}
		// 判断，取消计时器
		if (elapsed == speed) {
			clearInterval(element.timer);
			// 如果有运动结束后要执行的函数，则调用
			fn && fn();
		}
	}, 1000/60);
}

// 淡入
function fadeIn(element, speed, fn) {
	css(element, {
		opacity: 0,
		display: "block"
	});

	animate(element, {opacity:1}, speed, fn);
}

// 淡出
function fadeOut(element, speed, fn) {
	animate(element, {opacity:0}, speed, function(){
		css(element, "display", "none");
		fn && fn();
	});
}

/* 封装 ajax 函数
	参数：
		options = {
			url:"", // URL
			type:"", // get 或 post，默认 get
			data:{}, // 向服务器提交的数据
			async: true, // 是否异步，默认 true
			dataType: "json", // 预期从服务器返回的数据类型, text|json|jsonp
			success: function(data){}, // 请求成功时执行的函数
			error: function(err){}, // 请求失败时执行的函数
			complete: function(xhr){} // 不管成功或失败都要执行的函数
		}
 */
function ajax(options) {
	options = options || {};
	var url = options.url;
	if (!url) // 不存在访问的服务器URL，则结束函数执行
		return;


	var method = options.type || "get"; // 请求方式，默认get
	var async = typeof options.async == "boolean" ? options.async : true;
	// 判断是否有向服务器传递数据
	var param = null;
	if (options.data) { // 有向服务器传递数据，连接查询字符串结构
		param = [];
		for (var attr in options.data) {
			param.push(attr + "=" + options.data[attr]);
		}
		param = param.join("&");
	}
	// 判断请求方式，连接查询字符串
	if (method == "get" && param){
		url += "?" + param;
		param = null;
	}

	if (options.dataType == "jsonp") {
		var _script = document.createElement("script");
		_script.src = url;
		$("body")[0].appendChild(_script);
		$("body")[0].removeChild(_script);
		return;
	}

	// 创建核心对象
	var xhr = new XMLHttpRequest();
	// 建立连接，打开
	xhr.open(method, url, async);
	// 设置post请求时发送数据的头信息
	if (method == "post")
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	// 发送请求
	xhr.send(param);
	// 处理响应
	if (async) { // 异步
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4) {
				// 如果有无论成功失败都要执行的函数，则调用
				options.complete && options.complete(xhr);
				if(xhr.status == 200) { // 请求成功
					// 获取响应数据
					var data = xhr.responseText;
					if (options.dataType == "json")
						data = JSON.parse(data);
					// 处理响应数据
					options.success && options.success(data);
				} else { // 请求失败
					options.error && options.error(xhr.statusText);
				}
			}
		}
	} else { // 同步
		// 如果有无论成功失败都要执行的函数，则调用
		options.complete && options.complete(xhr);
		if(xhr.status == 200) { // 请求成功
			// 获取响应数据
			var data = xhr.responseText;
			if (options.dataType == "json")
				data = JSON.parse(data);
			// 处理响应数据
			options.success && options.success(data);
		} else { // 请求失败
			options.error && options.error(xhr.statusText);
		}
	}
}

// 主要用于处理 get 请求
function get(url, data, success, dataType) {
	ajax({
		"type":"get",
		"url":url,
		"data":data,
		"dataType":dataType,
		"success":success
	});
}

// 用于处理 get 请求，返回的是 json 的数据格式
function getJSON(url, data, success) {
	get(url, data, success, "json");
}

// 主要用于处理 post 请求
function post(url, data, success, dataType) {
	ajax({
		"type":"post",
		"url":url,
		"data":data,
		"dataType":dataType,
		"success":success
	});
}

// 使用 Promise 对象简单封装 ajax
function ajaxPromise (url) {
	return new Promise(function(resolve, reject){
		ajax({
			type : "get",
			url : url,
			dataType : "json",
			success : function(data){
				resolve(data);
			},
			error : function(errMsg){
				reject(errMsg);
			}
		});
	});
}