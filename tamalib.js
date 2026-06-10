const tamalib_set_button = (btn, state) => {
    hw_set_button(btn, state);
};

const tamalib_set_speed = (speed) => {
    cpu_set_speed(speed);
};

tamalib_get_state = () => {
    return cpu_get_state();
};

const tamalib_refresh_hw = () => {
    cpu_refresh_hw();
};

/* Virtual wall-clock accessors used by the driver loop for real-time pacing.
 * Declared as functions (not const) so they attach to the vm global, the same
 * way tamalib_step / tamalib_get_state are reachable from emulator.js. */
function tamalib_get_ref_ts() {
    return cpu_get_ref_ts();
}

function tamalib_sync_ref_timestamp() {
    cpu_sync_ref_timestamp();
}

const tamalib_reset = () => {
    cpu_reset();
};

const tamalib_add_bp = (list, addr) => {
    cpu_add_bp(list, addr);
};

const tamalib_free_bp = (list) => {
    cpu_free_bp(list);
};

const exec_mode_t = {
    EXEC_MODE_PAUSE: 0,
	EXEC_MODE_RUN: 1,
	EXEC_MODE_STEP: 2,
	EXEC_MODE_NEXT: 3,
	EXEC_MODE_TO_CALL: 4,
	EXEC_MODE_TO_RET: 5
}

const DEFAULT_FRAMERATE = 30; //fps

let exec_mode = exec_mode_t.EXEC_MODE_RUN;
let step_depth = 0;
let screen_ts = 0;
//let ts_freq;
let g_framerate = DEFAULT_FRAMERATE;
let g_hal;

function tamalib_init(program, breakpoints, freq) {
    let res = false;
    
    res |= cpu_init(program, breakpoints, freq);
    res |= hw_init();
    
    ts_freq = freq;
    
    return res;
}

function tamalib_release() {
    hw_release();
    cpu_release();
}

function tamalib_set_framerate(framerate) {
    g_framerate = framerate;
}

function tamalib_get_framerate() {
    return g_framerate;
}

function tamalib_register_hal(hal) {
    g_hal = hal;
}

function tamalib_set_exec_mode(mode) {
    exec_mode = mode;
    step_depth = cpu_get_depth();
    cpu_sync_ref_timestamp();
}

function tamalib_step() {
    if (exec_mode == exec_mode_t.EXEC_MODE_PAUSE) {
        return;
    }
    if (cpu_step()) {
        exec_mode = exec_mode_t.EXEC_MODE_PAUSE;
        step_depth = cpu_get_depth();
    } else {
        switch (exec_mode) {
            case exec_mode_t.EXEC_MODE_PAUSE:
            case exec_mode_t.EXEC_MODE_RUN:
                break;
                
            case exec_mode_t.EXEC_MODE_STEP:
                exec_mode = exec_mode_t.EXEC_MODE_PAUSE;
                break;
                
            case exec_mode_t.EXEC_MODE_NEXT:
                if (cpu_get_depth() <= step_depth) {
                    exec_mode = exec_mode_t.EXEC_MODE_PAUSE;
                    step_depth = cpu_get_depth();
                }
                break;
                
            case exec_mode_t.EXEC_MODE_TO_CALL:
                if (cpu_get_depth() > step_depth) {
                    exec_mode = exec_mode_t.EXEC_MODE_PAUSE;
                    step_depth = cpu_get_depth();
                }
                break;
                
            case exec_mode_t.EXEC_MODE_TO_RET:
                if (cpu_get_depth() < step_depth) {
                    exec_mode = exec_mode_t.EXEC_MODE_PAUSE;
                    step_depth = cpu_get_depth();
                }
                break;
        }
    }
}

function tamalib_mainloop() {
    let ts;
    
    while (!g_hal.handler()) {
        tamalib_step();
        
        /* Update the screen @ g_framerate fps */
        ts = g_hal.get_timestamp();
        if (ts - screen_ts >= ts_freq / g_framerate) {
            screen_ts = ts;
            g_hal.update_screen();
        }
    }
}