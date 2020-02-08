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

class Rendered {
    constructor(options) {
        this.options = options;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = `position: fixed; top: 0; right: 0; bottom: 0; left: 0; pointer-events: none; display: block; width: 100%; height: 100%;`;

        this.isDisplayed = false;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.kinet = new Kinet({
            names: ["x1", "y1", "x2", "y2", "opacity"],
            acceleration: 0.1,
            friction: 0.35
        });
        this.finishTimeout = null;

        document.body.appendChild(canvas);

        this.kinet.on('tick', (instances) => {
            this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

            this.drawDot(instances.x2.current, instances.y2.current, instances.opacity.current);
            this.drawLine(instances.x1.current, instances.y1.current, instances.x2.current, instances.y2.current, instances.opacity.current);
            this.drawCircles(instances.x1.current, instances.y1.current, instances.opacity.current);
            this.drawTooltip(instances.x2.current, instances.y2.current, instances.opacity.current);
        });

        this.text = '';

        window.addEventListener('resize', this.onWindowResize);
        this.onWindowResize();
    }

    destroy = () => {
        window.removeEventListener('resize', this.onWindowResize);
        this.kinet.off();
        this.text = '';
        this.kinet = null;
        this.canvas.outerHTML = '';
        this.canvas = null;
    }

    show() {
        this.isDisplayed = true;
        clearTimeout(this.finishTimeout);
        this.kinet.animate('opacity', 100);
    }

    hide() {
        clearTimeout(this.finishTimeout);
        this.finishTimeout = setTimeout(() => {
            this.isDisplayed = false;
            this.kinet.animate('opacity', 0);
        }, 400);
    }

    setPosition(x, y) {
        const method = this.isDisplayed ? 'animate' : 'set';
        this.kinet[method]('x1', x);
        this.kinet[method]('y1', y);
    }

    animateToPosition(x, y) {
        this.kinet.animate('x1', x);
        this.kinet.animate('y1', y);
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
        grad.addColorStop(0, `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${(a-10)/100})`);
        grad.addColorStop(1, `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${(a-10)/100})`);
        context.fillStyle = grad;
        context.fill();
        context.closePath();

        context.beginPath();
        context.arc(x, y, Math.max(a/27, 0), 0, 2 * Math.PI, false);
        const grad2 = context.createLinearGradient(0, 0, 10, 10);
        grad2.addColorStop(0, `rgba(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b}, ${(a-10)/100})`);
        grad2.addColorStop(1, `rgba(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b}, ${(a-10)/100})`);
        context.fillStyle = grad2;
        context.fill();
    }

    drawDot = (x, y, a) => {
        const context = this.context;
        const { mainColor } = this.options;

        context.beginPath();
        context.arc(x, y, 4, 0, 2 * Math.PI, false);

        const grad = context.createLinearGradient(0, 0, 10, 10);
        grad.addColorStop(0, `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${(a-10)/100})`);
        grad.addColorStop(1, `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, ${(a-10)/100})`);
        context.fillStyle = grad;

        context.fill();
    }

    drawLine = (x1, y1, x2, y2, a) => {
        const context = this.context;
        const { mainColor } = this.options;
        const angle = Math.atan2((y1 - y2), (x1 - x2)) * 180 / Math.PI;
        console.log(angle);

        context.beginPath();
        // context.moveTo(30 * Math.cos(angle) + x1, 30 * Math.sin(angle) + y1);
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = `rgba(${mainColor.r}, ${mainColor.g}, ${mainColor.b}, 0.7)`;
        context.lineWidth = 3;
        context.stroke();

        context.shadowColor = "rgba(0, 0, 0, .3)";
        context.shadowBlur = 2;
    }

    drawTooltip = (x, y, a) => {
        const context = this.context;

        context.lineWidth = 4;
        roundRect(context, x + 9, y - 26, 40, 19, 3, a);
        context.textAlign = 'center';
        context.font = `normal ${ this.options.fontSize }px ${ this.options.font }`;
        context.textBaseline = 'left';
        context.fillStyle = `rgba(255, 255, 255, ${a / 100})`;

        const rectX = 29;
        const rectY = -13;
        context.fillText(this.text,x + rectX,y + rectY);
    }

    onWindowResize = () => {
        this.canvas.width = window.innerWidth * 2;
        this.canvas.height = window.innerHeight * 2;
        this.context.scale(2,2);
    }
}

class Rewind {
    constructor(element, options) {
        const defaults = {
            font: 'Arial',
            fontSize: 11,
            mainColor: '#E50914',
            secondaryColor: '#ffffff',
        };

        this.options = {
            ...defaults,
            ...options,
        };
        this.element = element;

        this.pressedPosition = null;
        this.volumeSpeed = this.element.offsetHeight * 0.4;
        this.timeSpeed = 0.01;
        this.cursor = new Rendered({
            font: this.options.font,
            fontSize: this.options.fontSize,
            mainColor: hexToRgb(this.options.mainColor),
            secondaryColor: hexToRgb(this.options.secondaryColor),
        });

        this.eventbus = new EventBus();
        this.on = this.eventbus.on;
        this.off = this.eventbus.off;
        this.once = this.eventbus.once;

        this.element.addEventListener('mousedown', this.onMouseDown);
        this.element.addEventListener('click', this.onClick);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        this.element.addEventListener("loadedmetadata", this.onVideoLoaded);
    }

    destroy = () => {
        this.element.removeEventListener('mousedown', this.onMouseDown);
        this.element.removeEventListener('click', this.onClick);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);

        this.element.removeEventListener("loadedmetadata", this.onVideoLoaded);

        this.cursor = null;
        this.eventbus.off();
        this.eventbus = null;
    }

    onVideoLoaded = () => {
        this.volumeSpeed = this.element.offsetHeight * 0.4;
        this.timeSpeed = 0.1 / this.element.duration;
    }

    onMouseDown = event => {
        this.startVolume = parseInt(this.element.volume * 100);
        this.startTime = parseInt(this.element.currentTime);

        this.cursor.setCursorPosition(event.clientX, event.clientY);
        this.cursor.setPosition(event.clientX, event.clientY);

        this.pressedPosition = {
            x: event.clientX,
            y: event.clientY,
        };

        this.cursor.show();
    }

    onMouseUp = event => {
        if (this.currentlyAdjusting === 'time') {
            this.element.currentTime = this.currentTime;
            this.eventbus.emit('timeChange', { currentTime: this.currentTime });
        }

        this.pressedPosition = null;
        this.currentTime = null;
        this.angle = null;
        this.startVolume = null;
        this.startTime = null;
        this.currentlyAdjusting = null;

        this.cursor.animateToPosition(event.clientX, event.clientY);
        this.cursor.hide();

        //document.body.style.cursor = '';
    }

    onClick = event => {
        this.pressedPosition = null;
        if (this.distance > 3) {
            event.preventDefault();
        }
        this.distance = 0;
    }

    onMouseMove = () => {
        if (this.pressedPosition) {
            this.distance = Math.sqrt(Math.pow(this.pressedPosition.x - event.clientX, 2) + Math.pow(this.pressedPosition.y - event.clientY, 2));
            this.angle = Math.atan2((this.pressedPosition.y - event.clientY), (this.pressedPosition.x - event.clientX)) * 180 / Math.PI;

            if (!this.currentlyAdjusting && this.distance > 3) {
                if (this.angle <= 45 && this.angle >= 0 || this.angle >= -45 && this.angle <= 0 || this.angle >= 135 || this.angle <= -135) {
                    this.currentlyAdjusting = "time";
                } else {
                    this.currentlyAdjusting = "volume";
                }
            } else {
                //document.body.style.cursor = 'none';
            }

            this.cursor.setCursorPosition(event.clientX, event.clientY);

            if (this.currentlyAdjusting) {
                if (this.currentlyAdjusting === "time") {
                    const direction = (this.pressedPosition.x - event.clientX) < 0 ? 1 : -1;
                    const time = parseInt(this.distance * this.timeSpeed * direction + this.startTime);
                    let currentTime = null;

                    if (time < 0) {
                        currentTime = 0;
                    } else if (time > this.element.duration) {
                        currentTime = this.element.duration;
                    } else {
                        currentTime = time;
                    }

                    const timeString = toMMSS(currentTime);

                    this.currentTime = currentTime;
                    this.cursor.setTooltipContent(timeString);

                    this.eventbus.emit('previewTimeChange', {currentTime, timeString});
                } else {
                    const direction = (this.pressedPosition.y - event.clientY) > 0 ? 1 : -1;
                    const volumeToSet = parseInt(this.startVolume + direction * this.distance / this.volumeSpeed * 100);
                    let volume = null;

                    if (volumeToSet < 0) {
                        volume = 0;
                    } else if (volumeToSet > 100) {
                        volume = 100;
                    } else {
                        volume = volumeToSet;
                    }

                    this.element.volume = volume / 100;
                    this.cursor.setTooltipContent(volume);

                    this.eventbus.emit('volumeChange', {volume});
                }
            }
        }
    }
}

window.Rewind = Rewind;
const rewind = new Rewind(document.getElementById('video'));

console.log(rewind);
