const toMMSS = (num) => {
    const sec_num = parseInt(num, 10);
    const hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${seconds}`;
}

const roundRect = (ctx, x, y, width, height, radius, opacity = 1) => {
    const grad = ctx.createLinearGradient(0, 0, 10, 10);
    grad.addColorStop(0, `rgba(0, 0, 0, ${opacity/100})`);
    grad.addColorStop(1, `rgba(50, 50, 50, ${opacity/100})`);
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
}

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

class EventBus {
    list = {
        volumeChange: [],
        timeChange: [],
        previewTimeChange: [],
    };

    emit(event, eventObject = {}) {
        eventObject._name = event;
        this.list[event].forEach(handlerObject => {
            handlerObject.handler(eventObject);
            if (handlerObject.once) {
                this.off(event, handlerObject.handler);
            }
        });
    }

    on(event, handler, once = false) {
        if (this.list[event]) {
            this.list[event].push({once: once, handler: handler});
        } else {
            this.list[event] = [];
            this.list[event].push({once: once, handler: handler});
        }
    }

    once(event, handler) {
        this.on(event, handler, true);
    }

    off(event, handler) {
        if (event != null) {
            if (handler != null) {
                if (this.list[event] && this.list[event].filter(eventObject => eventObject.handler === handler).length) {
                    let toRemove = this.list[event].filter(eventObject => eventObject.handler === handler)[0];
                    let index = this.list[event].indexOf(toRemove);
                    if (index > -1) {
                        this.list[event].splice(index, 1);
                    }
                } else {
                    console.warn(`Event ${event} cannot be unsubscribed - does not exist.`);
                }
            } else {
                this.list[event] = [];
            }
        } else {
            this.list = {};
        }
    }
}

class Renderer {
    constructor(options) {
        // helper variables
        this.isDisplayed = false;
        this.isTooltipDisplayed = false;
        this.finishTimeout = null;
        this.text = '';
        this.options = {
            ...options,
            mainColor: options.mainColor.includes('#') ? hexToRgb(options.mainColor) : options.mainColor,
            secondaryColor: options.secondaryColor.includes('#') ? hexToRgb(options.secondaryColor) : options.secondaryColor,
        };

        // setup and append canvas
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `position: fixed; top: 0; right: 0; bottom: 0; left: 0; pointer-events: none; display: block; width: 100%; height: 100%;`;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        document.body.appendChild(canvas);

        // trigger positioning
        this.onWindowResize();

        // setup kinet instance for animating
        this.kinet = new Kinet({
            names: ["x1", "y1", "x2", "y2", "opacity", "tooltipOpacity", "triangleOpacity", "triangleDistort"],
            acceleration: 0.1,
            friction: 0.35
        });

        this.kinet.on('tick', (instances) => {
            this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

            this.drawDot(instances.x2.current, instances.y2.current, instances.opacity.current);
            if (this.options.simpleLine) {
                this.drawLine(instances.x1.current, instances.y1.current, instances.x2.current, instances.y2.current, instances.opacity.current);
            } else {
                this.drawTriangle(instances.x1.current, instances.y1.current, instances.x2.current, instances.y2.current, instances.triangleOpacity.current, instances.triangleDistort.current);
            }
            this.drawCircles(instances.x1.current, instances.y1.current, instances.opacity.current);
            this.drawTooltip(instances.x2.current, instances.y2.current, instances.tooltipOpacity.current);
        });

        this.kinet.set('triangleDistort', 26);

        // attach global listeners
        window.addEventListener('resize', this.onWindowResize);
    }

    show() {
        this.isDisplayed = true;
        clearTimeout(this.finishTimeout);
        this.kinet.animate('opacity', 100);
    }

    showTooltip() {
        this.isTooltipDisplayed = true;
        this.kinet.animate('tooltipOpacity', 100);
        this.kinet.animate('triangleOpacity', 100);
        // setTimeout(() => {
        // }, 60);
    }

    hide() {
        clearTimeout(this.finishTimeout);
        this.finishTimeout = setTimeout(() => {
            this.isDisplayed = false;
            this.kinet.animate('opacity', 0);
            this.kinet.animate('tooltipOpacity', 0);
            this.kinet.set('triangleOpacity', 0);
            this.kinet.set('triangleDistort', 24);
        }, 400);
    }

    setPosition(x, y) {
        const method = this.isDisplayed ? 'animate' : 'set';
        this.kinet[method]('x1', x);
        this.kinet[method]('y1', y);
    }

    animateToPosition(x, y) {
        if (this.isDisplayed) {
            this.kinet.animate('x1', x);
            this.kinet.animate('y1', y);
        }
    }

    setCursorPosition = (x, y) => {
        this.kinet.set('x2', x);
        this.kinet.set('y2', y);
    }

    setTooltipContent = (a) => {
        this.text = a;
    }

    drawCircles = (x, y, a) => {
        const context = this.context;
        const { mainColor, secondaryColor } = this.options;

        context.beginPath();
        context.arc(x, y, Math.max(a/6, 0), 0, 2 * Math.PI, false);
        const grad = context.createLinearGradient(0, 0, 10, 10);
        grad.addColorStop(0, `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${(a)/100})`);
        grad.addColorStop(1, `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${(a)/100})`);
        context.fillStyle = grad;
        context.fill();
        context.closePath();

        context.beginPath();
        context.arc(x, y, Math.max(a/27, 0), 0, 2 * Math.PI, false);
        const grad2 = context.createLinearGradient(0, 0, 10, 10);
        grad2.addColorStop(0, `rgba(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b}, ${(a)/100})`);
        grad2.addColorStop(1, `rgba(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b}, ${(a)/100})`);
        context.fillStyle = grad2;
        context.fill();
    }

    drawDot = (x, y, a) => {
        const context = this.context;
        const { mainColor } = this.options;

        context.beginPath();
        context.arc(x, y, 4, 0, 2 * Math.PI, false);

        const grad = context.createLinearGradient(0, 0, 10, 10);
        grad.addColorStop(0, `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${(a)/100})`);
        grad.addColorStop(1, `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${(a)/100})`);
        context.fillStyle = grad;

        context.fill();
    }

    drawLine = (x1, y1, x2, y2, a) => {
        const context = this.context;
        const { mainColor } = this.options;

        context.beginPath();
        // context.moveTo(30 * Math.cos(angle) + x1, 30 * Math.sin(angle) + y1);
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${a/100})`;
        context.lineWidth = 3;
        context.stroke();

        context.shadowColor = "rgba(0, 0, 0, .3)";
        context.shadowBlur = 2;
    }

    drawTriangle = (x1, y1, x2, y2, a, distort) => {
        const context = this.context;
        const { mainColor } = this.options;

        const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        const angle = Math.atan2((y1 - y2), (x1 - x2)) - Math.PI / 2;
        const scale = a/100;

        if (distance > 80) {
            this.kinet.animate('triangleDistort', 34);
        } else {
            this.kinet.animate('triangleDistort', 26);
        }

        context.save();
        context.translate(x2,y2);
        context.rotate(angle);

        context.beginPath();
        context.moveTo(1.5, 0);
        context.bezierCurveTo(2, distance/4, -4, distance - distort, 14 * scale, distance - 9);
        context.lineTo(-14 * scale, distance - 9);
        context.bezierCurveTo( 4, distance - distort,-2, distance/4, -1.5, 0);

        context.fillStyle = `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${(a)/100})`;
        context.fill();
        context.shadowBlur = 2;
        context.restore();
    }

    drawTooltip = (x, y, a) => {
        const padding = 6;
        const movedByX = 9;
        const movedByY = 13;
        const minWidth = 26;

        const context = this.context;
        const textWidth = context.measureText(this.text).width;
        const width = Math.max( textWidth, minWidth);

        context.lineWidth = 4;
        roundRect(context, x + movedByX, y - movedByY * 2,  width + padding * 2, 19, 3, a);
        context.textAlign = 'left';
        context.font = `normal ${ this.options.fontSize }px ${ this.options.font }`;
        context.textBaseline = 'left';
        context.fillStyle = `rgba(255, 255, 255, ${a / 100})`;

        context.fillText(this.text,x + movedByX + padding + (width / 2) - (textWidth / 2),y - movedByY);
    }

    onWindowResize = () => {
        this.canvas.width = window.innerWidth * 2;
        this.canvas.height = window.innerHeight * 2;
        this.context.scale(2,2);
    }

    destroy() {
        window.removeEventListener('resize', this.onWindowResize);
        this.kinet.off();

        this.text = '';
        this.kinet = null;
        this.canvas.outerHTML = '';
        this.canvas = null;
    }
}

class Dragger {
    constructor(options) {
        // merge options
        const defaults = {
            font: 'Arial',
            fontSize: 11,
            mainColor: '#E50914',
            secondaryColor: '#ffffff',
            element: document.body,
            simpleLine: false,
            onDrag: (distance, absoluteDistance, direction, event) => {
                // returned value will be displayed in tooltip
                return direction;
            },
            onDragStart: (event) => {},
            onDragEnd: (event) => {},
            onClick: (event) => {},
        };

        this.options = {
            ...defaults,
            ...options,
        };

        this.element = this.options.element;

        // init renderer
        this.renderer = new Renderer(this.options);

        // setup listeners
        this.element.addEventListener('mousedown', this.onMouseDown);
        this.element.addEventListener('click', this.onClick);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
    }

    onMouseDown = event => {
        this.options.onDragStart(event);

        this.renderer.setCursorPosition(event.clientX, event.clientY);
        this.renderer.setPosition(event.clientX, event.clientY);

        this.pressedPosition = {
            x: event.clientX,
            y: event.clientY,
        };

        this.renderer.show();
    }

    onMouseUp = event => {
        this.options.onDragEnd(event);

        this.pressedPosition = null;
        this.currentlyAdjusting = null;

        this.renderer.animateToPosition(event.clientX, event.clientY);
        this.renderer.hide();
    }

    onClick = event => {
        this.pressedPosition = null;
        this.options.onClick(event);
    }

    onMouseMove = event => {
        if (this.pressedPosition) {
            const distance = Math.sqrt(Math.pow(this.pressedPosition.x - event.clientX, 2) + Math.pow(this.pressedPosition.y - event.clientY, 2));
            const angle = Math.atan2((this.pressedPosition.y - event.clientY), (this.pressedPosition.x - event.clientX)) * 180 / Math.PI;

            if (!this.currentlyAdjusting) {
                if (distance > 3) {
                    // save the direction we are currently adjusting
                    if (angle <= 45 && angle >= 0 || angle >= -45 && angle <= 0 || angle >= 135 || angle <= -135) {
                        this.currentlyAdjusting = "x";
                    } else {
                        this.currentlyAdjusting = "y";
                    }
                }
            } else {
                this.renderer.showTooltip();
                if (this.currentlyAdjusting === "x") {
                    const distanceX = event.clientX - this.pressedPosition.x;
                    const direction = distanceX > 0 ? 1 : -1;    // left/right

                    const text = this.options.onDrag(distanceX, distance * direction, this.currentlyAdjusting, event);
                    this.renderer.setTooltipContent(text);
                } else {
                    const distanceY = event.clientY - this.pressedPosition.y;
                    const direction = distanceY > 0 ? 1 : -1;    // up/down

                    const tooltipText = this.options.onDrag(distanceY, distance * direction, this.currentlyAdjusting, event);
                    this.renderer.setTooltipContent(tooltipText);
                }
            }

            this.renderer.setCursorPosition(event.clientX, event.clientY);
        }
    }

    destroy = () => {
        this.renderer.destroy();
    }
}

class Rewind {
    constructor(element, options) {
        this.isAdjusting = false;

        // validate element

        // options...
        const defaults = {
            // styles
            // element

            onTimeChange: () => {},
            onPreviewTimeChange: () => {},
            onVolumeChange: () => {},
            cancelClickEvent: true,

            volumeSpeed: 1,
            timeSpeed: 0.01,
        };

        this.options = {
            ...defaults,
            ...options,
        };

        // set initial helper values
        this.element = element;
        this.startVolume = null;
        this.startTime = null;

        // dragger instance
        this.dragger = new Dragger({
            onDragStart: this.onDragStart,
            onDragEnd: this.onDragEnd,
            onDrag: this.onDrag,
            onClick:
                this.options.cancelClickEvent ?
                    (event) => {
                        if (this.isAdjusting) {
                            event.preventDefault();
                        }
                    } : () => {}
        });
    }

    onDragStart = () => {
        this.startVolume = parseInt(this.element.volume * 100);
        this.startTime = parseInt(this.element.currentTime);
    }

    onDragEnd = (event) => {
        if (this.dragger.currentlyAdjusting === 'x') {
            this.element.currentTime = this.currentTime;
            this.options.onTimeChange({time: this.currentTime});
        }

        setTimeout(() => this.isAdjusting = false);
        this.currentTime = null;
        this.startVolume = null;
        this.startTime = null;
    }

    onDrag = (distance, absoluteDistance, direction, event) => {
        this.isAdjusting = true;

        if (direction === "x") {
            let currentTime = null;
            const time = parseInt(distance * this.options.timeSpeed + this.startTime);

            if (time < 0) {
                currentTime = 0;
            } else if (time > this.element.duration) {
                currentTime = this.element.duration;
            } else {
                currentTime = time;
            }

            this.currentTime = currentTime;
            this.options.onPreviewTimeChange({time: this.currentTime});

            return toMMSS(currentTime);
        } else {
            let volume = null;
            const volumeToSet = parseInt((this.startVolume) - distance * this.options.volumeSpeed / 2);

            if (volumeToSet < 0) {
                volume = 0;
            } else if (volumeToSet > 100) {
                volume = 100;
            } else {
                volume = volumeToSet;
            }

            this.element.volume = volume / 100;
            this.options.onVolumeChange({volume});

            return volume;
        }
    }

    destroy = () => {
        //
    }
}

window.Dragger = Dragger;
window.Rewind = Rewind;
//const rewind = new Rewind(document.getElementById('video'));
const dragger = new Rewind(document.getElementById('video'), {
    onTimeChange: ({time}) => {
        document.getElementById('video').currentTime = time;
        console.log("onTimeChange", time);
    },
    onPreviewTimeChange: ({time}) => {
        console.log("onPreviewTimeChange", time);
    },
    onVolumeChange: ({volume}) => {
        console.log("onVolumeChange", volume);
    },
});

console.log(dragger);
