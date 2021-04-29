const path = require('path');
const rollup = require('../src/rollup');

const entry = path.join(__dirname, './main');
rollup(entry, {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
});
