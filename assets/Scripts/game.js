// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        block: {
            default: null,
            type: cc.Prefab,
        },
        bg: {
            default: null,
            type: cc.Sprite,
        },
        currentScoreLabel: {
            default: null,
            type: cc.Label,
        },


    },
    ctor() {
        this.blocks = [
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null]
        ];
        this.data = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        this.positions = Array;
        this.touchStartTime = 0;
        this.touchEndTime = 0;
        this.currentScore = 0;
        this.blockSize = 0;
        this.moving = false;
    },
    onLoad: function () {
        //设置边距
        var betweenWidth = 20;
        var size = (cc.winSize.width - betweenWidth * 5) / 4;
        this.blockSize = size;
        var x = betweenWidth + size / 2;
        var y = size;
        // 存储16个block的坐标点位置
        this.positions = [];
        for (var i = 0; i < 4; i++) {
            this.positions.push([]);
            for (var j = 0; j < 4; j++) {
                var b = cc.instantiate(this.block);
                b.getChildByName('label').active = false;
                b.attr({
                    x: x,
                    y: y,
                    width: size,
                    height: size
                });
                this.positions[i].push(cc.p(x, y));
                x += (size + betweenWidth);
                this.bg.node.addChild(b);
            }
            y += (size + betweenWidth);
            x = betweenWidth + size / 2;

        }
        this.colors = this.setColor();
    },

    start: function () {
        if (this.blocks) {
            for (var i = 0; i < this.blocks.length; i++) {
                for (var j = 0; j < this.blocks[i].length; j++) {
                    if (this.blocks[i][j]) {
                        this.blocks[i][j].destroy();
                    }
                }
            }
        }
        this.addBlock();
        this.addBlock();
        this.addBlock();
    },
    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },
    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },
    onTouchStart: function (event) {
        this.touchStartTime = Date.now();
        this.touchStartPoint = event.getLocation();

        event.stopPropagation();
        return true;
    },
    onTouchMove: function (event) {
        event.stopPropagation();
    },
    onTouchEnd: function (event) {
        this.touchEndTime = Date.now();
        this.touchEndPoint = event.getLocation();
        var dis = cc.p(this.touchEndPoint.x - this.touchStartPoint.x, this.touchEndPoint.y - this.touchStartPoint.y);
        var time = this.touchEndTime - this.touchStartTime;
        /// 大于400ms才判断滑动
        if (time < 400) {
            if (this.moving) {
                return;
            }
            //大于20判定有效
            var startMoveDis = 20;
            // x比y大，左右滑动
            if (Math.abs(dis.x) > Math.abs(dis.y)) {
                if (dis.x > startMoveDis) {
                    this.moving = true;
                    this.moveRight();
                } else if (dis.x < -startMoveDis) {
                    this.moving = true;
                    this.moveLeft();
                }
            } else { // 上下滑动
                if (dis.y > startMoveDis) {
                    this.moving = true;
                    this.moveUp();
                } else if (dis.y < -startMoveDis) {
                    this.moving = true;
                    this.moveDown();
                }
            }
        }
        event.stopPropagation();
    },


    success: function () {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.data[i][j] == 2048) {
                    alert("success");
                    return true;
                }
            }
        }
        return false;
    },




    // 颜色数据
    setColor: () => {
        var colors = [];
        colors[2] = cc.color(237, 241, 21, 255);
        colors[4] = cc.color(255, 87, 34, 255);
        colors[8] = cc.color(171, 241, 21, 255);
        colors[16] = cc.color(194, 56, 181, 255);
        colors[32] = cc.color(187, 149, 216, 255);
        colors[64] = cc.color(216, 149, 209, 255);
        colors[128] = cc.color(0, 153, 4, 255);
        colors[256] = cc.color(16, 74, 99, 255);
        colors[512] = cc.color(299, 0, 79, 255);
        colors[1024] = cc.color(214, 215, 98, 255);
        colors[2048] = cc.color(219, 0, 139, 255);
        return colors;

    },

    /**
     * 扫描n阶矩阵
     * @param {number}n 
     * @param {Array}Array n阶矩阵
     */
    getEmptyLocations: (Array, n) => {
        // 空闲的位置
        var emptyLocations = [];
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                if (Array[i][j] == null) {
                    emptyLocations.push(i * n + j);
                }
            }
        }
        return emptyLocations;
    },

    /**
     * 新增block
     */
    addBlock: function () {
        // 查找空位
        var emptyLocations = this.getEmptyLocations(this.blocks, 4);
        cc.log(emptyLocations);
        //无空位
        if (emptyLocations.length == 0) {
            return false;
        }
        var p1 = Math.floor(Math.random() * emptyLocations.length);
        p1 = emptyLocations[p1];
        var x = Math.floor(p1 / 4);
        var y = Math.floor(p1 % 4);
        var numbers = [2, 2, 2, 2, 4];
        var n = Math.floor(Math.random() * numbers.length);
        var b = cc.instantiate(this.block);
        b.attr({
            width: this.blockSize,
            height: this.blockSize,
        });
        b.setColor(this.colors[numbers[n]]);
        b.setPosition(this.positions[x][y]);
        b.getChildByName('label').getComponent(cc.Label).string = numbers[n];
        this.bg.node.addChild(b);
        this.blocks[x][y] = b;
        b.scale = (0, 0);
        var show = cc.scaleTo(0.1, 1, 1);
        b.runAction(show);

        this.data[x][y] = numbers[n];

        return true;
    },

    /**
     * 移动操作
     */
    moveAction: function (block, pos, callback) {
        //执行回调函数
        //顺序执行操作
        var m = cc.sequence(
            cc.moveTo(0.08, pos),
            cc.callFunc(function () {
                callback();
            })
        );
        block.runAction(m);
    },


    /**
     * 合并操作
     */
    mergeAction: function (b1, b2, num, callback) {
        var self = this;
        b1.destroy(); // 合并后销毁
        var mid = cc.callFunc(function () {
            b2.setColor(self.colors[num]);
            b2.getChildByName('label').getComponent(cc.Label).string = num;
        });
        var finished = cc.callFunc(function () {
            callback();
        });
        var m = cc.sequence(
            cc.scaleTo(0.1, 1.1),
            mid,
            cc.scaleTo(0.1, 1),
            finished,

        );
        //顺序执行操作
        b2.runAction(m);
    },

    merged: () => {
        var merged = [];
        for (var i = 0; i < 4; i++) {
            merged.push([0, 0, 0, 0]);
        }
        return merged;

    },


    /*
     *为所有的y=1，2，3执行向左移动操作，数字相同则合并，为空则左移，其他情况则callback()
     */
    moveLeft: function () {
        var self = this;
        // 递归移动操作
        var isMoved = false;
        var merged = this.merged();
        var move = function (x, y, callback) {
            if (y == 0) {
                if (callback) {
                    callback();
                }
                return;
            } else if (self.data[x][y - 1] != 0 && self.data[x][y - 1] != self.data[x][y]) {
                if (callback) {
                    callback();
                }
                return;
            } else if (self.data[x][y - 1] == self.data[x][y] && !merged[x][y - 1]) {
                //如果左侧有block且数字相同则执行合并
                merged[x][y - 1] = 1;
                self.data[x][y - 1] *= 2;
                self.data[x][y] = 0;
                var b2 = self.blocks[x][y - 1];
                var b1 = self.blocks[x][y];
                var p = self.positions[x][y - 1];
                self.blocks[x][y] = null;
                self.moveAction(b1, p, function () {
                    self.mergeAction(b1, b2, self.data[x][y - 1], callback);
                });
                isMoved = true;
            } else if (self.data[x][y - 1] == 0) {
                //如果左侧无block则执行移动
                self.data[x][y - 1] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x][y - 1];
                self.blocks[x][y - 1] = b;
                self.blocks[x][y] = null;

                self.moveAction(b, p, function () {
                    move(x, y - 1, callback);
                });
                isMoved = true;
            } else {
                callback();
            }

        };
        //整体移动
        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var y = 1; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                var n = this.data[x][y];
                if (n != 0) {
                    total += 1;
                    willMove.push({
                        x: x,
                        y: y
                    });
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            move(x, y, function () {
                counter += 1;
                if (counter == total) {
                    cc.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },


    moveRight: function () {
        var self = this;
        // 递归移动操作
        var isMoved = false;
        var merged = this.merged();
        var move = function (x, y, callback) {
            if (y == 3) {
                if (callback) {
                    callback();
                }
                return;
            } else if (self.data[x][y + 1] != 0 && self.data[x][y + 1] != self.data[x][y]) {
                if (callback) {
                    callback();
                }
                return;
            } else if (self.data[x][y + 1] == self.data[x][y] && !merged[x][y + 1]) {
                merged[x][y + 1] = 1;
                self.data[x][y + 1] *= 2;
                self.data[x][y] = 0;
                var b1 = self.blocks[x][y + 1];
                var b = self.blocks[x][y];
                var p = self.positions[x][y + 1];
                self.blocks[x][y] = null;
                self.moveAction(b, p, function () {
                    self.mergeAction(b, b1, self.data[x][y + 1], callback);
                });
                isMoved = true;
            } else if (self.data[x][y + 1] == 0) {
                self.data[x][y + 1] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x][y + 1];
                self.blocks[x][y + 1] = b;
                self.blocks[x][y] = null;

                self.moveAction(b, p, function () {
                    move(x, y + 1, callback);
                    isMoved = true;
                });
            } else {
                callback();
            }

        };

        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var y = 2; y >= 0; y--) {
            for (var x = 0; x < 4; x++) {
                var n = this.data[x][y];
                if (n != 0) {
                    total += 1;
                    willMove.push({
                        x: x,
                        y: y
                    });
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            move(x, y, function () {
                counter += 1;
                if (counter == total) {
                    cc.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },


    moveUp: function () {
        var self = this;
        // 递归移动操作
        var isMoved = false;
        var merged = this.merged();
        var move = function (x, y, callback) {
            if (x == 3) {
                if (callback) {
                    callback();
                }
                return;
            } else if (self.data[x + 1][y] != 0 && self.data[x + 1][y] != self.data[x][y]) {
                if (callback) {
                    callback();
                }
                return;
            } else if (self.data[x + 1][y] == self.data[x][y] && !merged[x + 1][y]) {
                merged[x + 1][y] = 1;
                self.data[x + 1][y] *= 2;
                self.data[x][y] = 0;
                var b1 = self.blocks[x + 1][y];
                var b = self.blocks[x][y];
                var p = self.positions[x + 1][y];
                self.blocks[x][y] = null;
                self.moveAction(b, p, function () {
                    self.mergeAction(b, b1, self.data[x + 1][y], callback);
                });
                isMoved = true;
            } else if (self.data[x + 1][y] == 0) {
                self.data[x + 1][y] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x + 1][y];
                self.blocks[x + 1][y] = b;
                self.blocks[x][y] = null;

                self.moveAction(b, p, function () {
                    move(x + 1, y, callback);
                    isMoved = true;
                });
            } else {
                callback();
            }

        };

        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var x = 2; x >= 0; x--) {
            for (var y = 0; y < 4; y++) {
                var n = this.data[x][y];
                if (n != 0) {
                    total += 1;
                    willMove.push({
                        x: x,
                        y: y
                    });
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            move(x, y, function () {
                counter += 1;
                if (counter == total) {
                    cc.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },


    moveDown: function () {
        var self = this;
        // 递归移动操作
        var isMoved = true;
        var merged = this.merged();
        var move = function (x, y, callback) {
            if (x == 0) {
                if (callback) {
                    callback();
                }
                return;
            } else if (self.data[x - 1][y] != 0 && self.data[x - 1][y] != self.data[x][y]) {
                if (callback) {
                    callback();
                }
                return;
            } else if (self.data[x - 1][y] == self.data[x][y] && !merged[x - 1][y]) {
                merged[x - 1][y] = 1;
                self.data[x - 1][y] *= 2;
                self.data[x][y] = 0;
                var b1 = self.blocks[x - 1][y];
                var b = self.blocks[x][y];
                var p = self.positions[x - 1][y];
                self.blocks[x][y] = null;
                self.moveAction(b, p, function () {
                    self.mergeAction(b, b1, self.data[x - 1][y], callback);
                });
                isMoved = true;
            } else if (self.data[x - 1][y] == 0) {
                self.data[x - 1][y] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x - 1][y];
                self.blocks[x - 1][y] = b;
                self.blocks[x][y] = null;

                self.moveAction(b, p, function () {
                    move(x - 1, y, callback);
                    isMoved = true;
                });
            } else {
                callback();
            }

        };

        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var x = 1; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                var n = this.data[x][y];
                if (n != 0) {
                    total += 1;
                    willMove.push({
                        x: x,
                        y: y
                    });
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            move(x, y, function () {
                counter += 1;
                if (counter == total) {
                    cc.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },

    /*
     * 完成移动后的操作
     */
    afterMove: function (moved) {
        cc.log('afterMove');
        if (moved) {
            this.currentScore += 2;
            this.updateSocreLabel();
            this.addBlock();
        }
        if (this.isGameOver()) {
            cc.log("游戏结束")
            cc.director.loadScene("End");
        }
        this.moving = false;
    },


    /*
     *扫描四周，若有数字相同的则游戏继续
     */
    isGameOver: function () {
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                var n = this.data[x][y];
                if (this.data[x][y] == 0) {
                    return false;
                }
                if (x - 1 >= 0) {
                    if (n == this.data[x - 1][y]) {
                        return false;
                    }
                }
                if (x + 1 <= 3) {
                    if (n == this.data[x + 1][y]) {
                        return false;
                    }
                }
                if (y - 1 >= 0) {
                    if (n == this.data[x][y - 1]) {
                        return false;
                    }
                }
                if (y + 1 <= 3) {
                    if (n == this.data[x][y + 1]) {
                        return false;
                    }
                }
            }
        }
        return true;
    },


    updateSocreLabel: function () {
        this.currentScoreLabel.getComponent(cc.Label).string = "Score: " + this.currentScore;
    }


});