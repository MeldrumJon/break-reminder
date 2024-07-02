
export default class SecondsTimer {
    /*
     * cb_update: Called when the remaining seconds are updated.  Will continue
     *            to be called, even after timeup (seconds remaining will be 
     *            negative).
     * cb_timeup: Called when the seconds remaining reach 0.
     */
    constructor(seconds, cb_update, cb_timeup) {
        this.seconds    = seconds;
        this.cb_update  = cb_update;
        this.cb_timeup  = cb_timeup;

        this.remainder  = seconds;
        this.target     = null
        this.intervalID = null;
        if (this.cb_update) { this.cb_update(this.remainder); }
    }

    _update() {
        let difference = this.target.getTime() - Date.now();
        let last_rem = this.remainder;
        this.remainder = Math.floor((difference-1)/1000);
        if (this.cb_update) { this.cb_update(this.remainder); }
        if (last_rem >= 0 && this.remainder < 0) { // Timeup
            if (this.cb_timeup) { this.cb_timeup(); }
        }
    }

    set_seconds(seconds) {
        this.seconds = seconds;
        if (!this.running()) {
            this.remainder = this.seconds;
            if (this.cb_update) { this.cb_update(this.remainder); }
        }
    }

    action(str) {
        switch (str) {
            case "start":
                this.start();
                break;
            case "pause":
                this.pause();
                break;
            case "stop":
                this.stop();
                break;
            case "restart":
                this.restart();
                break;
            case "restart_timeup":
                if (this.timeup()) {
                    this.restart();
                }
                break;
            case "none":
            default:
                break;
        }
    }

    start() {
        if (!this.running()) {
            this.target = new Date(Date.now() + 1000*this.remainder);
            this.intervalID = window.setInterval(this._update.bind(this), 1000);
            this._update();
        }
    }

    pause() {
        window.clearInterval(this.intervalID);
        this.intervalID = null;
        if (this.cb_update) { this.cb_update(this.remainder); }
    }

    stop() {
        this.pause();
        this.remainder = this.seconds;
        if (this.cb_update) { this.cb_update(this.remainder); }
    }

    restart() {
        this.stop();
        this.start();
    }

    running() { return (this.intervalID!==null); }
    paused() { return (!this.running() && this.remainder !== this.seconds); }
    stopped() { return (!this.running() && this.remainder === this.seconds); }
    timeup() { return (this.remainder < 0); }
}

