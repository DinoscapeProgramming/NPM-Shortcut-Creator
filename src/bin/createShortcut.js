#! /usr/bin/env node
const shortcuts = require('../shortcutCreator.js');

shortcuts.createShortcut.apply(this, [
  ...[
    process.argv[3],
    new Function(process.argv[4] || ''),
    JSON.parse(process.argv[5] || '[]')
  ],
  ...(process.argv[6]) ? [
    JSON.parse(process.argv[6])
  ] : []
]).then((result) => {
  console.log(result);
});