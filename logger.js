const timestampedConsole = Object.create(console);

for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
    timestampedConsole[level] = (...args) => {
        console[level](`[${new Date().toISOString()}]`, ...args);
    };
}

module.exports = timestampedConsole;
