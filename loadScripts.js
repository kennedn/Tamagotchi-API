const fs = require('fs');
const vm = require('vm');
const path = require('path');
const logger = require('./logger');

function createAttentionNotifier() {
    const endpoint = process.env.ALERT_ENDPOINT;

    return (showingAttention = true) => {
        if (!showingAttention) {
            logger.info(`Attention alert cleared`);
            return;
        }

        if (!endpoint) {
            logger.error('Cannot send attention alert: ALERT_ENDPOINT is not configured');
            return;
        }

        logger.info(`Attention alert triggered, sending notification to ${endpoint}`);

        void fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Tamagotchi needs attention', title: 'Tamagotchi', priority: '1' }),
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        }).catch((err) => {
            logger.error(`Failed to send attention alert: ${err.message}`);
        });
    };
}

function loadScriptsIntoContext(files, preludeCode = null) {
    const context = {
        console: logger,
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
