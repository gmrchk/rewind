import { hexToRgb, roundRect } from './utils';
import Kinet from 'kinet';

export class Renderer {
    constructor(options) {
        // helper variables
        this.isDisplayed = false;
        this.finishTimeout = null;
        this.text = '';
        this.options = {
            ...options,
            mainColor: options.mainColor.includes('#') ? hexToRgb(options.mainColor) : options.mainColor,
            secondaryColor: options.secondaryColor.includes('#') ? hexToRgb(options.secondaryColor) : options.secondaryColor,
        };

        // setup and append canvas
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `position: fixed; top: 0; right: 0; bottom: 0; left: 0; pointer-events: none; display: block; width: 100%; height: 100%; z-index: 1000`;
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
        this.kinet.animate('tooltipOpacity', 100);
        this.kinet.animate('triangleOpacity', 100);
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
