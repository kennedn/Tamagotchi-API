const fs = require('fs');
const vm = require('vm');
const path = require('path');

function loadScriptsIntoContext(files, preludeCode = null) {
    const context = {
        console,
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