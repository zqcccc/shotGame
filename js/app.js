// 元素
var container = document.getElementById('game');
// 画布相关
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var keyCount = 0;

// 判断是否有 requestAnimationFrame 方法，如果有则模拟实现
window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 30);
  };

// 清除整个画布
function clear() {
  context.clearRect(0, 0, canvas.width, canvas.height);
};

// 获取敌人的最大和最小的x坐标
function getBoundary(array) {
  var min, max;
  array.forEach(function (item) {
    if (!min && !max) {
      min = item.x;
      max = item.x;
    } else {
      if (item.x < min) {
        min = item.x;
      }
      if (item.x > max) {
        max = item.x;
      }
    }
  });
  return {
    minX: min,
    maxX: max
  }
};
/**
 * 整个游戏对象
 */
var GAME = {
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts
   * @return {[type]}      [description]
   */
  init: function(opts) {
    var opts = Object.assign({}, opts, CONFIG);//合并所有参数
    this.opts = opts;
    this.key = [];//键盘事件

    this.bindEvent();
    // 计算飞机的初始坐标
    this.planePosX = canvas.width / 2 - opts.planeSize.width;
    this.planePosY = canvas.height - opts.planeSize.height - opts.canvasPadding;
    // 飞机移动边界
    this.planeMinX = opts.canvasPadding;
    this.planeMaxX = canvas.width - opts.planeSize.width - opts.canvasPadding;
    // 敌人移动边界
    this.enemyMinX = opts.canvasPadding;
    this.enemyMaxX = canvas.width - opts.enemySize - opts.canvasPadding;
    // 分数
    this.score = 0;
    this.enemies = [];
    // 实例化keyBoard绑定键盘事件
    this.keyBoard = new keyBoard();
  },
  bindEvent: function() {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    var replayBtn = document.querySelectorAll('.js-replay');
    var nextBtn = document.querySelector('.js-next');
    var continueBtn = document.querySelector('.js-continue');
    // 开始游戏按钮绑定
    playBtn.onclick = function() {
      self.start();
    };
    // 重新开始游戏按钮
    replayBtn.forEach(function(btn){
      btn.onclick = function () {
        self.opts.level = 1;
        // console.log(self);
        self.score = 0;
        self.start();
      }
    });
    // 下一关游戏按钮绑定
    nextBtn.addEventListener("click",function(){
      self.opts.level += 1;
      self.start();
    });
    continueBtn.addEventListener('click',function(){
      self.setStatus('playing');
      self.playing();
    });

  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * all-success 游戏通过
   * stop 游戏暂停（可选）
   */
  setStatus: function(status) {
    this.status = status;
    container.setAttribute("data-status", status);
  },
  start: function() {
    var opts = this.opts;
    // 重置敌人数组
    this.enemies = [];
    this.createEnemy();

    this.lastTime = Date.now();
    // 实例化飞机
    this.plane = new Plane({
      x: this.planePosX,
      y: this.planePosY,
      speed: opts.planeSpeed,
      size: opts.planeSize,
      planeIcon: opts.planeIcon,
      minX: this.planeMinX,
      maxX: this.planeMaxX
    });

    // 进入游戏状态中
    this.setStatus('playing');
    this.playing();
  },
  playing: function() {
    var self = this;
    var opts = this.opts;
    var enemies = this.enemies;

    // 更新元素状态
    this.updateEnemy();
    this.updatePlane();

    // 判断游戏是否需要结束
    if(enemies.length === 0) {
      if(opts.level === opts.totalLevel){
        this.end('all-success');
        return;
      }
      this.end('success');
      return;// 结束递归
    }
    else if(enemies[enemies.length - 1].y > this.planePosY - opts.enemySize) {
      this.end('failed');
      container.querySelector('.score').innerHTML = this.score;
      return;
    }
    else if(this.keyBoard.pressEsc){
      this.setStatus('stop');
    }
    // 清理整个画布
    clear();

    // 绘制所有内容
    this.draw();

    // 不断循环 update
    requestAnimFrame(function() {
      if(self.status === 'stop'){
        return;
      }
      self.playing();
    });
  },
  // 游戏结束
  end: function(status) {
    clear();
    this.setStatus(status);
  },
  // 绘制所有内容
  draw: function(){
    this.plane.draw();
    this.enemies.forEach(function(enemy) {
      enemy.draw();
    });
    context.font = '18px Arial';
    context.fillStyle = 'white';
    context.fillText('分数：' + this.score, 20, 20);
  },
  // 更新飞机方向，发射子弹
  updatePlane: function(){
    var plane = this.plane;
    var key = this.keyBoard;
    if((key.pressSpace || key.pressUp) && (Date.now() - this.lastTime > 200)){
        key.pressedUp = false;
        key.pressedSpace = false;
        this.lastTime = Date.now();
        plane.shoot();
      }

    else if(key.pressLeft){
      plane.direction('left');
    }
    else if(key.pressRight){
      plane.direction('right');
    }
  },
  // 更新敌人的状态
  updateEnemy: function() {
    var opts = this.opts;
    var plane = this.plane;
    var enemies = this.enemies;
    var i = enemies.length;
    var isFall = false; // 敌人下落标志
    var enemiesX = getBoundary(enemies);// 获取敌人的最大和最小的x坐标
    // 判断敌人是否需要变向和下落
    if (enemiesX.minX < this.enemyMinX || enemiesX.maxX >= this.enemyMaxX) {
      // console.log('enemiesX.minX', enemiesX.minX);
      // console.log('enemiesX.maxX', enemiesX.maxX);
      opts.enemyDirection = opts.enemyDirection === 'right' ? 'left' : 'right';
      // console.log('opts.enemyDirection', opts.enemyDirection);
      isFall = true;
    }
    // 循环更新敌人
    while (i--) {
      var enemy = enemies[i];
      if (isFall) {
        // 敌人逐个下落
        enemy.down();
      }
      // 按方向继续移动
      enemy.direction(opts.enemyDirection);
      // 根据敌人的状态处理敌人
      switch (enemy.status) {
        case 'normal':
          if (plane.hit(enemy)) {
            enemy.booming();
          }
          break;
        case 'booming':
          enemy.booming();
          break;
        case 'boomed':
          enemies.splice(i, 1);
          this.score += 1;
          break;
        default:
          break;
      }
    }
  },
  // 创建敌人，第几关就有几行敌人
  createEnemy: function() {
    var opts = this.opts;
    var enemyLines = opts.level;
    var numPerLine = opts.numPerLine;
    var padding = opts.canvasPadding;
    var gap = opts.enemyGap;
    var size = opts.enemySize;
    for (var i = 0; i < enemyLines; i++) {
      for (var j = 0; j < numPerLine; j++) {
        var init = {
          x: padding + (size + gap) * j,
          y: padding + (size + gap) * i,
          size: size,
          speed: opts.enemySpeed,
          enemyIcon: opts.enemyIcon,
          enemyBoomIcon: opts.enemyBoomIcon
        };
        this.enemies.push(new Enemy(init));
      }
    }

  }
};


// 初始化
GAME.init();
