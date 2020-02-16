import { Renderer } from './Renderer';

export class Dragger {
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
