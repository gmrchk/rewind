import { Dragger } from './Dragger';
import { toMMSS } from './utils';

/*!
 * Rewind
 * Draggable controls of video
 *
 * Licensed GPLv3 for open source use
 * or custom license for commercial and commercial OEM use
 *
 * https://gmrchk.github.io/rewind/
 * Copyright 2020 Georgy Marchuk
 */
export class Rewind {
    constructor(element, options) {
        this.isAdjusting = false;

        // validate element

        // options...
        const defaults = {
            onTimeChange: () => {},
            onPreviewTimeChange: () => {},
            onVolumeChange: () => {},
            onClick: () => {},

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
            ...this.options,
            element: element,
            onDragStart: this.onDragStart,
            onDragEnd: this.onDragEnd,
            onDrag: this.onDrag,
            onClick: (event) => {
                this.options.onClick(this.isAdjusting);
            },
        });
    };

    onDragStart = () => {
        this.startVolume = parseInt(this.element.volume * 100);
        this.startTime = parseInt(this.element.currentTime);
    };

    onDragEnd = (event) => {
        if (this.dragger.currentlyAdjusting === 'x') {
            this.element.currentTime = this.currentTime;
            this.options.onTimeChange({time: this.currentTime});
        }

        setTimeout(() => this.isAdjusting = false);
        this.currentTime = null;
        this.startVolume = null;
        this.startTime = null;
    };

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
    };

    destroy = () => {
        //
    };
}
