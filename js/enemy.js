var Enemy = function (opts) {
    this.opts = opts || {};
    //调用父类构造属性
    Element.call(this,opts);

    //特有属性状态和图像,状态有normal、booming、boomed
    this.status = 'normal';
    this.enemyIcon = opts.enemyIcon;
    this.enemyBoomIcon = opts.enemyBoomIcon;
    this.boomCount = 0;
};

// 继承父类方法
inheritPrototype(Enemy,Element);

//绘制方法
Enemy.prototype.draw = function () {
    if (this.enemyIcon && this.enemyBoomIcon){
        switch (this.status){
            case 'normal':
                var enemyIcon = new Image();
                enemyIcon.src = this.enemyIcon;
                context.drawImage(enemyIcon, this.x, this.y, this.size, this.size);
                break;
            case 'booming':
                var enemyBoomIcon = new Image();
                enemyBoomIcon.src = this.enemyBoomIcon;
                context.drawImage(enemyBoomIcon, this.x, this.y, this.size, this.size);
                break;
            case 'boomed':
                context.clearRect(this.x, this.y, this.size, this.size);
                break;
        }
    }
    return this;
};


// 方法：down 向下移动
Enemy.prototype.down = function () {
    this.move(0, this.size);
    return this;

};
// 左右移动
Enemy.prototype.direction = function (direction) {
    if (direction === 'right') {
        this.move(this.speed, 0);
    } else {
        this.move(-this.speed, 0);
    }
    return this;
};

// 敌人爆炸
Enemy.prototype.booming = function () {
    this.status = 'booming';
    this.boomCount += 1;
    if (this.boomCount > 4) {
        this.status = 'boomed';
    }
    return this;
}