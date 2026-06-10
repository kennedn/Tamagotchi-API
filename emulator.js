/* VERSION 1.1 */

const loadScripts = require('./loadScripts');
const NULL = 0;

class Emulator {
    // `romSource` is JS source that defines `var my_program = [ ... ];`
    constructor(romSource) {
        this.ctx = loadScripts([
            './hal.js',
            './hw.js',
            './cpu.js',
            './tamalib.js'
        ], romSource);

        this.program = this.ctx.my_program;

        this.ctx.g_hal = this.ctx.hal_t;
        this.ctx.tamalib_register_hal(this.ctx.hal_t);
    }

    setState(stateStr) {
        this.ctx.cpu_init_from_state(
            this.program,
            JSON.parse(stateStr),
            NULL,
            1000000
        );
    }

    getState() {
        return JSON.stringify(this.ctx.tamalib_get_state());
    }

    step() {
        this.ctx.tamalib_step();
    }

    // Virtual wall-clock (microseconds), used by the driver loop to pace stepping
    // against real time without busy-waiting. See manager.js startLoop.
    refTs() {
        return this.ctx.tamalib_get_ref_ts();
    }

    // Re-anchor the virtual clock to "now". Call this before (re)starting the loop
    // so a freshly loaded/restored pet doesn't try to replay stale virtual time.
    syncClock() {
        this.ctx.tamalib_sync_ref_timestamp();
    }
}

module.exports = Emulator;