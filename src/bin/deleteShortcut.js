#! /usr/bin/env node
const shortcuts = require('../shortcutCreator.js');

shortcuts.deleteShortcut.apply(this, [
  ...[
    process.argv[3]
  ],
  ...(process.argv[4]) ? [
    process.argv[4]
  ] : []
]).then((result) => {
  console.log(result);
});