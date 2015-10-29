/**
 * @author wr
 * @email mvpjly@163.com
 * @date 2013/07/28
 */
;
(function ($) {
    var ArrowFly = null,//箭
        bomb = null,// 圆弹对象
        bombList = [],// 圆弹集合
        radiusList = [],// 同心圆半径集合
        obj = [];// 临时圆弹集合
    var temp = [], temp1 = 1, temp2 = [];// 临时变量数组

    $.mathame = function (opts) {
        return Game.init(opts);
    };
    var defaults = {
        time: 20,// 动画间隔，毫秒
        circleNum: 5,// 同心圆圈
        radius: 12,// 同心圆基本半径
        period: 30// 动画周期，乘以间隔为动画持续时间
    };
    var Game = {
        containerH: 0,// 容器高
        containerW: 0,// 容器宽
        bombId: 0,// 计时器ID
        loopNum: 1,// 初始循环变量数
        init: function (opts) {
            if (!"getContext" in document.createElement('canvas')) {
                return alert("your brower can't support canvas");
            }
            defaults = $.extend({}, defaults, opts);
            this.canvas(); // 初始2d画布
            this.drawxy(this.containerW, this.containerH);
            return this;
        },
        canvas: function () {
            var canvas = $("#canvas");
            this.containerW = canvas.width();
            this.containerH = canvas.height();
            this.ctx = canvas.attr("width", this.containerW)[0].getContext("2d");
        },
        drawxy: function (x, y) {
            this.ctx.strokeStyle = "#FFF";
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(0, y / 2);
            this.ctx.lineTo(x, y / 2);
            this.ctx.stroke();
            this.ctx.moveTo(x / 2, 0);
            this.ctx.lineTo(x / 2, y);
            this.ctx.stroke();
            this.ctx.save();
        },
        stop: function () {
            ArrowFly && ( ArrowFly = ArrowFly.destroy());
            bombList = [];
            obj = [];
            temp = [];
            temp2 = [];
            this.loopNum = 1;
            var _this = this;
            this.bombId && clearInterval(this.bombId);
            return this;
        },
        // 生成基本对象
        start: function (opts) {
            defaults = $.extend({}, defaults, opts);
            var _this = this;
            this.bombId = setInterval(function () {
                var len = _this.loopNum * 8;
                radiusList[_this.loopNum] = Util.distanceRadius(defaults.radius, len);
                var color = Util.randomColor();
                for (var i = 0; i < len; i++) {
                    var r = Util.distanceRadius(defaults.radius, len);
                    var angle = (2 * i * Math.PI / len) % (2 * Math.PI);
                    bomb = new Bomb(r, angle, _this.loopNum, color);
                    bombList.push(bomb);
                    bomb = new Bomb(r, angle, _this.loopNum, color);
                    obj.push(bomb);
                }
                _this.drawList(_this.containerW, _this.containerH, bombList);
                if (_this.loopNum == defaults.circleNum) {
                    clearInterval(Game.bombId);
                    _this.loopNum = 0;
                    _this.bombId = setInterval(_this.doCircle, defaults.time);
                    //Game.bombId = setInterval(Game.randomMath, defaults.time);
                } else {
                    _this.loopNum++;
                }
            }, defaults.time);// 画点
            return this;
        },
        drawList: function (x, y, list, list1) {
            this.ctx.clearRect(0, 0, Game.containerW, Game.containerH);
            this.drawxy(this.containerW, this.containerH);
            this.ctx.save();
            this.ctx.translate(x / 2, y / 2);
            if (typeof (list) != "undefined") {
                for (var i = 0; i < list.length; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(list[i].x, list[i].y, 3, 0, 2 * Math.PI, false);
                    this.ctx.fillStyle = list[i].color;
                    this.ctx.fill();
                    this.ctx.stroke();
                }
            }
            if (typeof (list1) != "undefined") {
                for (var i = 0; i < list1.length; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(list1[i].x, list1[i].y, 3, 0, 2 * Math.PI, false);
                    this.ctx.fillStyle = list1[i].color;
                    this.ctx.fill();
                    this.ctx.stroke();
                }
            }
            this.ctx.restore();
        },
        // 每段动画结束处理公共函数
        interval: function (func, time, list1, list2) {
            var _this = this;
            if (temp1 == 0) {
                temp1 = 1;
                _this.loopNum = 0;
                clearInterval(Game.bombId);
                _this.bombId = setInterval(func, defaults.time);
            } else {
                _this.loopNum++;
                _this.drawList(_this.containerW, _this.containerH, list1, list2);
            }
        },
        randomMath: function () {
            var len = bombList.length;
            for (var i = 0; i < len; i++) {
                if (Game.loopNum < 45) {
                    if (bombList[i].loop % 2 == 1)// 奇数圈顺时针旋转
                        bombList[i].angle = bombList[i].angle - angle;
                    bombList[i].x = bombList[i].r * Math.sin(bombList[i].angle);
                    bombList[i].roll3Dx(Math.PI / 45);
                }
                else {
                    temp1 = 0;
                }
            }
            Game.interval(null, defaults.time, bombList);
        },
        doCircle: function () {
            var len = bombList.length;
            for (var i = 0; i < len; i++) {
                if (Game.loopNum < defaults.period) {
                    if (bombList[i].loop % 2 == 1)// 奇数圈顺时针旋转
                        bombList[i].rotateDown(Math.PI / 45);
                } else if (Game.loopNum < defaults.period * 2) {
                    if (bombList[i].loop % 2 == 0)// 偶数圈逆时针旋转
                        bombList[i].rotateUp(Math.PI / 45);
                } else if (Game.loopNum < defaults.period * 3) {
                    if (bombList[i].loop % 2 == 1) {// 奇数圈半径减小，同事顺时针旋转
                        bombList[i].radiusReduce(Math.PI / 45);
                    } else {// 偶数圈逆时针旋转
                        bombList[i].rotateUp(Math.PI / 45);
                    }
                } else if (Game.loopNum < defaults.period * 4) {
                    if (bombList[i].loop % 2 == 1) {// 奇数圈半径增大，同时逆时针旋转
                        bombList[i].radiusAdd(Math.PI / 45);
                    } else {// 偶数圈顺时针旋转
                        bombList[i].rotateDown(Math.PI / 45);
                    }
                } else {
                    temp1 = 0;
                }
            }
            Game.interval(Game.spreadCircle, defaults.time, bombList);
        },
        spreadCircle: function () {
            var len = obj.length;
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < defaults.circleNum; j++) {
                    if (Game.loopNum >= j * defaults.period / 6 && Game.loopNum < j * defaults.period / 6 + defaults.period
                        && obj[i].loop == defaults.circleNum - j) {
                        obj[i].spreadX(defaults.period);
                        obj[i].moveDown(radiusList[defaults.circleNum] / defaults.period);
                    }
                }
                if (Game.loopNum == defaults.period + (defaults.circleNum - 1) * defaults.period / 6) {
                    temp1 = 0;
                }
            }
            Game.interval(Game.changeCir, defaults.time, bombList, obj);
        },
        changeCir: function () {
            var len = bombList.length;
            for (var i = 0; i < len; i++) {
                if (Game.loopNum < 45) {
                    if (bombList[i].loop % 2 == 1)// 奇数圈顺时针旋转
                        bombList[i].roll3Dx(Math.PI / 45);
                    else {
                        bombList[i].roll3Dx(-Math.PI / 45);
                    }
                } else if (Game.loopNum < 90) {
                    if (bombList[i].loop % 2 == 1)// 奇数圈顺时针旋转
                        bombList[i].roll3Dy(Math.PI / 45);
                    else {
                        bombList[i].roll3Dy(-Math.PI / 45);
                    }
                } else {
                    temp1 = 0;
                }
            }
            if (temp1 == 0) {
                for (var i = 0; i < len; i++) {
                    bombList[i].ext = bombList[i].r;
                }
            }
            Game.interval(Game.changeCir1, defaults.time, bombList, obj);
        },
        changeCir1: function () {
            var len = bombList.length;
            for (var i = 0; i < len; i++) {
                if (Game.loopNum < 30) {
                    bombList[i].r += ((Game.containerH / 2 - bombList[i].y) / 3 - bombList[i].ext) / 30;
                    bombList[i].x = bombList[i].r * Math.sin(bombList[i].angle);
                    bombList[i].y = bombList[i].r * Math.cos(bombList[i].angle);
                } else if (Game.loopNum < 75) {
                    if (bombList[i].loop % 2 == 1)
                        bombList[i].roll3Dy(Math.PI / 45);
                    else {
                        bombList[i].roll3Dy(-Math.PI / 45);
                    }
                } else if (Game.loopNum < 120) {
                    if (bombList[i].loop % 2 == 1)
                        bombList[i].roll3Dx(-Math.PI / 45);
                    else {
                        bombList[i].roll3Dx(Math.PI / 45);
                    }
                } else {
                    temp1 = 0;
                }
            }
            if (temp1 == 0) {
                temp2 = [-1, 1, -1, 1, -1];
                for (var i = 0; i < len; i++) {
                    bombList[i].r = bombList[i].ext;// changeCir1后还原半径
                    var index = Math.floor(Math.random() * 3);
                    var ran = temp2[index] * 10 * Math.random();
                    bombList[i].ext = ran;// 随机水平速度
                    bombList[i].ext1 = 0;// 初始垂直速度
                    bombList[i].ext2 = false;// 初始垂直速度
                }
            }
            Game.interval(Game.cancelSpreadCircle, defaults.time, bombList, obj);
        },
        cancelSpreadCircle: function () {
            var len = obj.length;
            for (var i = 0; i < len; i++) {
                bombList[i].landY();
                for (var j = 0; j < defaults.circleNum; j++) {
                    if (Game.loopNum >= j * defaults.period / 5 + 50 && Game.loopNum < j * defaults.period / 5 + defaults.period + 50
                        && obj[i].loop == defaults.circleNum - j && obj[i].loop != defaults.circleNum) {
                        obj[i].cancelSpreadX(defaults.period);
                        obj[i].moveUp(obj[i].r / defaults.period);
                    }
                }
                if (Game.loopNum == defaults.period + (defaults.circleNum - 1) * defaults.period / 5 + 50) {
                    temp1 = 0;
                }
            }
            if (temp1 == 0) {
                // 要使圈数间隔的圆滚动到两两相切的位置停止，计算每个点的最大偏移量，数组下标对应点的圈数
                for (var i = 1; i <= defaults.circleNum; i++) {
                    bombList = [];
                    temp2[i] = 0;
                    if (i == 1 || i == 2) {
                        temp2[i] = radiusList[i];
                    } else {
                        temp2[i] = 2 * Math.sqrt(radiusList[i] * radiusList[i - 2]) + temp2[i - 2];
                    }
                }
                // rollCircle周期
                temp[0] = parseInt(temp2[defaults.circleNum - 1] / (defaults.circleNum - 1));
            }
            Game.interval(Game.rollCircle, defaults.time, bombList, obj);
        },
        rollCircle: function () {
            var len = obj.length;
            for (var i = 0; i < len; i++) {
                // 最大圈不变换，如果小于最大偏移量及时间，继续滚动
                if (obj[i].loop != defaults.circleNum && temp2[obj[i].loop] >= obj[i].loop * Game.loopNum) {
                    if (obj[i].loop % 2 == 0) {
                        obj[i].rollLeft(Math.PI / (45 - obj[i].loop), obj[i].loop * Game.loopNum, radiusList[defaults.circleNum]
                            - obj[i].r);
                    } else {
                        obj[i].rollRight(Math.PI / (45 - obj[i].loop), obj[i].loop * Game.loopNum, radiusList[defaults.circleNum]
                            - obj[i].r);
                    }
                } else if (Game.loopNum == temp[0]) {
                    temp1 = 0;
                }
            }
            if (temp1 == 0) {
                // 箭初始角度
                temp[1] = temp[4] = Math.atan(radiusList[defaults.circleNum - 2] / temp2[defaults.circleNum - 2]);
                // 箭起点
                temp[2] = Game.containerW;
                temp[3] = Game.containerH / 2 + radiusList[defaults.circleNum] - Game.containerW / 2 * radiusList[defaults.circleNum - 2]
                    / temp2[defaults.circleNum - 2];
                if (temp[3] < 0) {
                    temp[3] = 0;
                    temp[2] = Game.containerW / 2 + (Game.containerH / 2 + radiusList[defaults.circleNum])
                        / (radiusList[defaults.circleNum - 2] / temp2[defaults.circleNum - 2]);
                }
            }
            Game.interval(Game.arrowFly, defaults.time, obj);
            // Game.interval(Game.rollCircleRecovery, defaults.time, obj);
        },
        arrowFly: function () {
            !ArrowFly && ( ArrowFly = Arrow.init());
            if (temp[2] > radiusList[1] + Game.containerW / 2) {
                ArrowFly.drawArrow(temp[2], temp[3], 2 * Math.PI - temp[1]);
                temp[2] -= 20;
                temp[3] += 20 * radiusList[defaults.circleNum - 2] / temp2[defaults.circleNum - 2];
            } else if (temp[2] > Game.containerW / 2) {// 移至第一圆圆心出渐渐转换角度至水平
                ArrowFly.drawArrow(temp[2], temp[3], 2 * Math.PI - temp[1]);
                temp[2] -= radiusList[1] / (temp[1] / Math.PI * 30);// 总距离除以总时间
                temp[3] += radiusList[1] / (temp[1] / Math.PI * 30) * Math.tan(temp[4]);
                temp[4] -= Math.PI / 30;
                if (temp[4] < 0)
                    temp[4] = 0;
            } else if (temp[2] > Game.containerW / 2 - radiusList[2]) {// 移至原点渐渐转换角度至第二大圆圆心倾斜度
                ArrowFly.drawArrow(temp[2], temp[3], temp[4]);
                temp[2] -= radiusList[2] / (Math.atan(radiusList[defaults.circleNum - 1] / temp2[defaults.circleNum - 1]) / Math.PI * 30);
                temp[3] -= radiusList[2] / (Math.atan(radiusList[defaults.circleNum - 1] / temp2[defaults.circleNum - 1]) / Math.PI * 30)
                    * Math.tan(temp[4]);
                temp[4] += Math.PI / 30;
                if (temp[4] > Math.atan(radiusList[defaults.circleNum - 1] / temp2[defaults.circleNum - 1]))
                    temp[4] = Math.atan(radiusList[defaults.circleNum - 1] / temp2[defaults.circleNum - 1]);
            } else if (temp[2] > 0) {
                ArrowFly.drawArrow(temp[2], temp[3], temp[4]);
                temp[2] -= 20;
                temp[3] -= 20 * radiusList[defaults.circleNum - 1] / temp2[defaults.circleNum - 1];
            } else {
                ArrowFly.destroy();
                temp1 = 0;
            }
            Game.interval(Game.rollCircleRecovery, defaults.time, obj);
        },
        rollCircleRecovery: function () {
            var len = obj.length;
            for (var i = 0; i < len; i++) {
                // 最大圈不变换
                if (obj[i].loop != defaults.circleNum) {
                    // 如果小于最大偏移量及时间，继续滚动
                    if (Game.loopNum <= temp[0] && temp2[obj[i].loop] >= obj[i].loop * (temp[0] - Game.loopNum)) {//
                        if (obj[i].loop % 2 == 0) {
                            obj[i].rollLeft(Math.PI / (45 + obj[i].loop), obj[i].loop * (temp[0] - Game.loopNum),
                                radiusList[defaults.circleNum] - obj[i].r);
                        } else {
                            obj[i].rollRight(Math.PI / (45 + obj[i].loop), obj[i].loop * (temp[0] - Game.loopNum),
                                radiusList[defaults.circleNum] - obj[i].r);
                        }
                    }
                } else if (Game.loopNum > temp[0] && Game.loopNum <= temp[0] + defaults.period) {
                    obj[i].cancelSpreadX(defaults.period);
                    obj[i].moveUp(obj[i].r / defaults.period);
                } else if (Game.loopNum > temp[0] + defaults.period) {
                    temp1 = 0;
                }
            }
            if (temp1 == 0) {
                for (var i = 0; i < len; i++) {
                    bomb = new Bomb(obj[i].r, obj[i].angle, obj[i].loop, obj[i].color);
                    bombList.push(bomb);
                }
            }
            Game.interval(Game.makeBall, defaults.time, obj);
        },
        makeBall: function () {
            var len = obj.length;
            for (var i = 0; i < len; i++) {
                if (Game.loopNum < 90) {
                    obj[i].roll3Dx(Math.PI / 45);
                } else if (Game.loopNum < 90 + defaults.period) {
                    obj[i].moveUp(radiusList[defaults.circleNum - obj[i].loop] / defaults.period);
                } else {
                    temp1 = 0;
                }
            }
            if (temp1 == 0) {
                temp1 = 1;
                Game.loopNum = 0;
                clearInterval(Game.bombId);
                //Game.drawxy(Game.containerW / 2, Game.containerH / 2);
            } else {
                Game.loopNum++;
                Game.drawList(Game.containerW, Game.containerH, obj);
            }
        },
        startMouse: function () {
            var x = y = 0;
            $("#canvas").mousemove(function (event) {
                x = event.clientX;
                y = event.clientY;
                var w = parseInt($(window).width()) / 2;
                x = x - w;
                y = y - 250 - 93;
                var len = obj.length;
                for (var i = 0; i < len; i++) {
                    obj[i].ext = obj[i].x - x;
                    obj[i].ext1 = obj[i].y - y;
                }
                clearInterval(Game.bombId);
                Game.bombId = setInterval(Game.mouseMove(), defaults.time);
            });
        },
        mouseMove: function () {
            var len = obj.length;
            for (var i = 0; i < len; i++) {
                obj[i].x += obj[i].ext / 20;
                obj[i].y += obj[i].ext1 / 20;
            }
            Game.drawList(Game.containerW, Game.containerH, obj);
        }
    };

    var Bomb = function (r, angle, loopNum, color) {
        this.x = r * Math.sin(angle);
        this.y = r * Math.cos(angle);
        this.r = r;
        this.color = color;
        this.angle = angle;
        this.loop = loopNum;
        this.ext = angle;// 临时属性
        this.ext1 = r;
        this.ext2 = 0;
    };

    Bomb.prototype = {
        // 左移
        moveLeft: function (speed) {
            this.x -= speed;
        },
        moveRight: function (speed) {
            this.x += speed;
        },
        moveUp: function (speed) {
            this.y -= speed;
        },
        moveDown: function (speed) {
            this.y += speed;
        },
        // 角度递增，等同逆时针旋转
        rotateUp: function (angle) {
            this.angle = angle + this.angle;
            this.x = this.r * Math.sin(this.angle);
            this.y = this.r * Math.cos(this.angle);
        },
        // 角度递减
        rotateDown: function (angle) {
            this.angle = this.angle - angle;
            this.x = this.r * Math.sin(this.angle);
            this.y = this.r * Math.cos(this.angle);
        },
        // 角度递增，半径递增
        radiusAdd: function (angle) {
            this.angle = this.angle - angle;
            this.r += 2;
            this.x = this.r * Math.sin(this.angle);
            this.y = this.r * Math.cos(this.angle);
        },
        // 角度递减，半径递减
        radiusReduce: function (angle) {
            this.angle = this.angle - angle;
            this.r -= 2;
            this.x = this.r * Math.sin(this.angle);
            this.y = this.r * Math.cos(this.angle);
        },
        // 向左滚动，angle：滚动的角度变换量，speedrate：相当于x轴的总偏移量（随时间改变），dis：相对应y轴的偏移量
        rollLeft: function (angle, speedrate, dis) {
            this.angle = this.angle + angle;
            this.x = this.r * Math.sin(this.angle);
            this.x = this.x - speedrate;
            this.y = dis + this.r * Math.cos(this.angle);
        },
        // 向右滚动，angle：滚动的角度变换量，speedrate：相当于x轴的总偏移量（随时间改变），dis：相对应y轴的偏移量
        rollRight: function (angle, speedrate, dis) {
            this.angle = this.angle - angle;
            this.x = this.r * Math.sin(this.angle);
            this.x = this.x + speedrate;
            this.y = dis + this.r * Math.cos(this.angle);
        },
        roll3Dx: function (angle) {
            this.angle = this.angle - angle;
            this.x = this.r * Math.sin(this.angle);
        },
        roll3Dy: function (angle) {
            this.angle = this.angle - angle;
            this.y = this.r * Math.cos(this.angle);
        },
        // 抛物线降落到Y轴底
        landY: function () {
            this.ext1 += 3; // 加速度
            this.ext1 *= 0.97; // 摩
            if (this.y + this.ext1 >= Game.containerH / 2 - 50) {// 判断是否到底边
                this.y = Game.containerH / 2 - 50;// 不能越界
                this.ext1 *= -1;// 到了底边后往相反的方向运动
            } else {
                this.y = this.y + this.ext1;// 正常的运动
            }
            if (this.ext2 && this.y == Game.containerH / 2 - 50) {
            }//如果上次就到了终点，这次还在终点这儿没有动，则说明已经停止了
            else {
                this.x += this.ext;
            }
            this.ext2 = (this.y == Game.containerH / 2 - 50);
        },
        // 伸展至X轴
        spreadX: function (per) {
            if (this.ext1 == this.r) {
                if (this.x >= 0)
                    this.ext1 = this.ext1 * this.ext / per;
                else
                    this.ext1 = this.ext1 * (2 * Math.PI - this.ext) / per;
            }
            if (this.ext2 == 0) {
                this.ext2 = -this.y / per;
            }
            if (this.x > 0)
                this.x = this.x + this.ext1;
            else
                this.x = this.x - this.ext1;
            this.y = this.y + this.ext2;
        },
        // 从X轴回归到圆
        cancelSpreadX: function (per) {
            if (this.x > 0)
                this.x = this.x - this.ext1;
            else
                this.x = this.x + this.ext1;
            this.y = this.y - this.ext2;
        }
    };

    var Util = {
        randomColor: function () {
            var arrHex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
            var strHex = "#";
            var index;
            for (var i = 0; i < 6; i++) {
                index = Math.round(Math.random() * 15);
                strHex += arrHex[index];
            }
            return strHex;
        },
        // 同心圆所有节点距离相等时，返回半径
        distanceRadius: function (radius, len) {
            return radius * Math.sin(Math.PI / 4) * Math.sin(Math.PI / 2 - Math.PI / len)
                / (Math.sin(135 * Math.PI / 180) * Math.sin(2 * Math.PI / len));
        },
        // 同心圆所有距离相等时，返回半径
        simeRadius: function (radius, loopNum) {
            return radius * loopNum;
        }
    };

    var Arrow = {
        ele: null,
        init: function () {
            this.ele = $(document.createElement("canvas")).css({
                position: "absolute",
                left: 0,
                top: document.getElementById('canvas').offsetTop
            }).appendTo(document.getElementById("math-content"));
            this.ctx = this.ele.attr("width", Game.containerW).attr("height", 400)[0].getContext("2d");
            return this;
        },
        destroy: function () {
            this.ele.remove();
            this.ctx = null;
            return null;
        },
        // 画箭，画布原点(x,y)，angle：偏转角度，size：缩放大小
        drawArrow: function (x, y, angle) {
            this.ctx.save();
            this.ctx.clearRect(0, 0, Game.containerW, Game.containerH);
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            var mygradient = this.ctx.createLinearGradient(5 / 2, -5 / 2, 100, 5);
            mygradient.addColorStop(0, "#FF0000");
            mygradient.addColorStop(1, "#B1D658");
            this.ctx.fillStyle = mygradient;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = "#B1D658";
            // 箭中部主体
            this.ctx.fillRect(5 / 2, -5 / 2, 100, 5);

            // 箭头左上
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#FF0000';
            this.ctx.lineWidth = 5 / 2;
            this.ctx.lineCap = "round";
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(16, -10);
            // 箭头右上
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(16, 10);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.strokeStyle = '#B1D658';
            this.ctx.lineWidth = 5 / 2;
            this.ctx.lineCap = "round";
            // 箭尾右上
            this.ctx.moveTo(101, -1);
            this.ctx.lineTo(107, -7);
            // 箭尾上横线
            this.ctx.moveTo(107, -7);
            this.ctx.lineTo(127, -7);
            // 箭尾顶花纹
            this.ctx.moveTo(114, -7);
            this.ctx.lineTo(106, 0);
            this.ctx.moveTo(106, 0);
            this.ctx.lineTo(110, 4);
            // 箭尾左下回中
            this.ctx.moveTo(127, -7);
            this.ctx.lineTo(120, 0);
            // 箭尾右下
            this.ctx.moveTo(120, 0);
            this.ctx.lineTo(127, 7);
            // 箭尾底横线
            this.ctx.moveTo(127, 7);
            this.ctx.lineTo(107, 7);
            // 箭尾底花纹
            this.ctx.moveTo(120, 7);
            this.ctx.lineTo(113, 0);
            this.ctx.moveTo(113, 0);
            this.ctx.lineTo(117, -4);
            // 箭尾坐上至主体
            this.ctx.moveTo(107, 7);
            this.ctx.lineTo(101, 1);
            this.ctx.stroke();
            this.ctx.restore();
        }
    };
})(jQuery);
