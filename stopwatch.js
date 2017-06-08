"use strict";

/* ES6 Stopwatch class, heavily inspired by https://codepen.io/_Billy_Brown/pen/dbJeh */
class StopWatch {
    constructor(display) {
        //Element that elapsed time will be rendered onto
        this.display = display;
        this.running = false;
        this.reset();
        this.print(this.times);
    }

    reset() {
        this.times = [0, 0, 0];
    }

    start() {
        //Current timestamp in milliseconds, based on page load rather than Date.now() unix timestamp from 1970
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }

    step(timestamp) {
        if (!this.running) return;
        this.calculate(timestamp);
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));

    }

    stop() {
        this.running = false;
    }

    calculate(timestamp) {

        //Get the change in timestamps between render frames
        var diff = timestamp - this.time;

        //Get hundredths of a second from milliseconds
        this.times[2] += diff / 10;

        //Increment seconds at the frame when ms >= 100
        if (this.times[2] >= 100) {
            this.times[2] -= 100;
            this.times[1] += 1;
        }

        //Increment minutes after 60 seconds have elapsed at the frame
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }

    }

    pad0(value, placecount) {
        var result = value.toString();

        for (; result.length < placecount; --placecount) {
            result = '0' + result;
        }
        return result;
    }

    format(times) {
        return `\
            ${this.pad0(times[0], 2)}:\
            ${this.pad0(times[1], 2)}:\
            ${this.pad0(Math.floor(times[2]),2)}`;
    }

    print() {
        this.display.innerHTML = this.format(this.times);
    }

}