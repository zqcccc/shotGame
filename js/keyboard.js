// 绑定键盘事件
function keyBoard() {
    document.onkeydown = this.keyDown.bind(this);
    document.onkeyup = this.keyUp.bind(this);
}
keyBoard.prototype = {
    pressLeft: false,
    pressRight: false,
    pressUp: false,
    pressSpace: false,
    pressEsc: false,
    keyDown: function (e) {
        var key = e.keyCode || e.which || e.charCode;
        switch (key) {
            // 左
            case 37:
                this.pressLeft = true;
                this.pressRight = false;
                break;
            // 右
            case 39:
                this.pressRight = true;
                this.pressLeft = false;
                break;
            //上
            case 38:
                this.pressUp = true;
                break;
            // 空格
            case 32:
                this.pressSpace = true;
                break;
            case 27:
                this.pressEsc = true;
                break;
        }
    },
    keyUp: function (e) {
        var key = e.keyCode || e.which || e.charCode;
        switch (key) {
            // 左
            case 37:
                this.pressLeft = false;
                break;
            // 右
            case 39:
                this.pressRight = false;
                break;
            // 上
            case 38:
                this.pressUp = false;
                break;
            // 空格
            case 32:
                this.pressSpace = false;
                break;
            case 27:
                this.pressEsc = false;
                break;
        }
    }
}