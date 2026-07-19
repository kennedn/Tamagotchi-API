const fs = require('fs');
const vm = require('vm');
const path = require('path');

const DEFAULT_ALERT_COOLOFF_MS = 60 * 60 * 1000;

function createAttentionNotifier() {
    const endpoint = process.env.ALERT_ENDPOINT;
    const configuredCooloff = Number(process.env.ALERT_COOLOFF_MS);
    const cooloffMs = Number.isFinite(configuredCooloff) && configuredCooloff >= 0
        ? configuredCooloff
        : DEFAULT_ALERT_COOLOFF_MS;
    let lastSentAt = 0;

    return (showingAttention = true) => {
        if (!showingAttention) {
            lastSentAt = 0;
            return;
        }

        const now = Date.now();
        if (now - lastSentAt < cooloffMs) {
            return;
        }

        lastSentAt = now;
        if (!endpoint) {
            console.error('Cannot send attention alert: ALERT_ENDPOINT is not configured');
            return;
        }

        void fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Tamagotchi needs attention' }),
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        }).catch((err) => {
            console.error(`Failed to send attention alert: ${err.message}`);
        });
    };
}

function loadScriptsIntoContext(files, preludeCode = null) {
    const context = {
        console,
        notifyAttention: createAttentionNotifier(),
        setTimeout,
        setInterval,
        clearInterval,
        clearTimeout,
    };

    context.global = context; // important!

    const vmContext = vm.createContext(context);

    // Run any inline code (e.g. the ROM) before the on-disk scripts, so that
    // globals like `my_program` are available when hw.js etc. reference them.
    if (preludeCode) {
        vm.runInContext(preludeCode, vmContext, { filename: 'prelude.js' });
    }

    for (const file of files) {
        const code = fs.readFileSync(path.resolve(__dirname, file), 'utf-8');
        vm.runInContext(code, vmContext, { filename: file });
    }

    return context;
}

module.exports = loadScriptsIntoContext;
