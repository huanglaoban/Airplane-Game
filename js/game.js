// 创建地图构造函数
function Map() {
	this.width = 320;
	this.height = 568;
	this.element = $("#container");
}

// 游戏角色构造函数
function Role(options) {
	if (!options)
		return this;
	this.width = options.width;
	this.height = options.height;
	this.x = options.x;
	this.y = options.y;
	this.element = null; // DOM 元素
	this.imgSrc = options.imgSrc;
	this.map = options.map || null; // 描述当前游戏角色所在地图
}

// 初始化方法
Role.prototype.init = function(){
	// 创建角色使用的 DOM 元素对象
	var _img = this.element = document.createElement("img");
	// 设置元素节点的 src 属性
	_img.src = this.imgSrc;
	// 将当前角色DOM元素对象添加到页面显示
	this.map.element.appendChild(_img);
	// 设置 _img 元素的CSS样式
	css(_img, {
		width : this.width + "px",
		height : this.height + "px",
		position : "absolute",
		top : this.y + "px",
		left : this.x + "px"
	});
}

// 自己飞机的构造函数
function Self(options) {
	var defaultOptions = {
		width : 66,
		height : 80,
		imgSrc : "images/self.gif",
		x : 100,
		y : 200,
		hp : 1000
	};
	if (options) {
		for (var attr in options) {
			defaultOptions[attr] = options[attr];
		}
	}

	// 继承 Role 属性
	Role.call(this, defaultOptions);
	// 私有的属性
	this.hp = defaultOptions.hp;
}

// 继承方法
Self.prototype = new Role();

// 敌机构造函数
function Enemy(options) {
	var defaultOptions = {
		width : 46,
		height : 60,
		imgSrc : "images/mid_fly.png",
		x : 100,
		y : 200,
		hp : 1000,
		speed : 10,
		power : 100
	};
	if (options) {
		for (var attr in options) {
			defaultOptions[attr] = options[attr];
		}
	}

	// 继承 Role 属性
	Role.call(this, defaultOptions);
	// 私有的属性
	this.hp = defaultOptions.hp;
	this.speed = defaultOptions.speed;
	this.power = defaultOptions.power;
	this.isAlive = true; // 是否页面元素在存在
}

// 继承方法
Enemy.prototype = new Role();

// 敌机移动
Enemy.prototype.move = function(){
	this.y += this.speed;
	css(this.element, {top:this.y + "px"});
	// 判断是否从下方超出地图范围
	if (this.y > this.map.height){
		this.isAlive = false;
		this.map.element.removeChild(this.element);
	}
}

// 子弹构造函数
function Bullet(options) {
	var defaultOptions = {
		width : 6,
		height : 14,
		imgSrc : "images/bullet.png",
		x : 100,
		y : 200,
		power : 50,
		speed : 3
	};
	if (options) {
		for (var attr in options) {
			defaultOptions[attr] = options[attr];
		}
	}

	// 继承 Role 属性
	Role.call(this, defaultOptions);
	// 私有的属性
	this.power = defaultOptions.power;
	this.speed = defaultOptions.speed;
	this.isAlive = true; // 是否页面元素在存在
}

// 继承方法
Bullet.prototype = new Role();

// 子弹移动
Bullet.prototype.move = function(){
	this.y -= this.speed;
	css(this.element, {top:this.y + "px"});
	// 判断是否从下方超出地图范围
	if (this.y < 0){
		this.isAlive = false;
		this.map.element.removeChild(this.element);
	}
}

// 产生随机数：在指定的区间范围内产生一个随机数字
function random(lower, upper) {
	return Math.floor(Math.random() * (upper - lower) + lower);
}

// 判断两个角色所表示的元素(矩形)是否相交
function intersect(role1, role2) {
	if (role2.x > role1.x + role1.width
		|| role1.x > role2.x + role2.width
		|| role2.y > role1.y + role1.height
		|| role1.y > role2.y + role2.height)
		return false;
	return true;
}

// 保存自己飞机对象的变量
var _self;
// 点击开始界面
$("#start").onclick = function(){
	// 隐藏开始界面，显示游戏主界面
	hide(this);
	show($("#main"));

	// 创建地图对象
	var _map = new Map();
	// 创建自己的飞机对象
	_self = new Self();
	// 建立飞机对象与地图的关联关系
	_self.map = _map;
	// 初始化显示地图
	_self.init();

	/* 启动计时器，产生敌机 */
	var count = 0; // 计时器函数执行计数
	var enemies = []; // 保存界面中所有的敌机对象
	var bullets = []; // 保存界面中所有的子弹对象
	var timer = setInterval(function(){
		count++;

		// 创建飞机
		var enemy;
		if (count % 30 == 0) { // 小
			enemy = new Enemy({
				imgSrc:"images/small_fly.png",
				width : 34,
				height : 24,
				y : -24,
				x : random(_self.width / 2, _self.map.width - _self.width / 2 - 17),
				hp : 100,
				speed : random(1, 4),
				map : _map,
				power : 100
			});
			enemies.push(enemy);
			// 初始化页面DOM元素
			enemy.init();
		} else if (count % 100 == 0) { // 中
			enemy = new Enemy({
				imgSrc:"images/mid_fly.png",
				width : 46,
				height : 60,
				y : -60,
				x : random(_self.width / 2, _self.map.width - _self.width / 2 - 23),
				hp : 200,
				speed : random(1, 3),
				map : _map,
				power : 200
			});
			enemies.push(enemy);
			// 初始化页面DOM元素
			enemy.init();
		}

		// 创建子弹
		if (count % 10 === 0) {
			var bullet = new Bullet({
				x : _self.x + _self.width / 2 - 3,
				y : _self.y - 15,
				map : _map
			});
			bullet.init();
			bullets.push(bullet);
		}

		// 自动移动敌机
		for (var i = enemies.length - 1; i >= 0; i--) {
			enemy = enemies[i];
			enemy.move();
			if (!enemy.isAlive) // 从页面中已移除DOM元素对象
				enemies.splice(i, 1);
		}

		// 自动移动子弹
		for (var i = bullets.length - 1; i >= 0; i--) {
			bullet = bullets[i];
			bullet.move();
			if (!bullet.isAlive)
				bullets.splice(i, 1);
		}

		/* 碰撞检测 */
		// 判断子弹与敌机碰撞
		for (var i = bullets.length - 1; i >= 0; i--) {
			// 当前遍历到的子弹对象
			bullet = bullets[i];
			for (var j = enemies.length - 1; j >= 0; j--) {
				// 当前遍历到的敌机对象
				enemy = enemies[j];
				// 判断是否与子弹相交
				if (intersect(bullet, enemy)) { // 碰撞
					enemy.hp -= bullet.power;
					if (enemy.hp <= 0) { // 飞机被击毁
						enemy.map.element.removeChild(enemy.element);
						enemies.splice(j, 1);
					}
					bullet.map.element.removeChild(bullet.element);
					bullets.splice(i, 1);
					break;
				}
			}
		}
		// 自己的飞机和敌机的碰撞
		for (var i = enemies.length - 1; i >= 0; i--) {
			enemy = enemies[i];
			if (intersect(enemy, _self)) { // 碰撞
				_self.hp -= enemy.power;
				console.log(_self.hp);
				if (_self.hp <= 0) { // 游戏结束
					clearInterval(timer); // 停止计时器
					$("#container").onmousemove = null; // 取消移动事件
					// 显示游戏结束
					show($("#gameover"));
					animate($("#gameover"), {top : 0}, 1000);
					break;
				}
				enemy.map.element.removeChild(enemy.element);
				enemies.splice(i, 1);
			}
		}
	}, 1000 / 60);
}

// 处理鼠标移动事件，让自己飞机跟随鼠标指针移动
$("#container").onmousemove = function(e){
	if (!_self) // 还未创建自己的飞机对象
		return;
	e = e || event;
	offset(_self.element, {
		top : e.pageY - _self.height / 2,
		left : e.pageX - _self.width / 2
	});
	/* 限定飞机只能在地图范围内，不能超出界面 */
	var _left = _self.element.offsetLeft,
		_top = _self.element.offsetTop;
	if (_left < 0)
		_left = 0;
	else if (_left > _self.map.width - _self.width)
		_left = _self.map.width - _self.width;
	if (_top < 0)
		_top = 0;
	else if(_top > _self.map.height - _self.height)
		_top = _self.map.height - _self.height;
	css(_self.element, {
		left : _left + "px",
		top : _top + "px"
	});
	// 设置飞机对象坐标定位
	_self.x = _left;
	_self.y = _top;
}

// 点击 div#gameover 重新开始游戏
$("#gameover").onclick = function(){
	location.reload();
}