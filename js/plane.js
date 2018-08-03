// 飞机
var Plane = function (opts) {
    this.opts = opts || {};
    Element.call(this, opts);

    //特有的属性
    this.width = opts.size.width;
    this.height = opts.size.height;
    this.planeIcon = opts.planeIcon;
    this.minX = opts.minX;
    this.maxX = opts.maxX;

    //管理子弹
    this.bullets = [];
    this.bulletSpeed = opts.bulletSpeed || CONFIG.bulletSpeed;
    this.bulletSize = opts.bulletSize || CONFIG.bulletSize;
}

inheritPrototype(Plane, Element);



// 飞机方向
Plane.prototype.direction = function(direction) {
    var speed = this.speed;
    var offset = 0;
    if (direction === 'left'){
        offset = this.x < this.minX ? 0 : -speed;
    }
    else{
        offset = this.x > this.maxX ? 0 : speed;
    }
    this.move(offset, 0);
    return this;
}

// 绘制飞机
Plane.prototype.draw = function (){
    this.drawBullets();
    var planeIcon = new Image();
    planeIcon.src = this.planeIcon;
    context.drawImage(planeIcon, this.x, this.y, this.width, this.height);
    return this;
}

// 发射子弹
Plane.prototype.shoot = function () {
    var bulletPosX = this.x + this.width / 2;
    this.bullets.push(new Bullet({
        x: bulletPosX,
        y: this.y,
        size: this.bulletSize,
        speed: this.bulletSpeed
    }));
}

// 子弹击中目标
Plane.prototype.hit = function (enemy) {
    var bullets = this.bullets;
    for(var i = bullets.length - 1; i >= 0; i--){
        var bullet = bullets[i];
        var isHitPosX = (enemy.x < bullet.x) && (bullet.x < (enemy.x + enemy.size));
        var isHitPosY = (enemy.y < bullet.y) && (bullet.y < (enemy.y + enemy.size));
        if(isHitPosX && isHitPosY){
            bullets.splice(i, 1);
            return true;
        }
    }
    return false;
}

// 绘制子弹
Plane.prototype.drawBullets = function () {
    var bullets = this.bullets;
    var i = bullets.length;
    while (i--) {
        var bullet = bullets[i];
        bullet.fly();
        if(bullet.y < 0) {
            bullets.splice(i, 1);
        }
        bullet.draw();
    }
}