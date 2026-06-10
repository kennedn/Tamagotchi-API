var E0C6S46_SUPPORT						= true;
var E0C6S48_SUPPORT						= false;

const NULL = 0;

var log_level_t = {
  LOG_ERROR: 0x1,
  LOG_INFO: (0x1 << 1),
  LOG_MEMORY: (0x1 << 2),
  LOG_CPU: (0x1 << 3),
};

var showing_attention_icon = false;
var selected_icon = -1;

/* The Hardware Abstraction Layer
 * NOTE: This structure acts as an abstraction layer between TamaLIB and the OS/SDK.
 * All pointers MUST be implemented, but some implementations can be left empty.
 */
var hal_t = {    
    /* Memory allocation functions
    * NOTE: Needed only if breakpoints support is required.
    */
    malloc: (size) => {
        // unused
    },
    free: (ptr) => {
        // unused
    },

    /* What to do if the CPU has halted */
    halt: () => {
        // unused
    },

    /* Log related function
    * NOTE: Needed only if log messages are required.
    */
    is_log_enabled: (level) => {
        return false;
    },
    log: (level, buff, ...args) => {
        return; // unused
    },

    /* Clock related functions
    * NOTE: Timestamps granularity is configured with tamalib_init(), an accuracy
    * of ~30 us (1/32768) is required for a cycle accurate emulation.
    */
    sleep_until: (ts) => {
        /* No-op: real-time pacing is handled by the driver loop (see manager.js),
         * which steps the CPU in bursts and yields the event loop between them.
         * Busy-waiting here would pin a core per emulator. `ref_ts` still advances
         * as a virtual clock inside wait_for_cycles, so timing stays accurate. */
    },
    get_timestamp: () => {
        return Date.now() * 1000; //micro seconds
    },

    /* Screen related functions
    * NOTE: In case of direct hardware access to pixels, the set_XXXX() functions
    * (called for each pixel/icon update) can directly drive them, otherwise they
    * should just store the data in a buffer and let update_screen() do the actual
    * rendering (at 30 fps).
    */
    update_screen: () => {
        return 0;
        // Implement this function
    },
    set_lcd_matrix: (x, y, val) => {
        /*if (showScreen) {
            ctx.fillStyle = val? '#000000' : '#AAAAAA';
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize - 1 , pixelSize - 1);
        }*/
    },
    set_lcd_icon: (icon, val) => {
        // Implement this function
        if (icon === 7)
        {
            showing_attention_icon = val;
        }
        else
        {
            if (!val && selected_icon == icon)
            {
            selected_icon = -1;
            }
            else if (val)
            {
            selected_icon = icon;
            }
        }
    },

    /* Sound related functions
    * NOTE: set_frequency() changes the output frequency of the sound in dHz, while
    * play_frequency() decides whether the sound should be heard or not.
    */
    set_frequency: (freq) => {
        // Implement this function
    },
    play_frequency: (en) => {
        // Implement this function
    },

    /* Event handler from the main app (if any)
    * NOTE: This function usually handles button related
    */
    handler: () => {
        // Implement this function
        return 1;
    }
}