// 子弹
var Bullet = function (opts) {
    this.opts = opts || {};
    Element.call(this, opts);
}

inheritPrototype(Bullet, Element);

// 子弹飞行
Bullet.prototype.fly = function () {
    this.move(0, -this.speed);
};

// 绘制子弹
Bullet.prototype.draw = function () {
    context.beginPath();
    context.strokeStyle = '#fff';
    context.moveTo(this.x, this.y);
    context.lineTo(this.x, this.y - this.size);
    context.closePath();
    context.stroke();
    return this;
};

