(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Dragger"] = factory();
	else
		root["Dragger"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Dragger = __webpack_require__(1);

module.exports = _Dragger.Dragger;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Dragger = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Renderer = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dragger = exports.Dragger = function Dragger(options) {
    var _this = this;

    _classCallCheck(this, Dragger);

    this.onMouseDown = function (event) {
        _this.options.onDragStart(event);

        _this.renderer.setCursorPosition(event.clientX, event.clientY);
        _this.renderer.setPosition(event.clientX, event.clientY);

        _this.pressedPosition = {
            x: event.clientX,
            y: event.clientY
        };

        _this.renderer.show();
    };

    this.onMouseUp = function (event) {
        _this.options.onDragEnd(event);

        _this.pressedPosition = null;
        _this.currentlyAdjusting = null;

        _this.renderer.animateToPosition(event.clientX, event.clientY);
        _this.renderer.hide();
    };

    this.onClick = function (event) {
        _this.pressedPosition = null;
        _this.options.onClick(event);
    };

    this.onMouseMove = function (event) {
        if (_this.pressedPosition) {
            var distance = Math.sqrt(Math.pow(_this.pressedPosition.x - event.clientX, 2) + Math.pow(_this.pressedPosition.y - event.clientY, 2));
            var angle = Math.atan2(_this.pressedPosition.y - event.clientY, _this.pressedPosition.x - event.clientX) * 180 / Math.PI;

            if (!_this.currentlyAdjusting) {
                if (distance > 3) {
                    // save the direction we are currently adjusting
                    if (angle <= 45 && angle >= 0 || angle >= -45 && angle <= 0 || angle >= 135 || angle <= -135) {
                        _this.currentlyAdjusting = "x";
                    } else {
                        _this.currentlyAdjusting = "y";
                    }
                }
            } else {
                _this.renderer.showTooltip();
                if (_this.currentlyAdjusting === "x") {
                    var distanceX = event.clientX - _this.pressedPosition.x;
                    var direction = distanceX > 0 ? 1 : -1; // left/right

                    var text = _this.options.onDrag(distanceX, distance * direction, _this.currentlyAdjusting, event);
                    _this.renderer.setTooltipContent(text);
                } else {
                    var distanceY = event.clientY - _this.pressedPosition.y;
                    var _direction = distanceY > 0 ? 1 : -1; // up/down

                    var tooltipText = _this.options.onDrag(distanceY, distance * _direction, _this.currentlyAdjusting, event);
                    _this.renderer.setTooltipContent(tooltipText);
                }
            }

            _this.renderer.setCursorPosition(event.clientX, event.clientY);
        }
    };

    this.destroy = function () {
        _this.renderer.destroy();
    };

    // merge options
    var defaults = {
        font: 'Arial',
        fontSize: 11,
        mainColor: '#E50914',
        secondaryColor: '#ffffff',
        element: document.body,
        simpleLine: false,
        onDrag: function onDrag(distance, absoluteDistance, direction, event) {
            // returned value will be displayed in tooltip
            return direction;
        },
        onDragStart: function onDragStart(event) {},
        onDragEnd: function onDragEnd(event) {},
        onClick: function onClick(event) {}
    };

    this.options = _extends({}, defaults, options);

    this.element = this.options.element;

    // init renderer
    this.renderer = new _Renderer.Renderer(this.options);

    // setup listeners
    this.element.addEventListener('mousedown', this.onMouseDown);
    this.element.addEventListener('click', this.onClick);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Renderer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(3);

var _kinet = __webpack_require__(4);

var _kinet2 = _interopRequireDefault(_kinet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Renderer = exports.Renderer = function () {
    function Renderer(options) {
        var _this = this;

        _classCallCheck(this, Renderer);

        this.setCursorPosition = function (x, y) {
            _this.kinet.set('x2', x);
            _this.kinet.set('y2', y);
        };

        this.setTooltipContent = function (a) {
            _this.text = a;
        };

        this.drawCircles = function (x, y, a) {
            var context = _this.context;
            var _options = _this.options,
                mainColor = _options.mainColor,
                secondaryColor = _options.secondaryColor;


            context.beginPath();
            context.arc(x, y, Math.max(a / 6, 0), 0, 2 * Math.PI, false);
            var grad = context.createLinearGradient(0, 0, 10, 10);
            grad.addColorStop(0, 'rgba(' + mainColor.r + ', ' + mainColor.g + ', ' + mainColor.b + ', ' + a / 100 + ')');
            grad.addColorStop(1, 'rgba(' + mainColor.r + ', ' + mainColor.g + ', ' + mainColor.b + ', ' + a / 100 + ')');
            context.fillStyle = grad;
            context.fill();
            context.closePath();

            context.beginPath();
            context.arc(x, y, Math.max(a / 27, 0), 0, 2 * Math.PI, false);
            var grad2 = context.createLinearGradient(0, 0, 10, 10);
            grad2.addColorStop(0, 'rgba(' + secondaryColor.r + ', ' + secondaryColor.g + ', ' + secondaryColor.b + ', ' + a / 100 + ')');
            grad2.addColorStop(1, 'rgba(' + secondaryColor.r + ', ' + secondaryColor.g + ', ' + secondaryColor.b + ', ' + a / 100 + ')');
            context.fillStyle = grad2;
            context.fill();
        };

        this.drawDot = function (x, y, a) {
            var context = _this.context;
            var mainColor = _this.options.mainColor;


            context.beginPath();
            context.arc(x, y, 4, 0, 2 * Math.PI, false);

            var grad = context.createLinearGradient(0, 0, 10, 10);
            grad.addColorStop(0, 'rgba(' + mainColor.r + ', ' + mainColor.g + ', ' + mainColor.b + ', ' + a / 100 + ')');
            grad.addColorStop(1, 'rgba(' + mainColor.r + ', ' + mainColor.g + ', ' + mainColor.b + ', ' + a / 100 + ')');
            context.fillStyle = grad;

            context.fill();
        };

        this.drawLine = function (x1, y1, x2, y2, a) {
            var context = _this.context;
            var mainColor = _this.options.mainColor;


            context.beginPath();
            // context.moveTo(30 * Math.cos(angle) + x1, 30 * Math.sin(angle) + y1);
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.strokeStyle = 'rgba(' + mainColor.r + ', ' + mainColor.g + ', ' + mainColor.b + ', ' + a / 100 + ')';
            context.lineWidth = 3;
            context.stroke();

            context.shadowColor = "rgba(0, 0, 0, .3)";
            context.shadowBlur = 2;
        };

        this.drawTriangle = function (x1, y1, x2, y2, a, distort) {
            var context = _this.context;
            var mainColor = _this.options.mainColor;


            var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            var angle = Math.atan2(y1 - y2, x1 - x2) - Math.PI / 2;
            var scale = a / 100;

            if (distance > 80) {
                _this.kinet.animate('triangleDistort', 34);
            } else {
                _this.kinet.animate('triangleDistort', 26);
            }

            context.save();
            context.translate(x2, y2);
            context.rotate(angle);

            context.beginPath();
            context.moveTo(1.5, 0);
            context.bezierCurveTo(2, distance / 4, -4, distance - distort, 14 * scale, distance - 9);
            context.lineTo(-14 * scale, distance - 9);
            context.bezierCurveTo(4, distance - distort, -2, distance / 4, -1.5, 0);

            context.fillStyle = 'rgba(' + mainColor.r + ', ' + mainColor.g + ', ' + mainColor.b + ', ' + a / 100 + ')';
            context.fill();
            context.shadowBlur = 2;
            context.restore();
        };

        this.drawTooltip = function (x, y, a) {
            var padding = 6;
            var movedByX = 9;
            var movedByY = 13;
            var minWidth = 26;

            var context = _this.context;
            var textWidth = context.measureText(_this.text).width;
            var width = Math.max(textWidth, minWidth);

            context.lineWidth = 4;
            (0, _utils.roundRect)(context, x + movedByX, y - movedByY * 2, width + padding * 2, 19, 3, a);
            context.textAlign = 'left';
            context.font = 'normal ' + _this.options.fontSize + 'px ' + _this.options.font;
            context.textBaseline = 'left';
            context.fillStyle = 'rgba(255, 255, 255, ' + a / 100 + ')';

            context.fillText(_this.text, x + movedByX + padding + width / 2 - textWidth / 2, y - movedByY);
        };

        this.onWindowResize = function () {
            _this.canvas.width = window.innerWidth * 2;
            _this.canvas.height = window.innerHeight * 2;
            _this.context.scale(2, 2);
        };

        // helper variables
        this.isDisplayed = false;
        this.finishTimeout = null;
        this.text = '';
        this.options = _extends({}, options, {
            mainColor: options.mainColor.includes('#') ? (0, _utils.hexToRgb)(options.mainColor) : options.mainColor,
            secondaryColor: options.secondaryColor.includes('#') ? (0, _utils.hexToRgb)(options.secondaryColor) : options.secondaryColor
        });

        // setup and append canvas
        var canvas = document.createElement('canvas');
        canvas.style.cssText = 'position: fixed; top: 0; right: 0; bottom: 0; left: 0; pointer-events: none; display: block; width: 100%; height: 100%; z-index: 1000';
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        document.body.appendChild(canvas);

        // trigger positioning
        this.onWindowResize();

        // setup kinet instance for animating
        this.kinet = new _kinet2.default({
            names: ["x1", "y1", "x2", "y2", "opacity", "tooltipOpacity", "triangleOpacity", "triangleDistort"],
            acceleration: 0.1,
            friction: 0.35
        });

        this.kinet.on('tick', function (instances) {
            _this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

            _this.drawDot(instances.x2.current, instances.y2.current, instances.opacity.current);
            if (_this.options.simpleLine) {
                _this.drawLine(instances.x1.current, instances.y1.current, instances.x2.current, instances.y2.current, instances.opacity.current);
            } else {
                _this.drawTriangle(instances.x1.current, instances.y1.current, instances.x2.current, instances.y2.current, instances.triangleOpacity.current, instances.triangleDistort.current);
            }
            _this.drawCircles(instances.x1.current, instances.y1.current, instances.opacity.current);
            _this.drawTooltip(instances.x2.current, instances.y2.current, instances.tooltipOpacity.current);
        });

        this.kinet.set('triangleDistort', 26);

        // attach global listeners
        window.addEventListener('resize', this.onWindowResize);
    }

    _createClass(Renderer, [{
        key: 'show',
        value: function show() {
            this.isDisplayed = true;
            clearTimeout(this.finishTimeout);
            this.kinet.animate('opacity', 100);
        }
    }, {
        key: 'showTooltip',
        value: function showTooltip() {
            this.kinet.animate('tooltipOpacity', 100);
            this.kinet.animate('triangleOpacity', 100);
        }
    }, {
        key: 'hide',
        value: function hide() {
            var _this2 = this;

            clearTimeout(this.finishTimeout);
            this.finishTimeout = setTimeout(function () {
                _this2.isDisplayed = false;
                _this2.kinet.animate('opacity', 0);
                _this2.kinet.animate('tooltipOpacity', 0);
                _this2.kinet.set('triangleOpacity', 0);
                _this2.kinet.set('triangleDistort', 24);
            }, 400);
        }
    }, {
        key: 'setPosition',
        value: function setPosition(x, y) {
            var method = this.isDisplayed ? 'animate' : 'set';
            this.kinet[method]('x1', x);
            this.kinet[method]('y1', y);
        }
    }, {
        key: 'animateToPosition',
        value: function animateToPosition(x, y) {
            if (this.isDisplayed) {
                this.kinet.animate('x1', x);
                this.kinet.animate('y1', y);
            }
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            window.removeEventListener('resize', this.onWindowResize);
            this.kinet.off();

            this.text = '';
            this.kinet = null;
            this.canvas.outerHTML = '';
            this.canvas = null;
        }
    }]);

    return Renderer;
}();

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var toMMSS = exports.toMMSS = function toMMSS(num) {
    var sec_num = parseInt(num, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return minutes + ":" + seconds;
};

var roundRect = exports.roundRect = function roundRect(ctx, x, y, width, height, radius) {
    var opacity = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;

    var grad = ctx.createLinearGradient(0, 0, 10, 10);
    grad.addColorStop(0, "rgba(0, 0, 0, " + opacity / 100 + ")");
    grad.addColorStop(1, "rgba(50, 50, 50, " + opacity / 100 + ")");
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fill();
    ctx.closePath();
};

var hexToRgb = exports.hexToRgb = function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Kinet = function () {
    function Kinet(options) {
        var _this = this;

        _classCallCheck(this, Kinet);

        this._handlers = {
            set: [],
            start: [],
            tick: [],
            end: []
        };

        var dafaults = {
            friction: 1 - 0.3,
            acceleration: 0.04,
            initialValue: 0,
            names: ["x"],
            test: function test(instance) {
                return Math.abs(instance.current - instance.target) > 0.1;
            }
        };

        this._options = _extends({}, dafaults, options);

        // to set correct value (1 - x)
        if (options && options.friction) {
            this._options.friction = 1 - options.friction;
        }

        this._instances = {};
        this._options.names.forEach(function (name) {
            _this._instances[name] = new KinetItem(_this._options.initialValue, _this._options.acceleration, _this._options.friction);
        });

        this._raf = null;
    }

    _createClass(Kinet, [{
        key: 'set',
        value: function set(name, num) {
            var _this2 = this;

            if (num == null) {
                console.warn('Define a value.');
                return;
            }
            if (this._instances[name] == null) {
                console.warn('Instance "' + name + '" doesn\'t exist.');
                return;
            }
            this._instances[name].current = num;
            this._instances[name].target = num;
            if (!this._raf) {
                this._handlers['set'].forEach(function (handler) {
                    return handler(_this2._instances);
                });
                this._handlers['tick'].forEach(function (handler) {
                    return handler(_this2._instances);
                });
            }
        }
    }, {
        key: 'animate',
        value: function animate(name, num) {
            var _this3 = this;

            if (num == null) {
                console.warn('Define a value.');
                return;
            }
            if (this._instances[name] == null) {
                console.warn('Instance ' + name + ' doesn\'t exist.');
                return;
            }
            if (this._instances[name].target !== num) {
                this._instances[name].target = num;
                if (!this._raf) {
                    this._handlers['start'].forEach(function (handler) {
                        return handler(_this3._instances, _this3._instances);
                    });
                    this._animateValues();
                }
                return num;
            }

            return false;
        }
    }, {
        key: '_animateValues',
        value: function _animateValues() {
            var _this4 = this;

            var done = true;

            Object.keys(this._instances).forEach(function (key) {
                _this4._instances[key].update();

                if (_this4._options.test(_this4._instances[key])) {
                    done = false;
                }
            });

            if (!done) {
                this._raf = requestAnimationFrame(this._animateValues.bind(this));
                this._handlers['tick'].forEach(function (handler) {
                    return handler(_this4._instances);
                });
            } else {
                // set to final values
                Object.keys(this._instances).forEach(function (key) {
                    _this4._instances[key].current = _this4._instances[key].target;
                    _this4._instances[key].velocity = 0;
                });

                this._handlers['tick'].forEach(function (handler) {
                    return handler(_this4._instances);
                });
                this._handlers['end'].forEach(function (handler) {
                    return handler(_this4._instances);
                });
                this._raf = null;
            }
        }
    }, {
        key: 'on',
        value: function on(event, handler) {
            if (this._handlers[event]) {
                this._handlers[event].push(handler);
            } else {
                console.warn('Unsupported event ' + event + '.');
            }
        }
    }, {
        key: 'off',
        value: function off(event, handler) {
            var _this5 = this;

            if (event != null) {
                if (handler != null) {
                    if (this._handlers[event] && this._handlers[event].filter(function (savedHandler) {
                        return savedHandler === handler;
                    }).length) {
                        var toRemove = this._handlers[event].filter(function (savedHandler) {
                            return savedHandler === handler;
                        })[0];
                        var index = this._handlers[event].indexOf(toRemove);
                        if (index > -1) {
                            this._handlers[event].splice(index, 1);
                        }
                    } else {
                        console.warn('Handler for event ' + event + ' no found.');
                    }
                } else {
                    this._handlers[event] = [];
                }
            } else {
                Object.keys(this._handlers).forEach(function (keys) {
                    _this5._handlers[keys] = [];
                });
            }
        }
    }]);

    return Kinet;
}();

exports.default = Kinet;

var KinetItem = function () {
    function KinetItem(intitalValue, acceleration, friction) {
        _classCallCheck(this, KinetItem);

        this.current = intitalValue;
        this.target = intitalValue;
        this._acceleration = acceleration;
        this._friction = friction;
        this.velocity = 0;
    }

    _createClass(KinetItem, [{
        key: 'update',
        value: function update() {
            var distance = this.target - this.current;
            var attraction = distance * this._acceleration;

            this.applyForce(attraction);

            this.velocity *= this._friction;
            this.current += this.velocity;

            return distance;
        }
    }, {
        key: 'applyForce',
        value: function applyForce(force) {
            this.velocity += force;
        }
    }]);

    return KinetItem;
}();

/***/ })
/******/ ]);
});